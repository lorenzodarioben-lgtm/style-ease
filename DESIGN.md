---
name: 'Style Ease — Black Label'
description: 'Kinetic monochrome editorialism, complete-source photography and a visual atelier.'
colors:
  ink: '#141612'
  bone: '#f5f4f0'
  paper: '#fbfbf8'
  muted: '#50564b'
  line: '#c7cbc1'
  light-muted: '#c5c8bc'
  mineral: '#cbd0c3'
  mineral-dark: '#414b3e'
typography:
  display:
    fontFamily: 'Bodoni Moda, serif'
    fontSize: 'clamp(44px, 5.9vw, 100px)'
    fontWeight: 450
    lineHeight: 1.08
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Bodoni Moda, serif'
    fontSize: 'clamp(30px, 3.2vw, 52px)'
    fontWeight: 450
    lineHeight: 1.08
    letterSpacing: '-0.035em'
  title:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '22px'
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.6
  editorial-body:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.9
  action:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '13px'
    fontWeight: 500
    lineHeight: 1.35
rounded:
  square: '0'
  counter: '50%'
spacing:
  field-gap: '8px'
  field-inset: '12px'
  compact-gap: '20px'
  content-gap: '24px'
  heading-gap: '32px'
  gutter: 'clamp(20px, 4.2vw, 88px)'
  section: 'clamp(64px, 7vw, 128px)'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.bone}'
    typography: '{typography.action}'
    rounded: '{rounded.square}'
    padding: '16px 22px'
  button-primary-fill:
    backgroundColor: '{colors.mineral-dark}'
    textColor: '{colors.bone}'
  button-bone:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    typography: '{typography.action}'
    rounded: '{rounded.square}'
    padding: '16px 22px'
  button-bone-fill:
    backgroundColor: '{colors.mineral}'
    textColor: '{colors.ink}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.action}'
    rounded: '{rounded.square}'
    padding: '16px 22px'
  text-field:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.square}'
    padding: '{spacing.field-inset}'
  navigation:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    height: '88px'
  category-chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
    padding: '8px 12px'
  category-chip-selected:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.bone}'
  product-card:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
  composition-board:
    backgroundColor: '#dde0d3'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
    padding: '25px 30px'
---

# Design System: Style Ease — Black Label

## Overview

**Creative North Star: "Clothing as spatial composition"**

Style Ease frames clothing as spatial composition: a complete photograph, a deliberate interval and a clear next action. The house is architectural, confident and precise. Olive-black ink, ivory and mineral grounds support optical serif lettering and quiet shopping typography.

Discovery allows scale, staggered image arrangements and transitions from monochrome into the photograph's real colour. Reading uses authored sequences and generous text measures; shopping and checkout increase information density and reduce motion. Style Studio makes references into a visual composition while exact variant choices remain explicit.

The second-stage world is code-led and user-pinned (user-pinned-black-label-creative-v2). The existing direction contract and rendered source govern it; there is no approved raster comp or QUALITY BAR card. PRODUCT.md retains product truth. This file records the visual system rather than redefining purchasing, privacy or persistence.

**Key Characteristics:**

- Complete-source photographs, with space around the subject instead of forced crops.
- Bodoni Moda display lettering, DM Sans task typography and the custom lowercase house wordmark.
- Flat square controls, sparse structural rules and a restrained mineral tonal family.
- Sliding button fill and reversible true-colour reveal, with keyboard, touch and reduced-motion equivalents.
- Distinct discovery, reading, commerce and visual atelier compositions inside one house.

## Colors

The palette is an olive-black and ivory house, with dark mineral depth and quiet mineral grounds. Photographs supply expressive colour.

The sidecar's tonal strips are derived swatch previews, not additional production colour tokens.

### Primary

- **Ink:** primary text, filled actions, dark editorial passages and the footer.
- **Mineral Dark:** the sliding fill of ink actions and selected-text ground. It is a restrained state colour, not a promotional accent.

### Neutral

- **Bone:** the main page and header ground, and text on ink.
- **Paper:** lighter modal and inspector surfaces.
- **Muted:** secondary copy on light grounds.
- **Line:** field groups, separators and neutral control edges.
- **Light Muted:** subordinate copy on ink.
- **Mineral:** Studio invitation and light button fill. Local image mats and the composition board use related mineral tints; they distinguish material, not new semantic statuses.

**The Real Colour Rule.** Monochrome is a reversible CSS treatment of the original photograph. Reveal its genuine colour; never simulate selectable sample colours by tinting the reference.

