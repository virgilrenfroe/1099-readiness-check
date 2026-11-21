import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  BACKUP_RATE,
  BOX10_APPROACH,
  BOX10_GUIDE_2026,
  BOX10_GUIDE_BEFORE_2026,
  BOX10_GUIDE_WORDING,
  BOX10_INSTRUCTIONS,
  BOX10_INSTRUCTIONS_WORDING,
  FW9_URL,
  MISC_COMMON_2026,
  NEC_BEFORE_2026,
  NEC_IN_2026,
  PENALTY_DISREGARD_DUE_2026,
  PENALTY_DISREGARD_DUE_2027,
  SAMPLE_CSV,
  SOURCES,
  STATUS,
  TIN_WARNING,
  classifyList,
  deadlineFacts,
  filingOptionFacts,
  formatEt,
  getThreshold,
  ncFacts,
  normalizeCategory,
  normalizeEntity,
  normalizeMethod,
  parseCsv,
  penaltyFacts,
  penaltySentences,
  redactText,
  sourceUrl,
  w9Script,
} from "../classify.js";

function row(overrides) {
  return {
    name: "Pat Example",
    amount: 1000,
    paymentMethod: "check",
    entityType: "individual",
    category: "services",
    w9Status: "have",
    tinStatus: "have",
    federalWithholding: "no",
    ...overrides,
  };
}

function one(overrides, year = 2026) {
  const model = classifyList([row(overrides)], year);
  assert.equal(model.results.length, 1);
  return model.results[0];
}

test("sample CSV file matches the template embedded in the app", () => {
  const file = fs.readFileSync(new URL("../sample-payees.csv", import.meta.url), "utf8");
  assert.equal(file, SAMPLE_CSV);
});

test("source URLs are only the official IRS and NCDOR paths from the rule set", () => {
  const expected = {
    "irs-required": "https://www.irs.gov/businesses/small-businesses-self-employed/am-i-required-to-file-a-form-1099-or-other-information-return",
    i1099mec: "https://www.irs.gov/instructions/i1099mec",
    p1099: "https://www.irs.gov/publications/p1099",
    iris: "https://www.irs.gov/filing/e-file-information-returns-with-iris",
    tc801: "https://www.irs.gov/taxtopics/tc801",
    tc307: "https://www.irs.gov/taxtopics/tc307",
    bwh: "https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding",
    "irs-penalties": "https://www.irs.gov/payments/information-return-penalties",
    "irs-guide": "https://www.irs.gov/businesses/small-businesses-self-employed/a-guide-to-information-returns",
    "irs-ic": "https://www.irs.gov/businesses/small-businesses-self-employed/forms-and-associated-taxes-for-independent-contractors",
    w9: "https://www.irs.gov/forms-pubs/about-form-w-9",
    fw9: "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
    iw9: "https://www.irs.gov/instructions/iw9",
    "enc3-faq": "https://www.ncdor.gov/taxes-forms/withholding-tax/enc3-frequently-asked-questions",
    "enc3-pen": "https://www.ncdor.gov/enc3-penalty-and-waiver-information",
    "nc-1099m": "https://www.ncdor.gov/taxes-forms/withholding-tax/withholding-tax-forms-and-instructions/nc-1099m-compensation-paid-payee",
    "nc-notice": "https://www.ncdor.gov/taxes-forms/information-tax-professionals/tax-bulletins-directives-and-other-important-notices/important-notices-and-frequently-asked-questions-personal-taxes/important-notice-updates-north-carolina-withholding-tax",
    "ta-19-1": "https://www.ncdor.gov/taxes-forms/individual-income-tax/personal-taxes-division-directives/expansion-requirement-withhold-state-income-tax-certain-non-wage-compensation-recipients",
  };
  assert.equal(SOURCES.length, Object.keys(expected).length);
  for (const [key, url] of Object.entries(expected)) {
    assert.equal(sourceUrl(key), url);
  }
  assert.equal(FW9_URL, expected.fw9);
});

test("NEC thresholds follow the year", () => {
  const before = getThreshold("services", 2025);
  assert.equal(before.known, true);
  assert.equal(before.amount, NEC_BEFORE_2026);
  assert.equal(before.amount, 600);
  assert.ok(before.sourceKeys.includes("irs-required"));

  const during = getThreshold("services", 2026);
  assert.equal(during.amount, NEC_IN_2026);
  assert.equal(during.amount, 2000);

  const after = getThreshold("services", 2027);
  assert.equal(after.known, false);
  assert.equal(after.amount, null);
  assert.match(after.summary, /Pub\. 1099/);
  assert.ok(after.sourceKeys.includes("p1099"));

  assert.equal(getThreshold("services", 2024).amount, 600);
});

