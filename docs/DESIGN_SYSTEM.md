# Black Label design system

The authored world is recorded in root DESIGN.md. This is a custom CSS fashion system, not an imitation of a named component library.

| Token       | Value / purpose                                    |
| ----------- | -------------------------------------------------- |
| Ink         | #0a0a0a, shell/campaign/editorial                  |
| Graphite    | #191919, announcement depth                        |
| Bone        | #e8e5de, shopping surfaces and dark-page text      |
| Paper       | #f2f0eb, focused dialogs                           |
| Muted       | #5e5b55, secondary text on bone                    |
| Light muted | #b1aea7, secondary text on ink                     |
| Rule        | #c7c4bd, group separation                          |
| Gutter      | clamp(20px,4.2vw,88px), 16px at 320px              |
| Section gap | clamp(64px,7vw,128px)                              |
| Easing      | cubic-bezier(.16,1,.3,1), 160–240ms state feedback |

DM Sans variable (Fontsource 5.3.0, SIL OFL) carries display and interface typography. Bodoni Moda variable (Fontsource 5.3.0, SIL OFL) adds editorial contrast. Latin WOFF2 files are local, font-display swap; only the primary DM Sans is preloaded. Full license files ship in assets/fonts.

Desktop grids use four product columns, three for mid-size discovery, two on phones; product detail and checkout use task-specific two-column layouts, becoming a single flow on phones. Outer alignment is shared across wordmark, campaign CTA, headings and footer. All grid children containing native controls have min-width:0 and bounded select widths.

Product images use 3:4 framed cards, explicit dimensions, local 480/960 WebP srcset and contained cropping. The campaign uses responsive 800/1600 sources and high fetch priority. Every inherited product photograph is marked editorial reference; no colour-specific photo claim is made.

Controls: square-edged primary actions, outline secondary actions, visible 2px focus with 5px offset, native radio groups for required variants, persistent selected colours/sizes, stock-disabled add actions, semantic details, native modal focus containment/Escape, per-dialog opener return. JS-only controls hide until handlers initialize. All important actions have ordinary HTML form/link paths.

The single authored campaign entrance never hides content and is disabled with reduced motion. Hover zoom is a modest image transform. Print hides site chrome and keeps demo receipt identity, snapshots, totals and ink-friendly styling.

Contrast is checked by axe on actual rendered routes and interaction states. No broad WCAG certification or assistive-technology claim is made. See TESTING.md for actual scope.
