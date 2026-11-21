import {
  BOX10_APPROACH,
  BOX10_GUIDE_WORDING,
  BOX10_INSTRUCTIONS_WORDING,
  CATEGORY_LABEL,
  ENTITY_LABEL,
  FISH_NOTE,
  METHOD_LABEL,
  SAMPLE_CSV,
  STATUS,
  STATUS_ORDER,
  TIN_WARNING,
  backupFacts,
  classifyList,
  deadlineFacts,
  federalSourceKeys,
  filingOptionFacts,
  formatEt,
  formatUsd,
  getThreshold,
  ncFacts,
  normalizeCategory,
  normalizeEntity,
  normalizeMethod,
  parseCsv,
  penaltySentences,
  redactText,
  sourceByKey,
} from "./classify.js";

const METHOD_OPTIONS = ["check", "cash", "ach", "card", "paypal", "unknown"];
const ENTITY_OPTIONS = ["individual", "partnership", "llc", "corp", "attorney", "medical_provider", "tax_exempt", "government", "unknown"];
const CATEGORY_OPTIONS = ["services", "rent", "royalties", "prizes", "other", "medical", "attorney_gross", "merchandise", "unknown"];

const intake = document.querySelector("#intake");
const payeeMount = document.querySelector("#payee-mount");
const formErrors = document.querySelector("#form-errors");
const tinWarning = document.querySelector("#tin-warning");
const results = document.querySelector("#results");
const report = document.querySelector("#report");
const yearSelect = document.querySelector("#tax-year");
const otherYearWrap = document.querySelector("#other-year-wrap");
const otherYear = document.querySelector("#tax-year-other");
const yearNote = document.querySelector("#year-note");

const payeeTable = el("table", { class: "payee-table" });
const payeeHead = document.createElement("thead");
const payeeBody = document.createElement("tbody");
payeeHead.append(el("tr", {},
  ...["Name", "Amount", "Payment method", "Entity type", "Payment category", "W-9", "TIN", "Last 4", "Federal withholding", "Remove"].map((label) => el("th", { scope: "col" }, label)),
));
payeeTable.append(
  payeeHead,
  payeeBody,
  el("caption", {}, "Do not type a full SSN or EIN. A full number is removed. At most the last four digits are kept."),
);
payeeMount.append(payeeTable);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function select(field, options, selected, labels = {}) {
  const node = el("select", { "data-field": field });
  for (const value of options) {
    const option = el("option", { value }, labels[value] || value);
    if (value === selected) option.selected = true;
    node.append(option);
  }
  if ([...node.options].some((option) => option.value === selected)) node.value = selected;
  return node;
}

function blankRow() {
  return {
    name: "",
    amount: "",
    paymentMethod: "unknown",
    entity: "unknown",
    category: "services",
    w9Status: "missing",
    tinStatus: "missing",
    tinLast4: "",
    federalWithholding: "no",
  };
}

function showTinWarning() {
  tinWarning.hidden = false;
  tinWarning.textContent = TIN_WARNING;
}

function applyLast4(tr, last4) {
  if (!last4) return;
  const tin = tr.querySelector("[data-field=tin]");
  const box = tr.querySelector("[data-field=last4]");
  if (tin.value === "missing") tin.value = "last4";
  if (!box.value) box.value = last4;
}

function watchText(input, tr) {
  input.addEventListener("input", () => {
    const original = input.value;
    const redacted = redactText(original);
    if (redacted.redacted) {
      input.value = input.dataset.field === "last4" ? (redacted.last4 || "") : redacted.text;
      if (input.dataset.field === "amount" && redacted.text.replace(/[$,\s]/g, "") === "") input.value = "";
      showTinWarning();
      applyLast4(tr, redacted.last4);
      return;
    }
    if (input.dataset.field === "last4") {
      const digits = original.replace(/\D/g, "");
      if (digits !== original || digits.length > 4) {
        input.value = digits.slice(-4);
        if (original.replace(/\D/g, "").length > 4) {
          tinWarning.hidden = false;
          tinWarning.textContent = "Only the last four digits can be entered. The rest was removed.";
        }
      }
    }
  });
}