test("2026 Form 1099-MISC amounts are used only where the rules state them", () => {
  for (const category of ["rent", "prizes", "other", "medical"]) {
    const current = getThreshold(category, 2026);
    assert.equal(current.amount, MISC_COMMON_2026);
    assert.equal(current.amount, 2000);
    const prior = getThreshold(category, 2025);
    assert.equal(prior.known, false);
    assert.equal(prior.amount, null);
    assert.match(prior.summary, /do not state the pre-2026 dollar amount/i);
    const later = getThreshold(category, 2028);
    assert.equal(later.known, false);
    assert.match(later.summary, /Do not assume every box uses \$2,000/);
  }

  const royalties = getThreshold("royalties", 2026);
  assert.equal(royalties.amount, 10);
  assert.equal(getThreshold("royalties", 2025).known, false);
});

test("attorney gross proceeds keeps both official box 10 wordings", () => {
  const year2025 = getThreshold("attorney_gross", 2025);
  assert.equal(year2025.conflict, true);
  assert.equal(year2025.amount, BOX10_INSTRUCTIONS);
  assert.equal(year2025.amount, 600);
  assert.equal(year2025.guideAmount, BOX10_GUIDE_BEFORE_2026);
  assert.equal(year2025.guideAmount, 600);

  const year2026 = getThreshold("attorney_gross", 2026);
  assert.equal(year2026.amount, 600);
  assert.equal(year2026.guideAmount, BOX10_GUIDE_2026);
  assert.equal(year2026.guideAmount, 2000);

  const year2027 = getThreshold("attorney_gross", 2027);
  assert.equal(year2027.known, false);
  assert.equal(year2027.conflict, true);

  const between = one({
    name: "Parker Quinn",
    amount: 900,
    entityType: "attorney/law firm",
    category: "attorney gross proceeds",
  }, 2026);
  assert.equal(between.status, STATUS.NEEDS_1099);
  assert.equal(between.conflict.instructions, BOX10_INSTRUCTIONS_WORDING);
  assert.equal(between.conflict.guide, BOX10_GUIDE_WORDING);
  assert.equal(between.approach ?? between.conflict.approach, BOX10_APPROACH);
  assert.match(between.apparentForm, /1099-MISC box 10/);
  assert.match(between.apparentForm, /not a final verdict/);
  assert.equal(between.cpa, true);

  const underBoth = one({
    amount: 400,
    entityType: "attorney",
    category: "box 10",
  }, 2026);
  assert.equal(underBoth.status, STATUS.BELOW);
  assert.ok(underBoth.conflict);
});

test("card and payment-app amounts are excluded, and unknown methods are not guessed", () => {
  const card = one({ amount: 9000, paymentMethod: "PayPal/payment app", entityType: "partnership" });
  assert.equal(card.countable, 0);
  assert.equal(card.excludedAmount, 9000);
  assert.equal(card.status, STATUS.EXEMPT);
  assert.match(card.howPaid, /not counted/);
  assert.match(card.apparentForm, /1099-K/);

  const debit = one({ amount: 3000, paymentMethod: "credit/debit card" });
  assert.equal(debit.countable, 0);
  assert.equal(debit.status, STATUS.EXEMPT);

  for (const method of ["check", "cash", "ACH/bank transfer"]) {
    const paid = one({ amount: 2500, paymentMethod: method });
    assert.equal(paid.countable, 2500);
    assert.equal(paid.status, STATUS.NEEDS_1099);
  }

  assert.equal(normalizeMethod("zelle"), "unknown");
  const unclear = one({ amount: 3200, paymentMethod: "unknown" });
  assert.equal(unclear.countable, 0);
  assert.equal(unclear.status, STATUS.METHOD_REVIEW);
  assert.match(unclear.statusLabel, /possible 1099-K/);

  const split2026 = classifyList([
    row({ name: "Sam Split", amount: 1500, paymentMethod: "check" }),
    row({ name: "sam   split", amount: 1500, paymentMethod: "credit card" }),
  ], 2026);
  assert.equal(split2026.results.length, 1);
  assert.equal(split2026.results[0].countable, 1500);
  assert.equal(split2026.results[0].excludedAmount, 1500);
  assert.equal(split2026.results[0].status, STATUS.BELOW);

  const split2025 = classifyList([
    row({ name: "Sam Split", amount: 1500, paymentMethod: "check" }),
    row({ name: "Sam Split", amount: 1500, paymentMethod: "debit card" }),
  ], 2025);
  assert.equal(split2025.results[0].countable, 1500);
  assert.equal(split2025.results[0].status, STATUS.NEEDS_1099);
});

