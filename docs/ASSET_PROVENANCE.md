# Asset provenance

All 20 product image source URLs are stored in seeds/catalogue.json and product_media.source. These are inherited Unsplash sources, downloaded as local 480/960px WebP references. They are deliberately labelled editorial reference in cards, product captions, comparisons and Studio; they do not establish the exact demo garment, material or selected colour. No invented angles or generated garment photographs are used.

Campaign source: [original Unsplash image](https://images.unsplash.com/photo-1615222443417-6d76586644a9), inherited from the original homepage. It shows three people in monochrome streetwear. Responsive 400/800/1600 WebP sources are served locally; CDN query parameters request sizing/quality. AVIF derivatives at 400/640/960/1600 widths preserve the source composition with the same CSS art direction. Reproduce them offline with `python scripts/prepare-campaign.py` (Pillow with AVIF support, quality 65/Lanczos); no new photography or generated garment imagery is introduced.

The [Unsplash License](https://unsplash.com/license) permits download, modification and commercial/noncommercial use without mandatory attribution; images are not being sold or used to reproduce an image service. No photographer identity or endorsement is invented when the existing source metadata does not identify one. The new runtime makes no external image request; asset updates should be reviewed visually and recorded, not pulled randomly at runtime.

DM Sans and Bodoni Moda variable Latin WOFF2 files come from Fontsource packages 5.3.0. Both are SIL Open Font License; exact licenses ship in assets/fonts. The original Inter font remains only in the retained Vue reference.

HTMX 4.0.0 is exact vendored upstream JavaScript from cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.min.js. SHA384 (base64): BvJpBiO8Kh31EqtJe5DRIeWrHWnCGkwytKs9NKFi86Hhw96dEqdEMzZDeK9iEGTc. HTML uses this SRI value, and an automated test verifies the local bytes. The upstream Zero-Clause BSD license is stored alongside it. Updates require a deliberate version, integrity, lifecycle/API and browser-test review.

The STYLE EASE mark/favicon and unavailable-image geometry are original project assets. The arrow follows the simple right-arrow geometry from the Tabler icon vocabulary (MIT), with its license retained. No external brand logos or made-up affiliations are displayed.