function createRow(data) {
  const tr = document.createElement("tr");
  const name = el("input", { "data-field": "name", type: "text", value: data.name || "", maxlength: "160", autocomplete: "off" });
  const amount = el("input", { "data-field": "amount", type: "text", inputmode: "decimal", value: data.amount ?? "", autocomplete: "off" });
  const last4 = el("input", { "data-field": "last4", type: "text", inputmode: "numeric", maxlength: "4", value: data.tinLast4 || "", autocomplete: "off" });
  watchText(name, tr);
  watchText(amount, tr);
  watchText(last4, tr);
  const remove = el("button", { type: "button", class: "button secondary" }, "Remove");
  remove.addEventListener("click", () => {
    tr.remove();
    if (!payeeBody.rows.length) payeeBody.append(createRow(blankRow()));
    refreshLabels();
  });
  tr.append(
    el("td", {}, name),
    el("td", { class: "col-amount" }, amount),
    el("td", {}, select("method", METHOD_OPTIONS, data.paymentMethod || "unknown", METHOD_LABEL)),
    el("td", {}, select("entity", ENTITY_OPTIONS, data.entity || "unknown", ENTITY_LABEL)),
    el("td", {}, select("category", CATEGORY_OPTIONS, data.category || "services", CATEGORY_LABEL)),
    el("td", {}, select("w9", ["have", "missing"], data.w9Status || "missing", { have: "Have", missing: "Missing" })),
    el("td", {}, select("tin", ["have", "missing", "last4"], data.tinStatus || "missing", { have: "Have", missing: "Missing", last4: "Last 4 only" })),
    el("td", { class: "col-last4" }, last4),
    el("td", {}, select("withholding", ["no", "yes"], data.federalWithholding || "no", { no: "No", yes: "Yes" })),
    el("td", {}, remove),
  );
  return tr;
}

function refreshLabels() {
  [...payeeBody.rows].forEach((tr, index) => {
    const n = index + 1;
    const labels = {
      name: `Payee name, row ${n}`,
      amount: `Amount, row ${n}`,
      method: `Payment method, row ${n}`,
      entity: `Entity type, row ${n}`,
      category: `Payment category, row ${n}`,
      w9: `W-9 status, row ${n}`,
      tin: `TIN status, row ${n}`,
      last4: `TIN last four, row ${n}`,
      withholding: `Federal withholding, row ${n}`,
    };
    for (const [field, label] of Object.entries(labels)) {
      tr.querySelector(`[data-field=${field}]`).setAttribute("aria-label", label);
    }
    tr.querySelector("button").setAttribute("aria-label", `Remove row ${n}`);
  });
}

function addRow(data = blankRow()) {
  payeeBody.append(createRow(data));
  refreshLabels();
}

function readRows() {
  return [...payeeBody.rows].map((tr) => ({
    name: tr.querySelector("[data-field=name]").value,
    amount: tr.querySelector("[data-field=amount]").value,
    paymentMethod: tr.querySelector("[data-field=method]").value,
    entityType: tr.querySelector("[data-field=entity]").value,
    category: tr.querySelector("[data-field=category]").value,
    w9Status: tr.querySelector("[data-field=w9]").value,
    tinStatus: tr.querySelector("[data-field=tin]").value,
    tinLast4: tr.querySelector("[data-field=last4]").value,
    federalWithholding: tr.querySelector("[data-field=withholding]").value,
  }));
}

function writeRows(rows) {
  payeeBody.replaceChildren();
  const visible = rows.length ? rows : [blankRow()];
  for (const row of visible) payeeBody.append(createRow(row));
  refreshLabels();
}

