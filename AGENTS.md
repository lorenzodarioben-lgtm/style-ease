# Style Ease / Project Black Label

- Work only on `overhaul/black-label-go` (or a safe successor), never main. Never deploy or change Pages/DNS without explicit human approval.
- New runtime: Go + templ + pinned HTMX 4 + PostgreSQL + custom CSS, progressive HTML forms. No replacement SPA or fake persistence.
- Read HANDOFF.md first. Record commands, failures, exact Git state and one next action at every substantial checkpoint.
- Preserve legacy journey semantics; baseline is ae12cd35dbfd8b8f4b0ff985718b502bc81bda01. Keep old tests intact.
- Demo only: no real payment/customer data, invented endorsements, ratings, delivery promises or unverified product claims.
- Server-authoritative money/variants/capacity, session ownership, CSRF, transactional idempotent checkout; test with actual PostgreSQL.
- Run relevant Go, SQL and browser checks; never claim unrun checks passed. Preserve authorship and configured Git identity.