## Typography

**Display Font:** Bodoni Moda, serif.
**Body Font:** DM Sans, sans-serif.

Both variable fonts are self-hosted WOFF2 files with their existing OFL licensing. The lowercase wordmark is a custom optical arrangement and outline treatment derived from Bodoni Moda; use the supplied SVG rather than typesetting an approximation. Use the supplied house mark for favicon, empty states and identity contexts.

Bodoni carries the long, closely set editorial voice. DM Sans carries catalogue names, prices, choices, navigation and extended prose. The frontmatter records the base hierarchy; intentional surface overrides are part of composition, not a replacement global scale:

- **Display and headline:** restrained weight, tight tracking and balanced lines. Discovery may expand into very large statements; commerce keeps shorter, quieter headings.
- **Campaign statement:** the actual desktop clamp is `clamp(76px, 7.6vw, 142px)` with a close line-height (`0.99`); at phone widths it becomes `clamp(48px, 14vw, 78px)` with line-height `1.03`. Its deliberate two-line treatment belongs to Home.
- **Product title:** DM Sans at medium weight; product-card names use `19px/1.25` on desktop and `15px` on phones, with a narrow-screen `14px` override.
- **Body:** the default measure is capped at `68ch`. Editorial chapters use the editorial-body role and a narrower column; phones use `16px/1.8`.
- **Actions:** compact sentence-case text. Prices and counts use tabular figures. Metadata is subordinate; do not promote its smaller local sizes to a general reading scale.

**The Heading First Rule.** Begin a section with its actual heading. Do not add ornamental labels above it or make independent tools look like numbered steps. Collection counts, article identifiers and real checkout progress may communicate actual structure.

## Layout

Use a fluid aligned wrap capped at `1920px`, with the shared gutter and section spacing in the frontmatter. The gutter becomes `20px` at `600px` and below, then `16px` at `350px` and below. Grid tracks use `minmax(0, …)` so content can shrink without overflowing.

Discovery alternates spacious type, offset photographs, a dark reading invitation and a mineral atelier invitation. Its asymmetry is deliberate; it is not a repeated universal card grid. Collection covers lead into clearly shoppable edits and compact native search/sort controls. Journal covers lead into distinct proportion, colour and object essays, with chapters, reading navigation and related references. Keep these surface roles separate.

Commerce uses denser columns and explicit choices. The product grid has four desktop columns, three at the intermediate breakpoint and two on phones. Product detail pairs the full reference with variant controls, then stacks for small screens. The comparison table remains a true table with a minimum readable width (`670px`) inside a keyboard-focusable horizontal region; its guide and Previous/Next controls disclose the continuation. On phones, the order summary and total precede checkout progress and confirmation.

Style Studio pairs a category library with a larger composition board. The library narrows at `1000px`; at `600px` the board comes first, followed by the wardrobe and save controls. Opening the inspector focuses the native variant select and scrolls the inspector into view when necessary. The board's staggered reference tiles retain their own content bounds. Exact-variant controls remain available in the native form.

**The Complete Source Rule.** Preserve the full source bounds in every shipping image context. Containment and a proportion-led frame carry the composition; photographic cropping or zoom is not a substitute for layout.

The typed media helper and `assets/data/image-art-direction.json` own image identity, source dimensions, alt text, provenance, loading and per-context fit. All current entries preserve bounds `[0, 0, 100, 100]`, centred focal points and maximum zoom `1`. Catalogue cards use a `2 / 3` frame with the full source contained; detail, collection, editorial and hero contexts retain intrinsic proportions inside bounded areas. A source may already end at a garment edge: preserve that edge rather than claiming unseen subject content.

## Elevation & Depth

Ordinary surfaces are flat. Ivory, paper, ink and mineral grounds, white space and thin rules establish depth. Image mats make containment intentional. Slightly rotated inspiration references belong to the atelier composition; they are not an ordinary card treatment.

The native modal uses one diffuse shadow (`0 25px 90px #0006`) and a dimmed backdrop (`#0009`) with a small blur (`3px`). The full-screen navigation dialog uses its own lighter dimming (`#0007`). Focus is a crisp current-colour outline (`2px`) offset from the control (`5px`), rather than a shadow.

**The Flat Ground Rule.** Use ground changes, intervals and thin rules for ordinary hierarchy. Reserve the existing diffuse shadow and dimmed backdrop for a modal above the page.

## Shapes

