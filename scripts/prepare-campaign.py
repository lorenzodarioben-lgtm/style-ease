"""Offline derivative generation; requires Pillow with AVIF support.

Run from the repository root. The licensed local source composition is preserved;
CSS continues to apply the same monochrome treatment. Never fetch at runtime.
"""

from pathlib import Path

from PIL import Image


source = Path("assets/images/campaign-1600.webp")
with Image.open(source) as original:
    for width in (400, 640, 960, 1600):
        image = original.copy()
        image.thumbnail((width, 3000), Image.Resampling.LANCZOS)
        target = source.with_name(f"campaign-{width}.avif")
        image.save(target, quality=65, speed=4)
        print(f"{target}: {image.width}x{image.height}, {target.stat().st_size} bytes")
