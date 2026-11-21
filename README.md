# 1099 Readiness Check

A free, static page that helps a small business review a payee list before filing Forms 1099-NEC and 1099-MISC.

It runs entirely in the browser. The payee list is not uploaded. The page does not file a return.

Live page: https://virgilrenfroe.github.io/1099-readiness-check/

## What you can do

Enter the tax year, the type of business, and whether North Carolina is involved. Add payees in the table, or paste or upload a CSV. A sample CSV is on the page.

The result is a table sorted into: needs 1099; missing W-9 or TIN; payment method needs review (possible 1099-K); below threshold; and likely exempt. It also lists W-9 requests, deadlines, filing options, backup withholding, penalties, and the official source links. If you choose North Carolina, the state note is included.

Use **Print or save PDF** for a report titled “1099 Readiness Check report.” The report footer is 1099-CHECK.

## Limits

This is not tax advice or a filing service. It will not file, pay, or contact the IRS or a state agency. Confirm every dollar figure and deadline on the official IRS and North Carolina pages linked from the report. On a close call, including Form 1099-MISC box 10, use a CPA or enrolled agent. Do not enter a full Social Security number or EIN. If one is pasted, the page removes it and keeps at most the last four digits.

## Tests

```bash
node --test
```

## GitHub Pages

`.github/workflows/pages.yml` deploys this site from `main` with `actions/deploy-pages`.

In the repository settings, open **Pages** and set the source to **GitHub Actions** if it is not already set that way. The live URL above stays empty until that source is selected.
