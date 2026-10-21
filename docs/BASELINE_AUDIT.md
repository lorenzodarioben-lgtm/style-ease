# Baseline audit

Reference: `ae12cd35dbfd8b8f4b0ff985718b502bc81bda01`, fetched current origin/main on 2026-10-21. Original Vue source and tests remain intact during migration. Restore/audit through `git show <reference>:<path>`; never reset main.

## Observed evidence

- 168 Vitest tests pass across 23 files (README's 156 count is stale).
- All 6 original Playwright production scenarios pass, including axe scans.
- 35 real full-page baseline captures in `docs/screenshots/baseline`: home, catalogue, product, empty bag/checkout/wishlist/comparison at 1440, 1920, 768, 390 and 320px.
- Initial validate attempts were affected by newly written, unformatted specification/audit artifacts. These are session-introduced formatting failures, not baseline defects; raw command logs retained. Original unit/browser suites run independently and pass.
- Existing npm audit: 10 advisories (3 moderate, 6 high, 1 critical), captured in `evidence/baseline-npm-audit.json`. Node 22.19 is below several installed tool engines. Do not expose the legacy dev server publicly.

## Concrete visual/content findings

- `src/js/components/app-header.js`: desktop first fold has hamburger/search/bag but no visible STYLE EASE identity or primary navigation.
- `src/css/02-home-layout.css` and home template: small generic Angular Fashion headline; large unoccupied black area; category thumbnails do not explain garments.
- `src/css/05-layout-overrides.css`: featured cards escape the main content alignment and stretch full-height photographs excessively. Layered overrides fragment layout ownership.
- `src/js/data/catalog.js`: e.g. Angular Jacket photo is an editorial portrait; Architectural Boots photo includes a model and other clothing; Prism Watch image is a smartwatch. None establishes exact listed product identity. New runtime must label all inherited photos editorial references.
- `featuredBrands` lists famous brands without supported affiliations. New storefront removes this block.
- Imported rating values have no verified review provenance; new runtime will not display them or offer rating sorting as credible evidence.
- Product 19 name includes unsupported brand/fantasy fragments; migrated to Crest Cuff Bracelet with its numeric ID, price and options preserved.
- Product descriptions contain unverified performance/health/Swiss-movement/material-quality claims. New descriptions explicitly identify demonstration concepts; material fields remain labelled sample catalogue data.

## Behavioral contracts

Legacy query keys: q/category/size/color/price/inStock/sort/page; comma-separated option lists; T-Shirts alias→Tops. Variants keyed by product+size+colour. Shared stock cap per product across cart variants. Comparison max 3; recently viewed max 6; browser-local reviews max 50/product; receipts contain no persisted delivery data. See FEATURE_PARITY.md for new mapping/status.

## Rejected redesign

Examined local merge/diff history for PR #30 (ab9a01d) and rollback #32 (ae12cd3). Seven CSS/header files changed, then reverted. Visual success requires coherent composition and functional proof, not another override layer. Public PR fetch unavailable; local Git objects provide the actual patches.
