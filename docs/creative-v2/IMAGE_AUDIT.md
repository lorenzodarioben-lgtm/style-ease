# Image laboratory

## Inventory and source bounds

The actual full-colour inventory was rendered and inspected in evidence/concepts/images-1440.png: 20 original reference images and the campaign. Each is recorded with true dimensions, orientation, source/licence, contextual fit/ratio/focal anchors, minimum visible bounds, zoom safety, alt text, loading and responsive files in assets/data/image-art-direction.json. This is shipping metadata consumed by the typed view helper, not an unconnected audit spreadsheet.

Key source facts: p3 is deliberately a midriff-to-feet image; p7 contains a complete standing figure; p13 is a landscape still life; p14 is an intentionally close portrait, and p10's source is inherently monochrome. No missing head, new angle or artificial colour is invented. The campaign includes all three walking figures and their footwear; typography is outside its complete frame.

## Reproduced defects and repair

The source 960px images were not all 3:4. Actual ratios include 960×1440, 960×1200, 960×768 and 960×1467, while the old helper declared universal 960×1280. Several old 480px files had separately cropped ratios, so even a focal CSS change could not preserve the full source. The offline script regenerates all twenty small files from the existing licensed 960px references at their true aspect ratios, quality 82 WebP. No recolouring or request-time processing.

ArtImage now receives an explicit usage context. Product cards have a deliberate contained portrait frame, detail/editorial images retain the source ratio, line/compare/Studio references retain full source content inside task-sized frames, and the campaign has responsive AVIF and high priority. All art-directed assets receive content fingerprints. Full-source minimum visible bounds are 0/0/100/100; zoom factor 1 is the safe default. Contextual contain is intentional; no portrait is force-covered into a shallow landscape.

Colour changes are reversible CSS grayscale 1→0 over original pixels. The inherently monochrome p10 does not advertise a colour toggle. Product variant choices never recolour a photograph.

## Gate status

Source inventory: visually inspected. M1 contextual component and full-frame derivatives implemented; actual six-width before/after context contact sheets and final high-DPR inspection remain open until the completed route designs are captured. Do not treat this source audit as final page approval.
