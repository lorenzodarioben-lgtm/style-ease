# Storefront Architecture

Style Ease is a static Vue storefront designed for GitHub Pages. It is intentionally front-end only: customer information, orders, catalogue stock, and saved products are simulated in the browser and never sent to a service.

## Application shape

- `src/js/app.js` owns the shared storefront instance and connects route pages through explicit props and events.
- `src/js/store/storefront.js` is the single source of truth for cart lines, wishlist variants, comparisons, recently viewed products, and demo receipts. It can replace synchronized collections without re-emitting a persistence write.
- `src/js/store/storage.js` reads and writes a versioned browser-storage snapshot. It validates malformed, outdated, unknown, and invalid-option values before they reach the interface.
- `src/js/data/catalog.js` contains the static catalogue, ratings, release dates, and fixed demonstration stock values.
- `src/js/pages/` contains route-level page modules. Routes are loaded on demand to keep the initial bundle focused on the app shell.
- `src/js/utils/catalogue-state.js` turns catalogue search, filters, sort order, and pagination into compact URL query state.

## Storefront data rules

Cart lines are identified by product, size, and colour. Matching variants merge quantities, while the central store caps quantities across all variants at the static product stock value. Product prices are copied onto cart lines so a demo receipt keeps the price shown at the time of selection.

Browser storage is a convenience, not a user account. A saved snapshot may contain cart, compact wishlist variants, comparison, recently viewed, and receipt data, but never checkout delivery details; legacy receipts are rewritten without them when read. Reading the snapshot is defensive: invalid JSON, obsolete versions, unknown products, and unsupported product options are ignored safely. A `storage` event updates those synchronized collections in other tabs without causing write loops. Reviews are separate browser-local records, capped at 50 per product and explicitly described as non-verified demo entries.

## Routing and deployment

The app uses hash routing so bookmarked routes and refreshes work on a GitHub Pages project site. Catalogue URLs can include `q`, `category`, `size`, `color`, `price`, `inStock`, `sort`, and `page` query values. Unknown routes render an accessible recovery screen, while invalid product IDs keep their product-specific screen. Lazy-route failures surface a Retry UI and allow one session-guarded reload before relying on an explicit retry. The Vite production base remains `/style-ease/`, matching the GitHub Pages project path.

GitHub Actions installs with `npm ci`, runs `npm run validate` (including the initial JavaScript and CSS gzip budgets), builds the site, and deploys only the generated `dist/` output from `main`.

## Verification approach

The suite contains 130 unit tests across 20 files, including mounted Vue component interactions through Vue Test Utils. Five Playwright scenarios cover the production build's purchase, deep-link, route accessibility, and mobile flows. `npm run validate` is the local and CI quality gate: formatting, linting, tests, a production build, and bundle budgets; CI follows it with the Playwright suite.
