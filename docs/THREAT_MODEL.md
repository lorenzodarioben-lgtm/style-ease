# Threat model

| Asset / entry        | Attacker goal                  | Implemented boundary / evidence                                                                                          |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Guest cookie         | Guess/fixate another session   | Random 256-bit token, digest at rest, new token for unknown/expired cookie; expiry HTTP test                             |
| State-changing forms | Cross-site request forgery     | Session secret, constant-time comparison, Origin/Referer and Fetch-Site checks; five HTTP rejection cases                |
| Cart/checkout        | Forge price or exceed capacity | Catalogue-authoritative integer money, active variants, per-session row lock, concurrency test with 24 simultaneous adds |
| Checkout retry       | Duplicate receipt / lost bag   | Unique owner/key, single transaction, parallel retry and forced line-write rollback tests                                |
| Receipt/look URL     | Read another guest's data      | Explicit owner query on every receipt/look operation; HTTP/repository isolation tests                                    |
| Reviews/names/query  | Stored XSS / SQL injection     | templ escaping, parameterized SQL, bounded strings/allowlisted sorts, stored script text escaping test                   |
| Large or rapid POST  | Abuse resources                | 16KiB body, 16KiB headers, bounded collections, 90 mutations/minute/session, bounded limiter map; HTTP rejection tests   |
| DB outage            | Fake success / secret leak     | 503 recovery page, no fallback persistence, distinct readiness/liveness; outage HTTP test                                |
| Static assets        | Third-party code drift         | Exact vendored HTMX, local fonts/images, SHA384/SHA256 manifest; no runtime CDN                                          |
| Production process   | Privilege/config mistakes      | Nonroot container, HTTPS origin validation, production Secure cookie, timeouts and graceful shutdown                     |

No authentication/admin/upload/email/payment endpoints are exposed. Guest cookies are bearer credentials and are not cross-device accounts. Clearing a cookie loses access; a stolen active cookie can act as that guest until expiry. New session issuance is capped before database allocation at 90/minute per direct peer IP, with an explicit test; arbitrary forwarded IP headers are not trusted. Public hosting still needs appropriate edge protection, operational cleanup/backups and deployment review. Do not treat these tests as a security certification.