test("corporate exemption stops at attorneys, medical payments, and a missing W-9", () => {
  const corp = one({ name: "Morgan Ellis", amount: 8000, entityType: "C or S corp" });
  assert.equal(corp.status, STATUS.EXEMPT);
  assert.match(corp.nextStep, /corporation/i);

  const sCorp = one({ amount: 8000, entityType: "S corp" });
  assert.equal(sCorp.status, STATUS.EXEMPT);

  const unconfirmed = one({ amount: 8000, entityType: "C or S corp", w9Status: "missing", tinStatus: "missing" });
  assert.equal(unconfirmed.status, STATUS.MISSING_W9);
  assert.notEqual(unconfirmed.status, STATUS.EXEMPT);
  assert.match(unconfirmed.nextStep, /Do not assume a corporate exemption/);

  const attorney = one({ amount: 4500, entityType: "attorney/law firm" });
  assert.equal(attorney.status, STATUS.NEEDS_1099);
  assert.match(attorney.apparentForm, /1099-NEC box 1a/);
  assert.match(attorney.nextStep, /does not apply to payments for legal services|corporate exemption does not apply/i);

  const medicalCorp = one({ amount: 3000, entityType: "C or S corp", category: "medical" });
  assert.equal(medicalCorp.status, STATUS.NEEDS_1099);
  assert.match(medicalCorp.apparentForm, /1099-MISC box 6/);
  assert.match(medicalCorp.nextStep, /corporate exemption does not apply/i);

  const hospital = one({ amount: 3000, entityType: "tax-exempt", category: "medical" });
  assert.equal(hospital.status, STATUS.NEEDS_1099);
  assert.equal(hospital.cpa, true);
  assert.match(hospital.nextStep, /government hospitals/);

  const llc = one({ amount: 3000, entityType: "LLC", paymentMethod: "ach" });
  assert.equal(llc.status, STATUS.NEEDS_1099);

  const partnership = one({ amount: 2500, entityType: "partnership", paymentMethod: "cash" });
  assert.equal(partnership.status, STATUS.NEEDS_1099);

  const exemptOrg = one({ amount: 9000, entityType: "tax-exempt" });
  assert.equal(exemptOrg.status, STATUS.EXEMPT);

  const government = one({ amount: 9000, entityType: "government" });
  assert.equal(government.status, STATUS.EXEMPT);

  const goods = one({ amount: 9000, category: "merchandise/freight", entityType: "individual" });
  assert.equal(goods.status, STATUS.EXEMPT);
  assert.match(goods.nextStep, /Merchandise, freight/);

  const unknownEntity = one({ amount: 5000, entityType: "unknown", w9Status: "missing" });
  assert.equal(unknownEntity.status, STATUS.MISSING_W9);
  assert.notEqual(unknownEntity.status, STATUS.EXEMPT);
});

test("federal withholding forces a 1099 below the threshold", () => {
  const withheld = one({ amount: 180, federalWithholding: "yes", paymentMethod: "ACH/bank transfer" });
  assert.equal(withheld.status, STATUS.NEEDS_1099);
  assert.match(withheld.nextStep, /federal income tax was withheld/);

  const plain = one({ amount: 180, federalWithholding: "no" });
  assert.equal(plain.status, STATUS.BELOW);

  const exemptWithheld = one({
    amount: 25,
    entityType: "C or S corp",
    federalWithholding: "yes",
  });
  assert.equal(exemptWithheld.status, STATUS.NEEDS_1099);

  const cardWithheld = one({
    amount: 25,
    paymentMethod: "paypal",
    federalWithholding: "yes",
  });
  assert.equal(cardWithheld.status, STATUS.NEEDS_1099);
});

