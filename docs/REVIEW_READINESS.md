# Review readiness — active checkpoint

The new application is ready for local product review: 20 new desktop/mobile browser cases pass against actual Go/PostgreSQL, including checkout, private receipts, variant wishlist, comparison, HTMX history, Studio, mobile keyboard/dialogs, reduced motion, responsive/axe sweeps and no-JavaScript checkout. New domain/SQL/HTTP tests pass; the Go vulnerability scan and initial race/image checks pass. Main/Pages remain untouched.

Final release-style evidence is still being collected: container restart persistence, consolidated legacy browser accessibility rerun, final performance reports and final race/container checks. Until those are recorded, this checkpoint is NOT READY FOR MERGE. This is a feature branch review, not permission to merge or deploy.

## Review walkthrough

1. Open http://127.0.0.1:8080 and compare home-1440/home-390 with baseline captures.
2. Shop: search cotton, filter category/size/colour/stock, change sort, remove an active filter, use back/forward and reload.
3. Quick shop: choose a size/colour; Tab/Escape returns to the trigger. Product page shows honest editorial/sample boundaries.
4. Add/save/move a variant. Bag supports bounded quantity, save for later, remove and undo. Compare up to three pieces.
5. Choose a checkout scenario, review and confirm. Receipt is private, durable, printable and explicitly DEMO. No payment or address is requested.
6. Style Studio: select variants, save, reload, rename and add the outfit. Review ownership/transaction evidence in tests.
7. Repeat on a phone width, with reduced motion and without JavaScript. Inspect error/empty/privacy/clear-data states.

Material limitations: inherited photographs illustrate a mood instead of exact products; original catalogue material/variant values are sample data. Guest cookies are bearer access, not accounts/cross-device identity. Hosting, backups, scheduled cleanup, domain cutover and real customer/payment operations are not configured. Advanced Studio drag/reorder/export/public sharing is not exposed.

The single next action is maintained in HANDOFF.md. Any future live hosting/cutover needs explicit human approval and the operations checklist on a separate origin.
