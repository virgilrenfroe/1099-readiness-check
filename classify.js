/**
 * 1099 Readiness Check — classification rules.
 * Dollar amounts, deadlines, and URLs come only from the project rule set.
 * This module does not contact the IRS or store a full TIN.
 */

export const IRS_ORIGIN = "https://www.irs.gov/";
export const NC_ORIGIN = "https://www.ncdor.gov/";

export const SOURCES = [
  {
    key: "irs-required",
    agency: "irs",
    path: "businesses/small-businesses-self-employed/am-i-required-to-file-a-form-1099-or-other-information-return",
    label: "Am I required to file a Form 1099 or other information return?",
  },
  {
    key: "i1099mec",
    agency: "irs",
    path: "instructions/i1099mec",
    label: "Instructions for Forms 1099-MISC and 1099-NEC",
  },
  {
    key: "p1099",
    agency: "irs",
    path: "publications/p1099",
    label: "Publication 1099",
  },
  {
    key: "iris",
    agency: "irs",
    path: "filing/e-file-information-returns-with-iris",
    label: "E-file information returns with IRIS",
  },
  {
    key: "tc801",
    agency: "irs",
    path: "taxtopics/tc801",
    label: "Tax Topic 801, Who must file information returns",
  },
  {
    key: "tc307",
    agency: "irs",
    path: "taxtopics/tc307",
    label: "Tax Topic 307, Backup withholding",
  },
  {
    key: "bwh",
    agency: "irs",
    path: "businesses/small-businesses-self-employed/backup-withholding",
    label: "Backup withholding",
  },
  {
    key: "irs-penalties",
    agency: "irs",
    path: "payments/information-return-penalties",
    label: "Information return penalties",
  },
  {
    key: "irs-guide",
    agency: "irs",
    path: "businesses/small-businesses-self-employed/a-guide-to-information-returns",
    label: "A guide to information returns",
  },
  {
    key: "irs-ic",
    agency: "irs",
    path: "businesses/small-businesses-self-employed/forms-and-associated-taxes-for-independent-contractors",
    label: "Forms and associated taxes for independent contractors",
  },
  {
    key: "w9",
    agency: "irs",
    path: "forms-pubs/about-form-w-9",
    label: "About Form W-9",
  },
  {
    key: "fw9",
    agency: "irs",
    path: "pub/irs-pdf/fw9.pdf",
    label: "Form W-9 (PDF)",
  },
  {
    key: "iw9",
    agency: "irs",
    path: "instructions/iw9",
    label: "Instructions for the requester of Form W-9",
  },
  {
    key: "enc3-faq",
    agency: "nc",
    path: "taxes-forms/withholding-tax/enc3-frequently-asked-questions",
    label: "eNC3 frequently asked questions",
  },
  {
    key: "enc3-pen",
    agency: "nc",
    path: "enc3-penalty-and-waiver-information",
    label: "eNC3 penalty and waiver information",
  },
  {
    key: "nc-1099m",
    agency: "nc",
    path: "taxes-forms/withholding-tax/withholding-tax-forms-and-instructions/nc-1099m-compensation-paid-payee",
    label: "NC-1099M, compensation paid to a payee",
  },
  {
    key: "nc-notice",
    agency: "nc",
    path: "taxes-forms/information-tax-professionals/tax-bulletins-directives-and-other-important-notices/important-notices-and-frequently-asked-questions-personal-taxes/important-notice-updates-north-carolina-withholding-tax",
    label: "Important notice: North Carolina withholding tax",
  },
  {
    key: "ta-19-1",
    agency: "nc",
    path: "taxes-forms/individual-income-tax/personal-taxes-division-directives/expansion-requirement-withhold-state-income-tax-certain-non-wage-compensation-recipients",
    label: "Directive TA-19-1",
  },
];

const SOURCE_BY_KEY = Object.fromEntries(SOURCES.map((source) => [source.key, source]));

export function sourceUrl(key) {
  const source = SOURCE_BY_KEY[key];
  if (!source) return "";
  return (source.agency === "nc" ? NC_ORIGIN : IRS_ORIGIN) + source.path;
}

export function sourceByKey(key) {
  const source = SOURCE_BY_KEY[key];
  if (!source) return null;
  return { ...source, url: sourceUrl(key) };
}

export const FW9_URL = sourceUrl("fw9");

export const STATUS = {
  NEEDS_1099: "needs-1099",
  MISSING_W9: "missing-w9-or-tin",
  METHOD_REVIEW: "payment-method-needs-review",
  NEEDS_REVIEW: "needs-review",
  BELOW: "below-threshold",
  EXEMPT: "likely-exempt",
};

export const STATUS_ORDER = [
  STATUS.NEEDS_1099,
  STATUS.MISSING_W9,
  STATUS.METHOD_REVIEW,
  STATUS.NEEDS_REVIEW,
  STATUS.BELOW,
  STATUS.EXEMPT,
];

const STATUS_LABELS = {
  [STATUS.NEEDS_1099]: "Needs 1099",
  [STATUS.MISSING_W9]: "Missing W-9 or TIN",
  [STATUS.METHOD_REVIEW]: "Payment method needs review (possible 1099-K)",
  [STATUS.BELOW]: "Below threshold",
  [STATUS.EXEMPT]: "Likely exempt",
};

export function statusLabel(status, detail) {
  if (status === STATUS.NEEDS_REVIEW && detail === "category") {
    return "Needs review — category missing";
  }
  if (status === STATUS.NEEDS_REVIEW) {
    return "Needs review — threshold not stated for this year";
  }
  return STATUS_LABELS[status] || status;
}