test("threshold comparisons use at least the stated dollar amount", () => {
  assert.equal(one({ amount: 2000 }, 2026).status, STATUS.NEEDS_1099);
  assert.equal(one({ amount: 1999.99 }, 2026).status, STATUS.BELOW);
  assert.equal(one({ amount: 600 }, 2025).status, STATUS.NEEDS_1099);
  assert.equal(one({ amount: 599.99 }, 2025).status, STATUS.BELOW);
  assert.equal(one({ amount: 50000 }, 2027).status, STATUS.NEEDS_REVIEW);
  assert.match(one({ amount: 50000 }, 2027).nextStep, /Pub\. 1099/);

  const rent = one({ amount: 5000, category: "rent" }, 2025);
  assert.equal(rent.status, STATUS.NEEDS_REVIEW);
  assert.notEqual(rent.status, STATUS.BELOW);
  assert.notEqual(rent.status, STATUS.NEEDS_1099);

  const royalties = one({ amount: 10, category: "royalties" }, 2026);
  assert.equal(royalties.status, STATUS.NEEDS_1099);
  assert.equal(one({ amount: 9, category: "royalties" }, 2026).status, STATUS.BELOW);
});

test("full TIN patterns are stripped and never returned", () => {
  const ssn = redactText("123-45-6789");
  assert.equal(ssn.redacted, true);
  assert.equal(ssn.last4, "6789");
  assert.equal(ssn.text, "");

  const ein = redactText("12-3456789");
  assert.equal(ein.last4, "6789");
  assert.equal(ein.text, "");

  const plain = redactText("Name 123456789 end");
  assert.equal(plain.last4, "6789");
  assert.equal(plain.text, "Name end");
  assert.equal(plain.text.includes("123456789"), false);

  assert.equal(redactText("123 45 6789").last4, "6789");
  assert.equal(redactText("123.45.6789").text, "");
  assert.equal(redactText("1234").redacted, false);
  assert.equal(redactText("123-45-678").redacted, false);
  assert.equal(redactText("1234567890").redacted, false);
  assert.equal(redactText("123456789.50").redacted, false);

  const model = classifyList([
    row({
      name: "Jane 123-45-6789 Doe",
      amount: "12-3456789",
      paymentMethod: "check",
      tinLast4: "123456789",
    }),
  ], 2026);

  const packed = JSON.stringify(model);
  assert.equal(packed.includes("123-45-6789"), false);
  assert.equal(packed.includes("12-3456789"), false);
  assert.equal(packed.includes("123456789"), false);
  assert.equal(model.warnings.includes(TIN_WARNING), true);
  assert.equal(model.results.length, 0);
  assert.ok(model.dropped >= 1);

  const kept = classifyList([
    row({ name: "Jane 123-45-6789 Doe", amount: 50, tinStatus: "missing", tinLast4: "" }),
  ], 2026);
  const keptPacked = JSON.stringify(kept);
  assert.equal(keptPacked.includes("123-45-6789"), false);
  assert.equal(keptPacked.includes("123456789"), false);
  assert.equal(kept.results[0].name, "Jane Doe");
  assert.equal(kept.results[0].tinLast4, "6789");
  assert.equal(kept.results[0].tinStatus, "last4");

  const short = classifyList([
    row({ tinStatus: "last4", tinLast4: "12345" }),
  ], 2026);
  assert.equal(short.results[0].tinLast4, null);
  assert.equal(JSON.stringify(short).includes("12345"), false);
});

test("results sort as needs 1099, missing W-9 or TIN, method review, below threshold, likely exempt", () => {
  const model = classifyList(parseCsv(SAMPLE_CSV), 2026);
  const labels = model.results.map((result) => `${result.statusLabel}: ${result.name}`);
  assert.deepEqual(labels, [
    "Needs 1099: Casey Brooks",
    "Needs 1099: Harper Singh",
    "Needs 1099: Parker Quinn",
    "Needs 1099: Quinn Alvarez",
    "Needs 1099: Reese Morgan",
    "Needs 1099: Riley Chen",
    "Missing W-9 or TIN: Jordan Blake",
    "Payment method needs review (possible 1099-K): Sam Patel",
    "Below threshold: Avery Nguyen",
    "Likely exempt: Drew Okonkwo",
    "Likely exempt: Morgan Ellis",
  ]);
  assert.deepEqual(
    model.w9Requests.map((item) => item.name),
    ["Jordan Blake", "Reese Morgan"],
  );
  for (const request of model.w9Requests) {
    assert.match(request.script, new RegExp(FW9_URL.replace(/[.]/g, "\\.")));
    assert.equal(/\d{3}-\d{2}-\d{4}/.test(request.script), false);
    assert.equal(/\d{9}/.test(request.script), false);
  }
});

