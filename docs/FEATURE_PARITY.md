# Feature parity — working matrix

Baseline: ae12cd3. PENDING means not verified in new runtime; legacy tests remain intact.

| Journey / semantic                             | Old path             | New path                          | Status / evidence                                         |
| ---------------------------------------------- | -------------------- | --------------------------------- | --------------------------------------------------------- |
| 20 products, original IDs/prices/options       | /#/products          | /shop                             | Implementation in progress                                |
| Attribute search and comma-list URL filters    | /#/products?q=       | /shop?q=                          | Domain parser/filter implemented; tests pending           |
| Sort/pagination/stock filter                   | /#/products          | /shop                             | PENDING; artificial rating sort deliberately removed      |
| Product variant selection                      | /#/product/1         | /products/geometric-t-shirt       | PENDING                                                   |
| Quick shop / size guide / keyboard focus       | catalogue dialog     | /quick/{slug}                     | PENDING                                                   |
| Shared product capacity, quantity, remove/undo | /#/cart              | /bag                              | Transaction engine implemented; tests pending             |
| Wishlist exact size+colour; save/move atomic   | /#/wishlist          | /wishlist                         | Repository mutations implemented; tests pending           |
| Comparison max 3                               | /#/compare           | /compare                          | Repository cap implemented; tests pending                 |
| Recently viewed max 6                          | home                 | home/product                      | Repository pruning implemented; tests pending             |
| Unverified reviews, bounded entries            | product localStorage | guest-owned demo reviews          | PENDING; no fake public ratings                           |
| Two-step demo checkout / validation            | /#/checkout          | /checkout                         | Transaction engine implemented; UI/tests pending          |
| Owned durable receipts / printing              | /#/orders            | /orders/{code}                    | Repository ownership/snapshots implemented; tests pending |
| Mobile nav / keyboard / reduced motion         | all                  | all                               | PENDING                                                   |
| No-JS browse/forms/checkout                    | SPA unavailable      | ordinary server HTML              | PENDING                                                   |
| Cross-tab synchronization                      | storage events       | server session + refetch on focus | PENDING                                                   |
| Clear all demo records                         | orders               | /privacy                          | Repository cascade implemented; tests pending             |
| Invalid product / invalid route recovery       | hash catch-all       | HTTP 404                          | PENDING                                                   |
| Numeric legacy links                           | /#/product/:id       | /product/:id redirect             | PENDING                                                   |

Hash fragments never reach Go. Existing Pages links and stored browser data remain intact at their existing origin. New server starts a separate guest session; no implied automatic transfer. Path aliases can redirect; any future old-origin redirect requires separate deployment approval.