function scrubForTable(raw) {
  let stripped = false;
  const name = redactText(raw.name);
  const amount = redactText(raw.amount);
  const last4 = redactText(raw.tinLast4 || "");
  if (name.redacted || amount.redacted || last4.redacted) stripped = true;
  let tinStatus = raw.tinStatus || "missing";
  let tinLast4 = last4.redacted ? last4.last4 : (last4.text || "").replace(/\D/g, "").slice(-4);
  if (tinLast4 && tinLast4.length !== 4) tinLast4 = "";
  const stray = name.last4 || amount.last4;
  if (!tinLast4 && stray) {
    tinLast4 = stray;
    if (tinStatus === "missing") tinStatus = "last4";
  }
  if (last4.redacted) tinStatus = "last4";
  let amountText = amount.text;
  if (amount.redacted && amount.text.replace(/[$,\s]/g, "") === "") amountText = "";
  const categorySource = raw.category ?? "";
  const withholding = String(raw.federalWithholding || "").trim().toLowerCase();
  return {
    stripped,
    row: {
      name: name.text,
      amount: amountText,
      paymentMethod: normalizeMethod(raw.paymentMethod ?? ""),
      entity: normalizeEntity(raw.entity ?? raw.entityType ?? ""),
      category: String(categorySource).trim() ? normalizeCategory(categorySource) : "unknown",
      w9Status: normalizeChoice(raw.w9Status, ["have", "yes", "y", "on file", "have w-9", "have w9"], "have", "missing"),
      tinStatus: canonicalTin(raw.tinStatus, tinStatus),
      tinLast4: tinLast4 || "",
      federalWithholding: ["yes", "y", "true", "1", "withheld"].includes(withholding) ? "yes" : "no",
    },
  };
}

function normalizeChoice(value, yesValues, yes, no) {
  return yesValues.includes(String(value || "").trim().toLowerCase()) ? yes : no;
}

function canonicalTin(value, current) {
  if (current === "last4") return "last4";
  const text = String(value || "").trim().toLowerCase();
  if (["have", "yes", "y", "have tin", "have it"].includes(text)) return "have";
  if (["last4", "last 4", "last four", "last 4 only", "last4 only"].includes(text) || /^\d{4}$/.test(text)) return "last4";
  return "missing";
}

function loadParsed(parsed) {
  if (!parsed.length) {
    showErrors(["No payee rows were found. Use the sample CSV as a pattern."]);
    return;
  }
  let stripped = false;
  const rows = parsed.map((raw) => {
    const cleaned = scrubForTable(raw);
    if (cleaned.stripped) stripped = true;
    return cleaned.row;
  });
  writeRows(rows);
  if (stripped) showTinWarning();
}

function readYear() {
  if (yearSelect.value === "2025" || yearSelect.value === "2026") return Number(yearSelect.value);
  if (yearSelect.value === "other") {
    const year = Number(otherYear.value);
    if (Number.isInteger(year) && year >= 2000 && year <= 2100) return year;
  }
  return null;
}

function updateYearNote() {
  otherYearWrap.hidden = yearSelect.value !== "other";
  yearNote.replaceChildren();
  const year = readYear();
  if (!year) {
    yearNote.textContent = "Choose the calendar year the payments were made. After 2026, this page will not guess the inflation-adjusted amount.";
    return;
  }
  const nec = getThreshold("services", year);
  yearNote.append(nec.summary + " ");
  const source = sourceByKey(nec.known ? "irs-required" : "p1099");
  yearNote.append(el("a", { href: source.url }, source.label));
  yearNote.append(" Other boxes can use a different amount. This page will not fill in a figure the rules do not state.");
}

function showErrors(messages) {
  formErrors.hidden = false;
  formErrors.replaceChildren(el("p", {}, "Fix these items before the check runs."));
  formErrors.append(el("ul", {}, ...messages.map((message) => el("li", {}, message))));
  formErrors.focus?.();
  formErrors.tabIndex = -1;
  formErrors.focus();
}