test("already normalized codes stay normalized", () => {
  assert.equal(normalizeMethod("ach"), "ach");
  assert.equal(normalizeEntity("medical_provider"), "medical_provider");
  assert.equal(normalizeEntity("tax_exempt"), "tax_exempt");
  assert.equal(normalizeCategory("attorney_gross"), "attorney_gross");
});

test("CSV quotes, tabs, and headers are accepted", () => {
  const parsed = parseCsv('name,amount,payment_method\n"Doe, Jane",1200,check\n');
  assert.equal(parsed[0].name, "Doe, Jane");
  assert.equal(parsed[0].amount, "1200");
  assert.equal(parsed[0].paymentMethod, "check");

  const tabs = parseCsv("name\tamount\tpayment_method\tentity_type\tpayment_category\tw9_status\ttin_status\nRae\t2200\tcash\tindividual\tservices\thave\thave\n");
  assert.equal(tabs[0].name, "Rae");
  assert.equal(tabs[0].amount, "2200");
  const model = classifyList(tabs, 2026);
  assert.equal(model.results[0].status, STATUS.NEEDS_1099);
  assert.equal(model.results[0].countable, 2200);
});

test("deadlines, penalties, filing options, backup withholding, and the NC note use only stated figures", () => {
  const deadlines = deadlineFacts(2026);
  assert.match(deadlines.nec, /January 31, 2027/);
  assert.match(deadlines.misc, /February 28, 2027/);
  assert.match(deadlines.misc, /March 31, 2027/);
  assert.match(deadlines.misc, /February 15/);
  assert.match(deadlines.weekend, /does not state an observed date/);

  const due2026 = penaltyFacts(2025);
  assert.equal(due2026.disregard, PENALTY_DISREGARD_DUE_2026);
  assert.equal(due2026.disregard, 680);
  assert.equal(due2026.within30, 60);
  assert.equal(due2026.throughAugust1, 130);
  assert.equal(due2026.afterAugust1, 340);
  assert.equal(penaltyFacts(2026).disregard, PENALTY_DISREGARD_DUE_2027);
  assert.equal(penaltyFacts(2026).disregard, 690);
  assert.equal(penaltyFacts(2027).stated, false);
  const penaltyText = penaltySentences(2025).join(" ");
  assert.match(penaltyText, /\$680/);
  assert.match(penaltyText, /does not state the small-business test/);
  assert.equal(Object.hasOwn(due2026, "smallBusinessMaximum"), false);

  const under = filingOptionFacts(6);
  assert.match(under.items.join(" "), /up to 45 days/);
  assert.match(under.items.join(" "), /45 business days/);
  assert.match(under.items.join(" "), /100 returns/);
  assert.match(under.items.join(" "), /fewer than 10/);
  assert.match(under.items.join(" "), /FIRE is retiring/);
  assert.match(filingOptionFacts(10).items.join(" "), /meets the 10-return rule/);

  const backup = JSON.stringify({ BACKUP_RATE });
  assert.match(backup, /24%/);

  const nc = ncFacts(2026).items.join(" ");
  assert.match(nc, /January 31, 2027/);
  assert.match(nc, /\$50 per day/);
  assert.match(nc, /\$1,000/);
  assert.match(nc, /\$200/);
  assert.match(nc, /4%/);
  assert.match(nc, /\$1,500/);
  assert.match(nc, /TA-19-1/);
  assert.match(nc, /does not apply to every subcontractor/);
});

test("the report clock is labeled ET in America/New_York", () => {
  const stamp = formatEt(new Date("2026-01-15T15:30:00Z"));
  assert.match(stamp, /January 15, 2026/);
  assert.match(stamp, /10:30/);
  assert.match(stamp, /ET$/);
});

test("the W-9 script points at the official PDF and has no TIN", () => {
  const script = w9Script("Riley Chen");
  assert.match(script, /https:\/\/www\.irs\.gov\/pub\/irs-pdf\/fw9\.pdf/);
  assert.match(script, /Riley Chen/);
  assert.equal(/\d{9}/.test(script), false);
});