export const NEC_BEFORE_2026 = 600;
export const NEC_IN_2026 = 2000;
export const MISC_COMMON_2026 = 2000;
export const ROYALTIES_2026 = 10;
export const BOX10_INSTRUCTIONS = 600;
export const BOX10_GUIDE_BEFORE_2026 = 600;
export const BOX10_GUIDE_2026 = 2000;
export const BACKUP_RATE = "24%";
export const PENALTY_BASE = { within30: 60, throughAugust1: 130, afterAugust1: 340 };
export const PENALTY_DISREGARD_DUE_2026 = 680;
export const PENALTY_DISREGARD_DUE_2027 = 690;
export const EFILE_COUNT = 10;
export const IRIS_BATCH = 100;
export const TCC_DAYS = 45;
export const NC_WITHHOLDING_RATE = "4%";
export const NC_WITHHOLDING_OVER = 1500;
export const NC_LATE_PER_DAY = 50;
export const NC_LATE_MAX = 1000;
export const NC_FORMAT_PENALTY = 200;
export const FISH_BOX11 = 600;

export const TIN_WARNING =
  "A full Social Security number or EIN was removed. It was not stored. At most the last four digits were kept. Do not send a full TIN.";

export const BOX10_INSTRUCTIONS_WORDING =
  "The December 2026 instructions still say file for at least $600 in gross proceeds paid to an attorney (box 10, for example a settlement, not the attorney's fees).";

export const BOX10_GUIDE_WORDING =
  "The IRS guide (reviewed August 13, 2026) lists box 10 as $600 before 2026 and $2,000 for payments made in 2026.";

export const BOX10_APPROACH =
  "This check uses the form instructions unless a later official IRS page clearly supersedes them. It does not treat the conflict as settled. Ask a CPA or enrolled agent if box 10 is in play.";

export const METHOD_LABEL = {
  check: "Check",
  cash: "Cash",
  ach: "ACH/bank transfer",
  card: "Credit/debit card",
  paypal: "PayPal/payment app",
  unknown: "Unknown",
};

export const ENTITY_LABEL = {
  individual: "Individual",
  partnership: "Partnership",
  llc: "LLC",
  corp: "C or S corp",
  attorney: "Attorney/law firm",
  medical_provider: "Medical provider",
  tax_exempt: "Tax-exempt",
  government: "Government",
  unknown: "Unknown",
  conflict: "Rows disagree",
};

export const CATEGORY_LABEL = {
  services: "Services/NEC",
  rent: "Rent",
  royalties: "Royalties",
  prizes: "Prizes/awards",
  other: "Other income",
  medical: "Medical",
  attorney_gross: "Attorney gross proceeds",
  merchandise: "Merchandise/freight",
  unknown: "Unknown",
};

const COUNTED = new Set(["check", "cash", "ach"]);
const EXCLUDED = new Set(["card", "paypal"]);

export const SAMPLE_CSV = `name,amount,payment_method,entity_type,payment_category,w9_status,tin_status,federal_withholding
Riley Chen,2500,check,individual,services,have,have,no
Jordan Blake,400,check,individual,services,missing,missing,no
Sam Patel,3200,unknown,individual,services,have,have,no
Avery Nguyen,500,check,individual,services,have,have,no
Morgan Ellis,8000,check,C or S corp,services,have,have,no
Harper Singh,4500,check,attorney/law firm,services,have,have,no
Quinn Alvarez,3000,check,C or S corp,medical,have,have,no
Casey Brooks,180,ACH/bank transfer,individual,services,have,have,yes
Drew Okonkwo,4200,PayPal/payment app,partnership,services,have,have,no
Parker Quinn,900,check,attorney/law firm,attorney gross proceeds,have,have,no
Reese Morgan,2600,check,individual,services,missing,missing,no
`;

function matchTinAt(value, index) {
  if (index > 0 && /\d/.test(value[index - 1])) return null;
  const rest = value.slice(index);
  const patterns = [
    /^(\d{3}-\d{2}-\d{4})(?!\d)/,
    /^(\d{3}[.\s]\d{2}[.\s]\d{4})(?!\d)/,
    /^(\d{2}-\d{7})(?!\d)/,
    /^(\d{9})(?!\d)(?!\.\d)/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(rest);
    if (match) return { token: match[1], length: match[1].length };
  }
  return null;
}

export function redactText(input) {
  const original = input == null ? "" : String(input);
  let text = "";
  let redacted = false;
  let last4 = null;
  for (let index = 0; index < original.length; index += 1) {
    const found = matchTinAt(original, index);
    if (found) {
      redacted = true;
      const digits = found.token.replace(/\D/g, "");
      if (!last4) last4 = digits.slice(-4);
      index += found.length - 1;
      continue;
    }
    text += original[index];
  }
  text = text.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();
  return { text, redacted, last4 };
}

export function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

