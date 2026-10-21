# ADR 001 — one server-rendered Go application

Accepted for Project Black Label. One Go net/http process renders typed templ components and calls PostgreSQL through pgxpool. A monolith keeps the transactional bag, wishlist, checkout and guest ownership boundary in one place. No frontend application runtime or bundler is required for the new app.

Domain invariants (integer money, capacity, variant validation, query parsing and relationships) live in internal/domain. Transactional repository operations live in internal/database; session-row locking serializes a guest's mutations. HTTP validation, CSRF and representation selection live in internal/web. Views receive typed models. SQL transaction rules deliberately stay adjacent to their locking/query operations instead of a second abstraction layer.

HTMX 4.0.0 is exact-version vendored. Filters and quick shop request fragments; ordinary forms/navigation handle mutations through POST/Redirect/GET. Only HX-Request-Type=partial returns fragment HTML. Full/history requests receive a document. Client code reads event.detail.ctx, as verified against the real v4 runtime. No implicit inheritance or version-2 event names.

Tradeoff: frontend references and Node tests remain available alongside the Go code until review/cutover. They are excluded from the production image. Rejected alternative: bolting a JSON API onto the old Vue SPA would preserve two application state models and fail the intended migration.
