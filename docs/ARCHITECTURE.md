# Storefront Architecture

Style Ease is a static Vue storefront designed for GitHub Pages. It is intentionally front-end only: customer information, orders, catalogue stock, and saved products are simulated in the browser and never sent to a service.

## Application shape

- `src/js/app.js` owns the shared storefront instance and connects route pages through explicit props and events.
- `src/js/store/storefront.js` is the single source of truth for cart lines, wishlist, comparisons, recently viewed products, and demo receipts.
- `src/js/store/storage.js` reads and writes a versioned browser-storage snapshot. It validates malformed, outdated, and unknown values before they reach the interface.
- `src/js/data/catalog.js` contains the static catalogue, ratings, release dates, and fixed demonstration stock values.
- `src/js/pages/` contains route-level page modules. Routes are loaded on demand to keep the initial bundle focused on the app shell.
- `src/js/utils/catalogue-state.js` turns catalogue search, filters, sort order, and pagination into compact URL query state.

## Storefront data rules

Cart lines are identified by product, size, and colour. Matching variants merge quantities, while the central store caps quantities across all variants at the static product stock value. Product prices are copied onto cart lines so a demo receipt keeps the price shown at the time of selection.

Browser storage is a convenience, not a user account. A saved snapshot may contain cart, wishlist, comparison, recently viewed, and receipt data, but never checkout delivery details. Reading the snapshot is defensive: invalid JSON, obsolete versions, unknown products, and unsupported product options are ignored safely.

## Routing and deployment

The app uses hash routing so bookmarked routes and refreshes work on a GitHub Pages project site. Catalogue URLs can include `q`, `category`, `size`, `color`, `price`, `sort`, and `page` query values. The Vite production base remains `/style-ease/`, matching the GitHub Pages project path.

GitHub Actions installs with `npm ci`, runs `npm run validate`, builds the site, and deploys only the generated `dist/` output from `main`.

## Verification approach

The test suite covers catalogue processing, URL parsing, browser-storage fallbacks, cart variants and stock limits, checkout validation, receipts, route titles, and a persisted shopping-flow integration path. `npm run validate` is the local and CI quality gate: formatting, linting, tests, and a production build.