function clearErrors() {
  formErrors.hidden = true;
  formErrors.replaceChildren();
}

function linkList(keys) {
  const list = el("ul", { class: "source-list" });
  for (const key of keys) {
    const source = sourceByKey(key);
    list.append(el("li", {}, el("a", { href: source.url }, source.label)));
  }
  return list;
}

function paragraphList(items) {
  return el("ul", {}, ...items.map((item) => el("li", {}, item)));
}

function thresholdBlock(model) {
  const section = el("section");
  section.append(el("h2", {}, "Threshold used"));
  const items = [el("li", {},
    "Form 1099-NEC, nonemployee compensation: ",
    model.necThreshold.summary,
    " ",
    ...sourceAnchors(model.necThreshold.sourceKeys),
  )];
  const seen = new Set(["services"]);
  for (const result of model.results) {
    if (seen.has(result.category)) continue;
    seen.add(result.category);
    items.push(el("li", {},
      `${result.categoryLabel}: `,
      result.threshold.summary,
      " ",
      ...sourceAnchors(result.threshold.sourceKeys),
    ));
  }
  section.append(el("ul", {}, ...items));
  section.append(el("p", {}, "Countable amount excludes credit card, debit card, and payment-app payments. Checks, cash, and ordinary bank transfers you make are counted. If the method is unknown, the row is marked for review."));
  section.append(el("p", {}, FISH_NOTE));
  if (model.results.some((result) => result.conflict)) {
    section.append(el("h3", {}, "Form 1099-MISC box 10 conflict"));
    section.append(el("p", {}, BOX10_INSTRUCTIONS_WORDING));
    section.append(el("p", {}, BOX10_GUIDE_WORDING));
    section.append(el("p", {}, BOX10_APPROACH));
  }
  return section;
}

const SHORT_SOURCE = {
  "irs-required": "IRS filing requirement",
  i1099mec: "Form instructions",
  p1099: "Pub. 1099",
  iris: "IRIS",
  tc801: "Tax Topic 801",
  tc307: "Tax Topic 307",
  bwh: "Backup withholding",
  "irs-penalties": "Information return penalties",
  "irs-guide": "IRS guide",
  "irs-ic": "Independent contractor forms",
  w9: "About Form W-9",
  fw9: "Form W-9 PDF",
  iw9: "Form W-9 requester instructions",
  "enc3-faq": "eNC3 questions",
  "enc3-pen": "eNC3 penalties",
  "nc-1099m": "Form NC-1099M",
  "nc-notice": "North Carolina withholding notice",
  "ta-19-1": "Directive TA-19-1",
};

function sourceAnchors(keys, compact = false) {
  const nodes = [];
  keys.forEach((key, index) => {
    if (index) nodes.push(document.createTextNode("; "));
    const source = sourceByKey(key);
    nodes.push(el("a", { href: source.url }, compact ? (SHORT_SOURCE[key] || source.label) : source.label));
  });
  return nodes;
}

function thresholdCell(result) {
  const cell = el("td");
  if (result.conflict) {
    cell.append(
      el("p", {}, result.conflict.instructions),
      el("p", {}, result.conflict.guide),
      el("p", {}, result.conflict.approach),
    );
  } else {
    cell.append(el("p", {}, result.threshold.summary));
  }
  cell.append(el("p", {}, "Source: ", ...sourceAnchors(result.threshold.sourceKeys, true)));
  return cell;
}

function resultRow(result) {
  const countable = el("td");
  countable.append(formatUsd(result.countable));
  if (result.excludedAmount > 0) {
    countable.append(el("div", { class: "note" }, `Excludes ${formatUsd(result.excludedAmount)} paid by card or app`));
  }
  return el("tr", { class: `status-${result.status}` },
    el("td", {}, result.name),
    el("td", {}, result.entityLabel),
    el("td", {}, String(result.year)),
    countable,
    el("td", {}, result.howPaid),
    thresholdCell(result),
    el("td", {}, result.apparentForm),
    el("td", {}, el("span", { class: `status status-${result.status}` }, result.statusLabel)),
    el("td", {}, result.nextStep),
  );
}

