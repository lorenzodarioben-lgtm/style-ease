# Image laboratory

## Inventory and source bounds

The actual full-colour inventory was rendered and inspected in evidence/concepts/images-1440.png: 20 original reference images and the campaign. Each is recorded with true dimensions, orientation, source/licence, contextual fit/ratio/focal anchors, minimum visible bounds, zoom safety, alt text, loading and responsive files in assets/data/image-art-direction.json. This is shipping metadata consumed by the typed view helper, not an unconnected audit spreadsheet.

Key source facts: p3 is deliberately a midriff-to-feet image; p7 contains a complete standing figure; p13 is a landscape still life; p14 is an intentionally close portrait, and p10's source is inherently monochrome. No missing head, new angle or artificial colour is invented. The campaign includes all three walking figures and their footwear; typography is outside its complete frame.

## Reproduced defects and repair

The source 960px images were not all 3:4. Actual ratios include 960×1440, 960×1200, 960×768 and 960×1467, while the old helper declared universal 960×1280. Several old 480px files had separately cropped ratios, so even a focal CSS change could not preserve the full source. The offline script regenerates all twenty small files from the existing licensed 960px references at their true aspect ratios, quality 82 WebP. No recolouring or request-time processing.

ArtImage now receives an explicit usage context. Product cards have a deliberate contained portrait frame, detail/editorial images retain the source ratio, line/compare/Studio references retain full source content inside task-sized frames, and the campaign has responsive AVIF and high priority. All art-directed assets receive content fingerprints. Full-source minimum visible bounds are 0/0/100/100; zoom factor 1 is the safe default. Contextual contain is intentional; no portrait is force-covered into a shallow landscape.

Colour changes are reversible CSS grayscale 1→0 over original pixels. The inherently monochrome p10 does not advertise a colour toggle. Product variant choices never recolour a photograph.

## Gate status

Source inventory and final page compositions inspected. Final image lab:48 actual before/after/source contact sheets, four contexts(card/detail/Studio/line), six widths320/390/768/1024/1440/1920, each at DPR1 and2.1008 source/context checks found zero broken images, ratio mismatches or loss of contain fit. Final114-route sweep likewise has no broken media, overflow or axe/JS findings. See `evidence/image-lab/qa.json` and `evidence/after/qa.json`.

Source provenance accompanies every reference through the manifest/inventory and63 WebP sidecars; the final scan reports0 missing. A43-file pixel/profile comparison confirms adding provenance did not change the existing decoded pixels or colour profiles. The60 new product AVIF derivatives also have sidecars; decoded aspect ratios and ICC profiles were checked. Campaign derivatives retain their source attribution through the manifest. No AI-generated garment imagery was introduced. Full contextual frame safety is intentional; no reviewer claim of perfect source photography is implied.

## Measured responsive delivery repair

The final mobile laboratory first exposed product LCP3.466s and Journal LCP3.635s. The physical phone image slots fell between480 and960px candidates at simulated DPR1.75. Added a640px WebP intermediate and480/640/960 AVIF sources for all twenty products, preserving their full source bounds and ICC profiles. The typed picture helper prefers AVIF and keeps WebP fallbacks. Corrected detail and Journal-cover sizes to the actual mounted widths rather than the whole viewport.

After these repairs, measured product LCP is2.265s and Journal2.416s; the three home runs are2.120–2.364s. No creative content was removed or hidden. The final1008-check laboratory selected modern product sources960 times; the remaining48 checks use the campaign reference. Source dimensions are decoded from the selected file, avoiding browser density-corrected naturalWidth rounding. See performance/summary.json, the preserved pre-640 and pre-cover-sizes reports, and avif-source-checks.json in evidence.