Use square buttons, fields, frames, panels and dialogs. Keep fine structural borders (`1px`) and rectangular media. The circular bag count is a specific counter exception, not a pill language for other controls. Use real inline SVG for functional icons. Do not clip subject photographs into decorative silhouettes.

## Components

### Buttons

The primary action is an ink rectangle with bone text, an explicit border and generous horizontal separation before an arrow. Base minimum height is `54px`; phone buttons use `48px`, with the Home campaign action's local `46px` treatment. Bone and outlined variants share the same square structure.

The signature fill slides from the left with a slight skew over `560ms`, using `cubic-bezier(0.77, 0, 0.175, 1)`; its arrow advances `5px`. Pointer hover is gated to fine, hover-capable devices; keyboard focus shows the same fill. Press feedback scales the button to `0.985` over a short transition. Disabled buttons reduce opacity and keep their resting fill; processing states show progress feedback without disabling away a native submitter's name/value.

Reduced-motion mode removes these transitions and press transforms. The persistent focus outline remains.

### Inputs / Fields

Native inputs, selects and textareas have a transparent square ground, fine neutral stroke and the field inset from the frontmatter. Labels sit above fields with the shared field gap. Selects retain native interaction and a minimum height (`48px`); checkboxes and radios remain recognisable native controls. Preserve legends, field messages and visible focus.

Enhancement must preserve ordinary links and form submissions. JavaScript-only actions are hidden without JavaScript; the native navigation, product routes, variant choices, Studio selectors and save action remain usable.

### Navigation

The light header holds the real wordmark, route links and shopping utilities. The active route uses a thin underline, which also expands on focus and fine-pointer hover. At `850px` and below, a Menu control opens the full-screen ink native dialog; the header reduces to `76px`, then `72px` at phone widths. The dialog uses large serif links and returns focus on close. The footer provides a real close with route links, demonstration context and a large wordmark.

### Chips

Category filters are square outlined buttons with compact text and an explicit pressed state. Selected categories invert to ink and bone. They select categories; they do not resemble a progress sequence.

### Cards / Containers

Catalogue cards have no floating panel or shadow. A contained photograph leads, followed by category, price, name and quick-shop information. On touch devices an explicit colour control is available. Journal cards use article metadata and reading links; Collection covers use piece counts and shopping actions. Their differing composition and information order matter more than a shared card wrapper.

### Photographic colour release

Selected discovery and catalogue surfaces rest in grayscale. Fine-pointer hover, focus within the surface or the explicit pressed toggle releases the original source colour over `620ms`. “Keep monochrome” restores the restrained view; naturally monochrome sources remain naturally monochrome. Touch without JavaScript shows source colour rather than depending on an unavailable toggle. Product original-image viewing and the Studio board show full references without applying variant recolouring.

### Visual atelier

The mineral board contains up to six exact-variant references. Selection, replacement, removal, count and preview total remain visible tasks; saved looks form real persisted compositions. The empty arrangement is clearly labelled inspiration. It must not be presented as a shopper's saved board or a photograph of garments together.

New pieces use a short entrance (`250ms`). Below-the-fold section movement uses a small translation (`20px`, `500ms`), with content visible by default and the observer only preparing offscreen elements. Native navigation uses a bounded entrance (`320ms`) and short link staggering. Reduced motion removes transitions and entrances; there is no scroll hijack.

## Do's and Don'ts

### Do:

- **Do** use the source tokens and self-hosted fonts; preserve the custom wordmark and house mark assets.
- **Do** show the complete reference photograph and use its manifest context, intrinsic dimensions and responsive sources.
- **Do** let source colour return through pointer hover, keyboard focus and the explicit touch toggle.
- **Do** keep headings direct, shopping choices explicit and real metadata next to the content it describes.
- **Do** preserve visible focus, native forms, no-JavaScript routes and instant reduced-motion states.
- **Do** keep the order summary before the confirmation action on phones and reveal an opened Studio inspector in the viewport.

### Don't:

- **Don't** restore the earlier pure-black, DM Sans display or cinematic cover-crop rules.
- **Don't** place text over faces, fabricate colour variants, crop away source edges or scale photographs on hover.
- **Don't** turn Collections into Journal cards or turn Style Studio into a decorative dashboard.
- **Don't** add ornamental heading kickers, false step numbers, pill-shaped primary controls or ordinary card shadows.
- **Don't** hide content until an entrance animation runs or make hover the only way to reach information.
- **Don't** use subordinate caption sizing for instructions or general body copy.