function resultCard(result) {
  return el("article", { class: `card status-${result.status}` },
    el("h3", {}, result.name),
    el("p", {}, el("span", { class: `status status-${result.status}` }, result.statusLabel)),
    el("p", {}, `Entity: ${result.entityLabel}. Tax year: ${result.year}.`),
    el("p", {}, `Countable amount: ${formatUsd(result.countable)}.`),
    result.excludedAmount > 0 ? el("p", {}, `Excludes ${formatUsd(result.excludedAmount)} paid by card or app.`) : null,
    el("p", {}, `How paid: ${result.howPaid}.`),
    el("p", {}, result.conflict ? `${result.conflict.instructions} ${result.conflict.guide}` : result.threshold.summary),
    el("p", {}, `Apparent form: ${result.apparentForm}.`),
    el("p", {}, `Next step: ${result.nextStep}`),
  );
}

function summaryItem(status, count) {
  if (!count) return null;
  const labels = {
    [STATUS.NEEDS_1099]: "Needs 1099",
    [STATUS.MISSING_W9]: "Missing W-9 or TIN",
    [STATUS.METHOD_REVIEW]: "Payment method needs review",
    [STATUS.NEEDS_REVIEW]: "Needs review",
    [STATUS.BELOW]: "Below threshold",
    [STATUS.EXEMPT]: "Likely exempt",
  };
  return el("li", { class: status }, `${count} · ${labels[status]}`);
}