export function formatEt(date) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${formatted} ET`;
}

export function normalizeMethod(value) {
  const text = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["check", "cash", "ach", "card", "paypal", "unknown"].includes(text)) return text;
  const map = {
    check: "check",
    cheque: "check",
    cash: "cash",
    ach: "ach",
    "ach/bank transfer": "ach",
    "bank transfer": "ach",
    "bank transfers": "ach",
    bank: "ach",
    wire: "ach",
    eft: "ach",
    "direct deposit": "ach",
    card: "card",
    "credit/debit card": "card",
    "credit card": "card",
    "debit card": "card",
    credit: "card",
    debit: "card",
    paypal: "paypal",
    "paypal/payment app": "paypal",
    "payment app": "paypal",
    venmo: "paypal",
    "cash app": "paypal",
    cashapp: "paypal",
    unknown: "unknown",
    "": "unknown",
    unsure: "unknown",
    "?": "unknown",
    choose: "unknown",
  };
  return map[text] || "unknown";
}

export function normalizeEntity(value) {
  const text = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["individual", "partnership", "llc", "corp", "attorney", "medical_provider", "tax_exempt", "government", "unknown", "conflict"].includes(text)) {
    return text;
  }
  const map = {
    individual: "individual",
    person: "individual",
    "sole proprietor": "individual",
    "sole prop": "individual",
    partnership: "partnership",
    llc: "llc",
    "c or s corp": "corp",
    "c or s corporation": "corp",
    "c corp": "corp",
    "s corp": "corp",
    "c-corp": "corp",
    "s-corp": "corp",
    "c corporation": "corp",
    "s corporation": "corp",
    corporation: "corp",
    corp: "corp",
    attorney: "attorney",
    "attorney/law firm": "attorney",
    "law firm": "attorney",
    "legal services": "attorney",
    "medical provider": "medical_provider",
    "healthcare provider": "medical_provider",
    "health care provider": "medical_provider",
    doctor: "medical_provider",
    "tax-exempt": "tax_exempt",
    "tax exempt": "tax_exempt",
    nonprofit: "tax_exempt",
    "non-profit": "tax_exempt",
    "tax-exempt organization": "tax_exempt",
    government: "government",
    gov: "government",
    unknown: "unknown",
    "": "unknown",
    choose: "unknown",
  };
  return map[text] || "unknown";
}

export function normalizeCategory(value) {
  const text = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["services", "rent", "royalties", "prizes", "other", "medical", "attorney_gross", "merchandise", "unknown"].includes(text)) {
    return text;
  }
  const map = {
    services: "services",
    "services/nec": "services",
    nec: "services",
    "nonemployee compensation": "services",
    "non-employee compensation": "services",
    contractor: "services",
    subcontractor: "services",
    rent: "rent",
    rents: "rent",
    royalties: "royalties",
    royalty: "royalties",
    prizes: "prizes",
    "prizes/awards": "prizes",
    awards: "prizes",
    "prizes and awards": "prizes",
    other: "other",
    "other income": "other",
    medical: "medical",
    "medical and health care": "medical",
    "health care": "medical",
    healthcare: "medical",
    "attorney gross proceeds": "attorney_gross",
    "gross proceeds": "attorney_gross",
    "box 10": "attorney_gross",
    merchandise: "merchandise",
    "merchandise/freight": "merchandise",
    freight: "merchandise",
    goods: "merchandise",
    unknown: "unknown",
    "": "unknown",
    choose: "unknown",
  };
  return map[text] || "unknown";
}

function parseW9(value) {
  const text = String(value || "").trim().toLowerCase();
  if (["have", "yes", "y", "on file", "have w-9", "have w9", "w-9 on file"].includes(text)) {
    return "have";
  }
  return "missing";
}

function parseTinStatus(value) {
  const text = String(value || "").trim().toLowerCase();
  if (["have", "yes", "y", "have tin", "have it"].includes(text)) return "have";
  if (["last4", "last 4", "last four", "last 4 only", "last4 only"].includes(text)) return "last4";
  if (/^\d{4}$/.test(text)) return "last4";
  return "missing";
}

function parseWithholding(value) {
  const text = String(value || "").trim().toLowerCase();
  return ["yes", "y", "true", "1", "withheld"].includes(text);
}

function parseAmount(value) {
  const redacted = redactText(value);
  if (redacted.redacted && redacted.text.replace(/[$,\s]/g, "") === "") {
    return { ok: false, tinRejected: true, last4: redacted.last4 };
  }
  const cleaned = String(redacted.text || "").replace(/[$,\s]/g, "");
  if (!cleaned) return { ok: false };
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { ok: false };
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return { ok: false };
  return { ok: true, amount };
}

export function getThreshold(category, year) {
  const taxYear = Number(year);
  if (category === "services") {
    if (taxYear < 2026) {
      return {
        known: true,
        amount: NEC_BEFORE_2026,
        sourceKeys: ["irs-required", "i1099mec", "irs-guide"],
        summary: "$600 for nonemployee compensation paid before 2026.",
      };
    }
    if (taxYear === 2026) {
      return {
        known: true,
        amount: NEC_IN_2026,
        sourceKeys: ["irs-required", "i1099mec", "irs-guide"],
        summary: "$2,000 for nonemployee compensation paid in 2026.",
      };
    }
    return {
      known: false,
      amount: null,
      sourceKeys: ["p1099", "irs-required"],
      summary: "After 2026, see Pub. 1099 for the inflation-adjusted Form 1099-NEC amount. This check does not guess that figure.",
    };
  }

  if (category === "royalties") {
    if (taxYear === 2026) {
      return {
        known: true,
        amount: ROYALTIES_2026,
        sourceKeys: ["i1099mec", "irs-guide"],
        summary: "$10 for royalties paid in 2026. The same instructions state $10 for substitute payments in lieu of dividends or interest.",
      };
    }
    return {
      known: false,
      amount: null,
      sourceKeys: ["i1099mec", "irs-guide"],
      summary: taxYear > 2026
        ? "These rules state $10 for royalties in 2026. They do not state a later amount. Check the current instructions. Do not assume every box uses $2,000."
        : "These rules state $10 for royalties in 2026. They do not state the pre-2026 dollar amount. Check the Form 1099-MISC instructions.",
    };
  }

  if (category === "attorney_gross") {
    if (taxYear > 2026) {
      return {
        known: false,
        amount: null,
        conflict: true,
        guideAmount: null,
        sourceKeys: ["i1099mec", "irs-guide"],
        summary: "Box 10 is in play, and these rules do not state the dollar amount after 2026. Check the current instructions. Do not guess.",
      };
    }
    const guideAmount = taxYear < 2026 ? BOX10_GUIDE_BEFORE_2026 : BOX10_GUIDE_2026;
    return {
      known: true,
      amount: BOX10_INSTRUCTIONS,
      conflict: true,
      guideAmount,
      sourceKeys: ["i1099mec", "irs-guide"],
      summary: `Form instructions: at least $${BOX10_INSTRUCTIONS}. IRS guide for this year: $${guideAmount}.`,
    };
  }

  if (category === "merchandise") {
    return {
      known: true,
      amount: null,
      notReportable: true,
      sourceKeys: ["i1099mec"],
      summary: "Merchandise, freight, and similar items are generally not reportable on Form 1099-NEC.",
    };
  }

  if (["rent", "prizes", "other", "medical"].includes(category)) {
    if (taxYear === 2026) {
      return {
        known: true,
        amount: MISC_COMMON_2026,
        sourceKeys: ["i1099mec", "irs-guide"],
        summary: "$2,000 for this 2026 Form 1099-MISC box (rents, prizes and awards, other income, or medical and health care payments).",
      };
    }
    return {
      known: false,
      amount: null,
      sourceKeys: ["i1099mec", "irs-guide"],
      summary: taxYear > 2026
        ? "Check the current instructions for this 1099-MISC box. Do not assume every box uses $2,000. See Pub. 1099 for inflation-adjusted amounts."
        : "These rules state $2,000 for this box for 2026. They do not state the pre-2026 dollar amount. Check the Form 1099-MISC instructions. Do not assume $2,000.",
    };
  }

  return {
    known: false,
    amount: null,
    sourceKeys: ["i1099mec"],
    summary: "Choose a payment category. This check will not assume services or pick a form.",
  };
}

function resolveExemption(entity, category, w9Status) {
  if (category === "merchandise") {
    return {
      exempt: true,
      closeCall: false,
      reason: "Merchandise, freight, and similar items are generally not reportable on Form 1099-NEC. Wages belong on Form W-2, not on this check.",
    };
  }

  const w9OnFile = w9Status === "have";
  const attorneyServices = category === "services" && entity === "attorney";
  if (category === "attorney_gross" || attorneyServices) {
    return {
      exempt: false,
      closeCall: category === "attorney_gross",
      attorneyNec: attorneyServices,
      reason: attorneyServices
        ? "The corporate exemption does not apply to payments for legal services. Attorneys' fees at or above the Form 1099-NEC threshold, including fees to a law firm or other legal-services corporation, go in box 1a."
        : "Gross proceeds paid to an attorney are reported in Form 1099-MISC box 10. The two official box 10 amounts do not agree. Ask a CPA or enrolled agent.",
    };
  }

  if (category === "medical") {
    const hospitalMaybe = entity === "tax_exempt" || entity === "government";
    return {
      exempt: false,
      closeCall: hospitalMaybe,
      medical: true,
      hospitalException: hospitalMaybe,
      reason: hospitalMaybe
        ? "Medical and health care payments are generally reportable on Form 1099-MISC box 6. Limited exceptions include certain tax-exempt or government hospitals. Ask a CPA or enrolled agent. This is not a final verdict."
        : "Medical and health care payments are generally reportable on Form 1099-MISC box 6. The corporate exemption does not apply.",
    };
  }

  if (entity === "medical_provider" && category === "services") {
    return {
      exempt: false,
      closeCall: true,
      medicalOrNec: true,
      reason: "This payee is marked as a medical provider, and the category is services. Services point to Form 1099-NEC. Medical and health care payments point to Form 1099-MISC box 6. Ask a CPA or enrolled agent. This is not a final verdict.",
    };
  }

  if ((entity === "tax_exempt" || entity === "government") && category === "services" && w9OnFile) {
    return {
      exempt: true,
      closeCall: false,
      reason: entity === "tax_exempt"
        ? "Payments to a tax-exempt organization are generally not reportable on Form 1099-NEC."
        : "Payments to government are generally not reportable on Form 1099-NEC.",
    };
  }

  if ((entity === "tax_exempt" || entity === "government") && category !== "services" && category !== "unknown" && w9OnFile) {
    return {
      exempt: false,
      closeCall: true,
      reason: "These rules state that payments to a tax-exempt organization or to government are generally not reportable on Form 1099-NEC. They do not state the same result for this 1099-MISC category. Ask a CPA or enrolled agent.",
    };
  }

  if (entity === "corp" && category === "services" && w9OnFile) {
    return {
      exempt: true,
      closeCall: false,
      reason: "Payments to a corporation, including an LLC treated as a C or S corporation, generally need not be reported on Form 1099-NEC. The exemption does not apply to legal services or to medical and health care payments. This row is not marked as either one.",
    };
  }

  if (entity === "corp" && w9OnFile && !["services", "unknown", "merchandise"].includes(category)) {
    return {
      exempt: false,
      closeCall: true,
      reason: "The corporate exemption in these rules is stated for Form 1099-NEC. Ask a CPA or enrolled agent whether this 1099-MISC payment to a corporation is reportable.",
    };
  }

  return {
    exempt: false,
    closeCall: false,
    unconfirmed: !w9OnFile || entity === "unknown" || entity === "conflict",
    reason: "",
  };
}

function unconfirmedExemption(entity, category, w9Status) {
  if (["merchandise", "medical", "attorney_gross", "unknown"].includes(category)) return false;
  if (category === "services" && (entity === "attorney" || entity === "medical_provider")) return false;
  if (entity === "unknown" || entity === "conflict") return true;
  if (w9Status !== "have" && ["corp", "tax_exempt", "government"].includes(entity)) return true;
  return false;
}

function apparentForm(category, entity, exemption) {
  if (category === "merchandise") return "None — generally not on Form 1099-NEC";
  if (category === "unknown") return "Not determined";
  if (exemption && exemption.medicalOrNec) {
    return "Not a final verdict — Form 1099-NEC, or Form 1099-MISC box 6";
  }
  let form = "Not determined";
  if (category === "services" && entity === "attorney") form = "1099-NEC box 1a";
  else if (category === "services") form = "1099-NEC";
  else if (category === "rent") form = "1099-MISC (rents)";
  else if (category === "royalties") form = "1099-MISC (royalties)";
  else if (category === "prizes") form = "1099-MISC (prizes and awards)";
  else if (category === "other") form = "1099-MISC (other income)";
  else if (category === "medical") form = "1099-MISC box 6";
  else if (category === "attorney_gross") form = "1099-MISC box 10";
  if (exemption && exemption.closeCall) return `${form} — not a final verdict`;
  if (exemption && exemption.exempt && category === "services") return `${form} — generally exempt`;
  return form;
}

function describePayments(totals) {
  const order = ["check", "cash", "ach", "card", "paypal", "unknown"];
  const parts = [];
  for (const method of order) {
    if (!totals[method]) continue;
    const money = formatUsd(totals[method]);
    if (EXCLUDED.has(method)) parts.push(`${METHOD_LABEL[method]} ${money} (not counted)`);
    else parts.push(`${METHOD_LABEL[method]} ${money}`);
  }
  return parts.join("; ");
}

function nameKey(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function w9Script(name) {
  const who = String(name || "").trim() || "this payee";
  return `Please complete, sign, and return Form W-9 for ${who}. The official form is ${FW9_URL}. We need the legal name, federal tax classification, and TIN certification. Do not send a full Social Security number or EIN by email or text.`;
}

function cleanRow(raw) {
  const warnings = [];
  const take = (value) => {
    const redacted = redactText(value);
    if (redacted.redacted) warnings.push(TIN_WARNING);
    return redacted;
  };

  const name = take(raw.name);
  const methodText = take(raw.paymentMethod ?? raw.method);
  const entityText = take(raw.entityType ?? raw.entity);
  const categoryText = take(raw.category ?? raw.paymentCategory);
  const w9Text = take(raw.w9Status ?? raw.w9);
  const tinText = take(raw.tinStatus ?? raw.tin);
  const last4Text = take(raw.tinLast4 ?? raw.last4);
  const amountRaw = raw.amount;
  const amountRedacted = redactText(amountRaw);
  const amount = parseAmount(amountRaw);

  let tinStatus = parseTinStatus(tinText.text);
  let tinLast4 = null;
  if (last4Text.redacted && last4Text.last4) {
    tinLast4 = last4Text.last4;
    tinStatus = "last4";
  } else if (/^\d{4}$/.test(last4Text.text)) {
    tinLast4 = last4Text.text;
    if (tinStatus === "missing") tinStatus = "last4";
  } else if (last4Text.text) {
    tinLast4 = null;
    if (tinStatus !== "have") tinStatus = "missing";
  }
  const strayLast4 = name.last4 || methodText.last4 || entityText.last4 || categoryText.last4 || tinText.last4 || amountRedacted.last4;
  if (!tinLast4 && strayLast4) {
    tinLast4 = strayLast4;
    if (tinStatus === "missing") tinStatus = "last4";
  }
  if (tinLast4) tinLast4 = String(tinLast4).slice(-4);
  if (amount.tinRejected) warnings.push(TIN_WARNING);

  return {
    warnings,
    row: {
      name: name.text,
      amount: amount.ok ? amount.amount : null,
      amountRejectedAsTin: Boolean(amount.tinRejected),
      paymentMethod: normalizeMethod(methodText.text),
      entity: normalizeEntity(entityText.text),
      category: normalizeCategory(categoryText.text),
      w9Status: parseW9(w9Text.text),
      tinStatus,
      tinLast4,
      federalWithholding: parseWithholding(raw.federalWithholding ?? raw.withholding),
    },
  };
}

function aggregate(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = `${nameKey(row.name)}|${row.category}`;
    if (!groups.has(key)) {
      groups.set(key, {
        name: row.name,
        category: row.category,
        entity: row.entity,
        entityConflict: false,
        w9Status: row.w9Status,
        tinStatus: row.tinStatus,
        tinLast4: row.tinLast4,
        federalWithholding: row.federalWithholding,
        totals: { check: 0, cash: 0, ach: 0, card: 0, paypal: 0, unknown: 0 },
      });
    }
    const group = groups.get(key);
    if (group.entity !== row.entity) {
      group.entityConflict = true;
      group.entity = "conflict";
    }
    if (row.w9Status !== "have") group.w9Status = "missing";
    if (row.tinStatus === "missing") group.tinStatus = "missing";
    else if (row.tinStatus === "last4" && group.tinStatus !== "missing") group.tinStatus = "last4";
    if (!group.tinLast4 && row.tinLast4) group.tinLast4 = row.tinLast4;
    if (row.federalWithholding) group.federalWithholding = true;
    group.totals[row.paymentMethod] += row.amount;
  }

  return [...groups.values()].map((group) => {
    let countable = 0;
    let excludedAmount = 0;
    let unknownAmount = 0;
    for (const [method, amount] of Object.entries(group.totals)) {
      if (COUNTED.has(method)) countable += amount;
      else if (EXCLUDED.has(method)) excludedAmount += amount;
      else unknownAmount += amount;
    }
    return { ...group, countable, excludedAmount, unknownAmount };
  });
}

function buildNextStep(status, context) {
  const { exemption, threshold, agg, meets } = context;
  if (status === STATUS.EXEMPT) {
    if (agg.countable === 0 && agg.unknownAmount === 0 && agg.excludedAmount > 0) {
      return "These amounts were paid by card or payment app. The payment settlement entity reports them on Form 1099-K. Do not count them on Form 1099-NEC or Form 1099-MISC.";
    }
    return exemption.reason || "This payment appears generally not reportable by you. Keep the Form W-9 with your records.";
  }
  if (status === STATUS.NEEDS_1099) {
    const sentences = [];
    if (agg.federalWithholding && !meets) {
      sentences.push("File a 1099 even though the countable amount is under the usual threshold, because federal income tax was withheld.");
    } else if (agg.federalWithholding) {
      sentences.push("The countable amount meets the threshold. Federal income tax was also withheld, which requires a 1099 on its own.");
    } else {
      sentences.push("The countable amount meets the threshold used for the apparent form.");
    }
    if (exemption.exempt && agg.federalWithholding) {
      sentences.push("This payee would generally fall outside reporting, but withheld federal income tax still calls for a 1099. Ask a CPA or enrolled agent which form to use.");
    } else if (exemption.reason && !exemption.exempt) {
      sentences.push(exemption.reason);
    }
    if (agg.countable === 0 && agg.excludedAmount > 0) {
      sentences.push("The amount was paid by card or payment app. That is generally Form 1099-K for the processor. Ask a CPA how to report the withheld tax.");
    } else if (agg.excludedAmount > 0) {
      sentences.push("Card and payment-app amounts were left out of the countable total.");
    }
    if (agg.w9Status !== "have" || agg.tinStatus === "missing" || agg.entity === "unknown") {
      sentences.push("Request a Form W-9 before you file. Do not paste a full TIN here.");
    } else if (agg.tinStatus === "last4") {
      sentences.push("A full TIN is required on the form you file with the IRS. Truncation is allowed on the payee statement, not on the copy filed with the IRS. Use the Form W-9 you keep. Do not paste the full TIN here.");
    }
    if (agg.unknownAmount > 0) {
      sentences.push("Part of the payment method is unknown. Confirm it. Do not guess.");
    }
    return sentences.join(" ");
  }
  if (status === STATUS.MISSING_W9) {
    const sentences = [
      "Request a completed, signed Form W-9. It gives you the legal name, tax classification, and TIN certification. Do not send a full TIN through this page.",
    ];
    if (meets || (threshold.known && threshold.amount != null && agg.countable >= threshold.amount)) {
      sentences.push("The countable amount meets the stated threshold. Do not assume a corporate exemption while the Form W-9 is missing.");
    }
    if (agg.unknownAmount > 0) {
      sentences.push("Also confirm how you paid. Card and payment-app payments may be Form 1099-K items for the processor.");
    }
    if (agg.category === "unknown") {
      sentences.push("Also choose a payment category. This check will not assume one.");
    }
    return sentences.join(" ");
  }
  if (status === STATUS.METHOD_REVIEW) {
    const extra = agg.category === "unknown" ? " Also choose a payment category." : "";
    return `Confirm how this amount was paid. Credit card, debit card, and payment-app payments are generally reported on Form 1099-K by the processor. Checks, cash, and ordinary bank transfers you make are counted here. This check does not guess.${extra}`;
  }
  if (status === STATUS.NEEDS_REVIEW) {
    return threshold.summary;
  }
  if (status === STATUS.BELOW) {
    const cardNote = agg.excludedAmount > 0
      ? " Card and payment-app amounts are excluded from the countable total."
      : "";
    return `No 1099 is indicated from this countable amount alone.${cardNote} If you pay this person more, run the check again.`;
  }
  return "Review this row against the official instructions.";
}

function classifyGroup(agg, year) {
  const threshold = getThreshold(agg.category, year);
  const exemption = resolveExemption(agg.entity, agg.category, agg.w9Status);
  const meets = Boolean(threshold.known && threshold.amount != null && agg.countable >= threshold.amount);
  const under = Boolean(threshold.known && threshold.amount != null && agg.countable < threshold.amount);
  const cardOnly = agg.countable === 0 && agg.unknownAmount === 0 && agg.excludedAmount > 0;
  const infoMissing = agg.w9Status !== "have" || agg.tinStatus === "missing" || agg.entity === "unknown" || agg.entity === "conflict";
  const blocked = unconfirmedExemption(agg.entity, agg.category, agg.w9Status);
  const withholding = Boolean(agg.federalWithholding);

  let status;
  if ((agg.category === "merchandise" || exemption.exempt || cardOnly) && !withholding) {
    status = STATUS.EXEMPT;
  } else if (withholding && agg.category !== "unknown") {
    status = STATUS.NEEDS_1099;
  } else if (meets && !blocked && agg.category !== "unknown") {
    status = STATUS.NEEDS_1099;
  } else if (infoMissing) {
    status = STATUS.MISSING_W9;
  } else if (agg.unknownAmount > 0) {
    status = STATUS.METHOD_REVIEW;
  } else if (agg.category === "unknown" || !threshold.known) {
    status = STATUS.NEEDS_REVIEW;
  } else if (under) {
    status = STATUS.BELOW;
  } else if (exemption.exempt || cardOnly || agg.category === "merchandise") {
    status = STATUS.EXEMPT;
  } else {
    status = STATUS.NEEDS_REVIEW;
  }

  const detail = agg.category === "unknown" && status === STATUS.NEEDS_REVIEW ? "category" : "";
  const conflict = agg.category === "attorney_gross"
    ? {
      instructions: BOX10_INSTRUCTIONS_WORDING,
      guide: BOX10_GUIDE_WORDING,
      approach: BOX10_APPROACH,
    }
    : null;

  return {
    name: agg.name,
    entity: agg.entity,
    entityLabel: ENTITY_LABEL[agg.entity] || "Unknown",
    year: Number(year),
    category: agg.category,
    categoryLabel: CATEGORY_LABEL[agg.category] || "Unknown",
    countable: roundMoney(agg.countable),
    excludedAmount: roundMoney(agg.excludedAmount),
    unknownAmount: roundMoney(agg.unknownAmount),
    howPaid: describePayments(agg.totals),
    threshold,
    apparentForm: cardOnly && !withholding
      ? "None for you — Form 1099-K by the processor"
      : apparentForm(agg.category, agg.entity, exemption),
    status,
    statusLabel: statusLabel(status, detail),
    nextStep: buildNextStep(status, { exemption, threshold, agg, meets }),
    closeCall: Boolean(exemption.closeCall || conflict),
    cpa: Boolean(exemption.closeCall || conflict || (withholding && (exemption.exempt || cardOnly))),
    conflict,
    w9Status: agg.w9Status,
    tinStatus: agg.tinStatus,
    tinLast4: agg.tinLast4 && /^\d{4}$/.test(agg.tinLast4) ? agg.tinLast4 : null,
    federalWithholding: Boolean(agg.federalWithholding),
  };
}

function roundMoney(amount) {
  return Math.round((Number(amount) || 0) * 100) / 100;
}

export function classifyList(rawRows, year) {
  const warnings = [];
  const cleaned = [];
  let dropped = 0;
  for (const raw of rawRows || []) {
    const { row, warnings: rowWarnings } = cleanRow(raw || {});
    warnings.push(...rowWarnings);
    if (!row.name || row.amount == null) {
      dropped += 1;
      continue;
    }
    cleaned.push(row);
  }

  const inputCount = cleaned.length;
  const groups = aggregate(cleaned);
  const results = groups
    .map((group) => classifyGroup(group, year))
    .sort((a, b) => {
      const statusDelta = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusDelta !== 0) return statusDelta;
      const nameDelta = a.name.localeCompare(b.name, "en");
      if (nameDelta !== 0) return nameDelta;
      return a.category.localeCompare(b.category);
    });

  const w9ByName = new Map();
  for (const result of results) {
    const reasons = [];
    if (result.w9Status !== "have") reasons.push("W-9 missing");
    if (result.tinStatus === "missing") reasons.push("TIN missing");
    if (result.entity === "unknown" || result.entity === "conflict") reasons.push("Entity type not confirmed");
    if (reasons.length === 0) continue;
    const key = nameKey(result.name);
    if (!w9ByName.has(key)) {
      w9ByName.set(key, { name: result.name, reasons: new Set(), script: w9Script(result.name) });
    }
    for (const reason of reasons) w9ByName.get(key).reasons.add(reason);
  }
  const w9Requests = [...w9ByName.values()]
    .map((item) => ({ name: item.name, reasons: [...item.reasons], script: item.script }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const result of results) counts[result.status] += 1;

  return {
    year: Number(year),
    warnings: [...new Set(warnings)],
    dropped,
    combined: inputCount > results.length,
    results,
    w9Requests,
    counts,
    needs1099Count: counts[STATUS.NEEDS_1099],
    necThreshold: getThreshold("services", year),
  };
}

export function parseCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "");
  const grid = parseCsvGrid(source, detectDelimiter(source));
  const nonEmpty = grid.filter((row) => row.some((cell) => String(cell).trim() !== ""));
  if (nonEmpty.length === 0) return [];
  const headerMap = mapHeader(nonEmpty[0]);
  const dataRows = headerMap ? nonEmpty.slice(1) : nonEmpty;
  return dataRows.map((cells) => {
    if (headerMap) {
      const value = (field) => (headerMap[field] == null ? "" : cells[headerMap[field]] || "");
      return {
        name: value("name"),
        amount: value("amount"),
        paymentMethod: value("paymentMethod"),
        entityType: value("entityType"),
        category: value("category"),
        w9Status: value("w9Status"),
        tinStatus: value("tinStatus"),
        tinLast4: value("tinLast4"),
        federalWithholding: value("federalWithholding"),
      };
    }
    return {
      name: cells[0] || "",
      amount: cells[1] || "",
      paymentMethod: cells[2] || "",
      entityType: cells[3] || "",
      category: cells[4] || "",
      w9Status: cells[5] || "",
      tinStatus: cells[6] || "",
      federalWithholding: cells[7] || "",
    };
  });
}

function squashHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_FIELDS = {
  name: "name",
  payee: "name",
  payeename: "name",
  amount: "amount",
  amountpaid: "amount",
  paid: "amount",
  payment: "amount",
  paymentmethod: "paymentMethod",
  method: "paymentMethod",
  howpaid: "paymentMethod",
  entitytype: "entityType",
  entity: "entityType",
  payeetype: "entityType",
  paymentcategory: "category",
  category: "category",
  w9: "w9Status",
  w9status: "w9Status",
  tinstatus: "tinStatus",
  tin: "tinStatus",
  tinlast4: "tinLast4",
  last4: "tinLast4",
  federalwithholding: "federalWithholding",
  withholding: "federalWithholding",
};

function mapHeader(cells) {
  const fields = cells.map((cell) => HEADER_FIELDS[squashHeader(cell)] || "");
  if (!fields.some(Boolean)) return null;
  const map = {};
  fields.forEach((field, index) => {
    if (field && map[field] == null) map[field] = index;
  });
  return map;
}

function detectDelimiter(text) {
  const line = text.split(/\r?\n/).find((row) => row.trim()) || "";
  const commas = (line.match(/,/g) || []).length;
  const tabs = (line.match(/\t/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function parseCsvGrid(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (char === "\r") continue;
    cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function deadlineFacts(taxYear) {
  const next = Number(taxYear) + 1;
  return {
    nec: `File Form 1099-NEC with the IRS on or before January 31, ${next}, on paper or electronically, and furnish the recipient copy by January 31, ${next}.`,
    misc: `Form 1099-MISC is generally due to the IRS by February 28, ${next} if you file on paper, or March 31, ${next} if you file electronically. The recipient copy is generally due January 31, ${next}. The IRS guide lists February 15 for certain boxes, including box 8 and box 10.`,
    weekend: "If a due date falls on a Saturday, Sunday, or legal holiday in the District of Columbia or where the return is filed, the due date is the next business day. This tool does not state an observed date.",
    sourceKeys: ["i1099mec", "irs-guide"],
  };
}

export const FISH_NOTE =
  "The IRS guide still lists $600 for box 11 (fish purchased for resale). This check does not cover that box. Check the current instructions for any 1099-MISC box. Do not assume every box uses $2,000.";

export function penaltySentences(taxYear) {
  const facts = penaltyFacts(taxYear);
  if (!facts.stated) {
    return [
      `These rules state penalty amounts for returns due in 2026 and in 2027. They do not state the amounts for returns due in ${facts.dueYear}. Confirm the figure on the IRS penalties page.`,
      "Separate penalties can apply to the information return and to the payee statement. Annual maximums differ for small and large businesses. This check does not state the small-business test.",
      "The IRS may remove or reduce a penalty for reasonable cause.",
    ];
  }
  return [
    `For returns and statements due in ${facts.dueYear}: $${facts.within30} per return if up to 30 days late; $${facts.throughAugust1} if 31 days late through August 1; $${facts.afterAugust1} if after August 1 or not filed; $${facts.disregard} for intentional disregard, with no annual maximum.`,
    "Separate penalties can apply to a late or incorrect information return and to a late or incorrect payee statement.",
    "Annual maximums differ for small and large businesses. This check does not state the small-business test. Read the IRS information-return penalties page.",
    "The IRS may remove or reduce a penalty for reasonable cause.",
  ];
}

export function penaltyFacts(taxYear) {
  const dueYear = Number(taxYear) + 1;
  if (dueYear === 2026) {
    return {
      stated: true,
      dueYear,
      ...PENALTY_BASE,
      disregard: PENALTY_DISREGARD_DUE_2026,
    };
  }
  if (dueYear === 2027) {
    return {
      stated: true,
      dueYear,
      ...PENALTY_BASE,
      disregard: PENALTY_DISREGARD_DUE_2027,
    };
  }
  return { stated: false, dueYear };
}

export function filingOptionFacts(needs1099Count) {
  const count = Number(needs1099Count) || 0;
  const countSentence = count >= EFILE_COUNT
    ? `This list marks ${count} payees as Needs 1099. That count alone meets the 10-return rule, so plan to e-file. Other forms, such as Forms W-2, also count.`
    : `This list marks ${count} payees as Needs 1099. You may use paper only if every information return you file for the year, including Forms W-2, totals fewer than 10. This list is not the whole count.`;
  return {
    sourceKeys: ["tc801", "iris", "irs-required", "p1099", "irs-ic"],
    items: [
      "Gather Forms W-9 now.",
      "Apply for an IRIS Transmitter Control Code early if you will e-file. IRS pages say a TCC may take up to 45 days to process. Pub. 1099 says a typical application is processed within 45 business days.",
      "File Form 1099-NEC and furnish recipient copies by January 31. The weekend and holiday rule applies.",
      "Use IRIS for free e-file. The IRIS Taxpayer Portal can e-file up to 100 returns at a time, manually or by CSV upload. Use paper only if you are under the 10-return rule.",
      "If you have 10 or more information returns in the calendar year, an aggregate of almost all types, including Forms W-2, you must e-file. Fewer than 10 may be e-filed or filed on paper.",
      countSentence,
      "Beginning with tax year 2026, filing season 2027, IRIS is the sole IRS electronic intake system for these returns. FIRE is retiring.",
    ],
  };
}

export function backupFacts() {
  return {
    sourceKeys: ["tc307", "bwh", "irs-required", "i1099mec"],
    items: [
      "The backup withholding rate is 24%.",
      "If the payee does not furnish a TIN in the required manner, or furnishes an obviously incorrect TIN, the payer must backup withhold on reportable payments.",
      "File the 1099 even below the usual threshold if any federal income tax was withheld.",
      "This tool does not calculate a deposit schedule.",
      "If withholding was missed, ask a CPA or enrolled agent.",
    ],
  };
}

export function ncFacts(taxYear) {
  const next = Number(taxYear) + 1;
  return {
    sourceKeys: ["enc3-faq", "enc3-pen", "nc-notice", "nc-1099m", "ta-19-1"],
    items: [
      "Use this note only if the business or the payees are in North Carolina. Confirm it on NCDOR pages.",
      `File Form NC-3 if you were required to withhold North Carolina income tax, or if you voluntarily withheld it. It is due on or before January 31, ${next}. When it is required, file electronically through eNC3.`,
      "Until further notice, NCDOR will not require a federal Form 1099-MISC or 1099-NEC copy with the NC-3 if the form does not report North Carolina income tax withheld. Forms that do report North Carolina tax withheld must be filed with the Department.",
      "When NC-3 is required, the late-filing penalty is $50 per day, up to $1,000, and $200 for failure to file in the format prescribed by the Secretary. A person not required to file NC-3 is not subject to that penalty.",
      "Form NC-1099M reports non-wage compensation for services in North Carolina and North Carolina tax withheld. Skip it if a federal Form 1099-MISC or 1099-NEC is required.",
      "North Carolina 4% withholding on non-wage compensation applies only to a defined payee. That includes certain nonresident contractors, ITIN contractors, and persons who fail to provide a TIN, or a valid TIN after NCDOR notifies the payer. It applies only if you expect to pay that payee more than $1,500 in the calendar year. It does not apply to every subcontractor.",
      "Read Directive TA-19-1 and ask a CPA or enrolled agent before you withhold North Carolina tax.",
    ],
  };
}

export function federalSourceKeys() {
  return SOURCES.filter((source) => source.agency === "irs").map((source) => source.key);
}