function renderReport(model, context) {
  report.replaceChildren();
  const title = el("h2", { class: "report-title", id: "report-title", tabindex: "-1" }, "1099 Readiness Check report");
  report.append(title);
  report.append(el("p", { class: "report-meta" }, `Prepared ${formatEt(context.preparedAt)}.`));
  report.append(el("p", { class: "report-meta" }, `Tax year ${model.year}. Business: ${context.business}.`));
  report.append(el("p", { class: "report-meta" }, context.nc
    ? "North Carolina note: included below."
    : "North Carolina note: not included."));
  report.append(el("p", { class: "report-meta" }, "This check covers only the payees you entered. Personal payments are not reportable."));
  if (context.incomplete) {
    report.append(el("p", { class: "report-meta" }, "You marked this list as incomplete. Counts cover only these rows."));
  }
  if (model.combined) {
    report.append(el("p", { class: "report-meta" }, "Rows for the same payee and the same payment category were added together."));
  }
  if (model.dropped) {
    report.append(el("p", { class: "report-meta" }, "Rows without both a name and an amount were left out."));
  }
  for (const warning of model.warnings) report.append(el("p", { class: "warning" }, warning));

  report.append(thresholdBlock(model));

  const counts = el("ul", { class: "summary" });
  for (const status of STATUS_ORDER) {
    const item = summaryItem(status, model.counts[status]);
    if (item) counts.append(item);
  }
  report.append(counts);
  if (model.results.some((result) => result.cpa)) {
    report.append(el("p", {}, "Rows that mention a CPA are close calls. Read the official wording and decide with a tax professional."));
  }

  const tableSection = el("section");
  tableSection.append(el("h2", {}, "Readiness table"));
  tableSection.append(el("p", {}, "Sorted in this order: needs 1099; missing W-9 or TIN; payment method needs review (possible 1099-K); threshold not stated, when the rules give no dollar amount; below threshold; likely exempt."));
  const table = el("table", { id: "readiness-table" });
  table.append(el("caption", {}, "Payee readiness, sorted by status."));
  table.append(el("thead", {}, el("tr", {},
    ...["Name", "Entity type", "Tax year", "Countable amount", "How paid", "Threshold and source", "Apparent form", "Status", "Next step"].map((label) => el("th", { scope: "col" }, label)),
  )));
  table.append(el("tbody", {}, ...model.results.map(resultRow)));
  tableSection.append(el("div", { class: "result-table-wrap table-scroll" }, table));
  tableSection.append(el("div", { class: "result-cards" }, ...model.results.map(resultCard)));
  report.append(tableSection);

  const w9 = el("section");
  w9.append(el("h2", {}, "W-9 request list"));
  if (!model.w9Requests.length) {
    w9.append(el("p", {}, "No payee in this list is missing a W-9 or TIN, and none has an unconfirmed entity type."));
  } else {
    w9.append(el("p", {}, "Send one note per payee. Point them to the official Form W-9. Do not ask them to reply with a full TIN."));
    const all = model.w9Requests.map((item) => item.script).join("\n\n");
    w9.append(el("p", {}, copyButton(all, "Copy every request")));
    for (const item of model.w9Requests) {
      w9.append(el("div", { class: "w9-item" },
        el("h3", {}, item.name),
        el("p", {}, item.reasons.join(". ") + "."),
        scriptBox(item.script),
        copyButton(item.script, "Copy this request"),
      ));
    }
  }
  report.append(w9);

  const deadlines = deadlineFacts(model.year);
  const deadlineSection = el("section");
  deadlineSection.append(el("h2", {}, "Deadlines"));
  deadlineSection.append(paragraphList([deadlines.nec, deadlines.misc, deadlines.weekend]));
  deadlineSection.append(el("p", { class: "source-line" }, "Sources: ", ...sourceAnchors(deadlines.sourceKeys)));
  report.append(deadlineSection);

  const filing = filingOptionFacts(model.needs1099Count);
  const filingSection = el("section");
  filingSection.append(el("h2", {}, "Filing options"));
  filingSection.append(paragraphList(filing.items));
  if (context.nc) {
    filingSection.append(el("p", {}, "If North Carolina withholding applies, file Form NC-3 and the required statements through eNC3 by January 31."));
  }
  filingSection.append(el("p", { class: "source-line" }, "Sources: ", ...sourceAnchors(filing.sourceKeys)));
  report.append(filingSection);

  const backup = backupFacts();
  const backupSection = el("section");
  backupSection.append(el("h2", {}, "Backup withholding"));
  backupSection.append(paragraphList(backup.items));
  backupSection.append(el("p", { class: "source-line" }, "Sources: ", ...sourceAnchors(backup.sourceKeys)));
  report.append(backupSection);

  if (context.nc) {
    const nc = ncFacts(model.year);
    const ncSection = el("section");
    ncSection.append(el("h2", {}, "North Carolina note"));
    ncSection.append(paragraphList(nc.items));
    ncSection.append(el("p", { class: "source-line" }, "Sources: ", ...sourceAnchors(nc.sourceKeys)));
    report.append(ncSection);
  }

  const penaltySection = el("section");
  penaltySection.append(el("h2", {}, "Penalties"));
  penaltySection.append(paragraphList(penaltySentences(model.year)));
  penaltySection.append(el("p", { class: "source-line" }, "Source: ", ...sourceAnchors(["irs-penalties"])));
  report.append(penaltySection);

  const sources = el("section");
  sources.append(el("h2", {}, "Official source links"));
  const keys = federalSourceKeys();
  if (context.nc) keys.push(...ncFacts(model.year).sourceKeys);
  sources.append(linkList(keys));
  report.append(sources);

  const limits = el("section");
  limits.append(el("h2", {}, "Limits"));
  limits.append(paragraphList([
    "This is not tax advice.",
    "This tool does not file, pay, or contact the IRS or a state agency.",
    "Confirm every figure and deadline on the official sites linked above.",
    "Use a CPA or enrolled agent for edge cases, including box 10, a missed withholding deposit, and employee-versus-contractor questions.",
    "A clean table is not a guarantee the IRS will agree.",
    "Disregarded-entity and name-mismatch questions belong with a CPA or enrolled agent.",
  ]));
  report.append(limits);
  report.append(el("p", { class: "report-footer" }, "1099-CHECK"));
  const back = el("button", { type: "button", class: "button secondary" }, "Back to the full page");
  const printFromPreview = el("button", { type: "button", class: "button primary" }, "Print or save PDF");
  back.addEventListener("click", () => {
    document.body.classList.remove("print-preview");
    document.querySelector("#print-view").focus();
  });
  printFromPreview.addEventListener("click", () => window.print());
  report.append(el("p", { class: "preview-bar preview-only" }, printFromPreview, back));
  results.hidden = false;
  title.focus();
}

function scriptBox(text) {
  const box = el("textarea", { readonly: "readonly", rows: "4" });
  box.value = text;
  return box;
}

function copyButton(text, label) {
  const button = el("button", { type: "button", class: "button secondary" }, label);
  button.addEventListener("click", async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select the text and copy it";
    }
    setTimeout(() => { button.textContent = original; }, 2000);
  });
  return button;
}

function runCheck() {
  clearErrors();
  const errors = [];
  const year = readYear();
  const business = document.querySelector("#business-type").value.trim();
  const ncChoice = document.querySelector("input[name=nc]:checked");
  if (!year) errors.push("Choose a tax year. For a year after 2026, enter the calendar year. The check will not guess the inflation-adjusted amount.");
  if (!business) errors.push("Enter the type of business.");
  if (!ncChoice) errors.push("Say whether this business or any payees are in North Carolina.");
  const scrubbed = readRows().map((raw) => scrubForTable(raw));
  if (scrubbed.some((item) => item.stripped)) showTinWarning();
  writeRows(scrubbed.map((item) => item.row));
  const model = year ? classifyList(readRows(), year) : null;
  if (!model || model.results.length === 0) {
    errors.push("Add at least one payee with a name and an amount. Do not include a full TIN.");
  }
  if (errors.length) {
    showErrors(errors);
    results.hidden = true;
    return;
  }
  renderReport(model, {
    preparedAt: new Date(),
    business,
    nc: ncChoice.value === "yes",
    incomplete: document.querySelector("#list-incomplete").checked,
  });
}

yearSelect.addEventListener("change", updateYearNote);
otherYear.addEventListener("input", updateYearNote);
document.querySelector("#add-row").addEventListener("click", () => {
  addRow();
  payeeBody.rows[payeeBody.rows.length - 1].querySelector("[data-field=name]").focus();
});
document.querySelector("#load-sample").addEventListener("click", () => loadParsed(parseCsv(SAMPLE_CSV)));
document.querySelector("#load-paste").addEventListener("click", () => loadParsed(parseCsv(document.querySelector("#csv-paste").value)));
document.querySelector("#csv-file").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (/\.xlsx?$/i.test(file.name)) {
    showErrors(["This page reads CSV and pasted cells. In Excel, choose Save As, then CSV, and upload that file."]);
    return;
  }
  loadParsed(parseCsv(await file.text()));
});
document.querySelector("#print-button").addEventListener("click", () => window.print());
document.querySelector("#print-view").addEventListener("click", () => {
  document.body.classList.add("print-preview");
  document.querySelector("#report-title")?.focus();
});
intake.addEventListener("submit", (event) => {
  event.preventDefault();
  runCheck();
});

addRow();
updateYearNote();

const params = new URLSearchParams(location.search);
if (params.has("demo")) {
  yearSelect.value = "2026";
  updateYearNote();
  document.querySelector("#business-type").value = "Home-improvement contractor";
  document.querySelector(params.get("nc") === "yes" ? "#nc-yes" : "#nc-no").checked = true;
  loadParsed(parseCsv(SAMPLE_CSV));
  runCheck();
  if (params.has("print")) document.body.classList.add("print-preview");
}
