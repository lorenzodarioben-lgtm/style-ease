"""Offline wordmark outlines from the project's SIL OFL fonts (fontTools[woff])."""
from pathlib import Path
import re
import sys
sys.path.insert(0, str(Path('../_blacklabel_tools/fonttools').resolve()))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

target=Path('assets/brand'); target.mkdir(exist_ok=True)
def outline(text, font_path, weight, spacing=0):
    font=TTFont(font_path); glyphs=font.getGlyphSet(location={'wght':weight,'opsz':72})
    cmap=font.getBestCmap(); pen=SVGPathPen(glyphs); bounds=BoundsPen(glyphs); x=0
    kern={'st':-14,'ty':-35,'yl':-10,'le':-10,'ea':-12,'as':-10,'se':-6}
    for i,char in enumerate(text):
        glyph=glyphs[cmap[ord(char)]]
        if i:x+=kern.get(text[i-1:i+1],0)
        glyph.draw(TransformPen(pen,(1,0,0,1,x,0)));glyph.draw(TransformPen(bounds,(1,0,0,1,x,0)))
        x+=glyph.width+spacing
    d=re.sub(r'-?\d+\.\d+',lambda m:str(round(float(m.group()),1)),pen.getCommands())
    return d,bounds.bounds
def svg(name,text,font,weight,spacing=0):
    d,(x0,y0,x1,y1)=outline(text,font,weight,spacing)
    pad=18; width=x1-x0+pad*2;height=y1-y0+pad*2
    value=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {height:.1f}" fill="currentColor"><title>Style Ease</title><path transform="translate({pad-x0:.1f} {y1+pad:.1f}) scale(1 -1)" d="{d}"/></svg>'
    (target/name).write_text(value)

serif='assets/fonts/bodoni-moda.woff2';sans='assets/fonts/dm-sans.woff2'
svg('concept-a.svg','style ease',serif,550,-8)
svg('concept-b.svg','STYLE EASE',sans,650,45)
svg('concept-c.svg','Style / Ease',serif,400,12)
svg('favicon-a.svg','e',serif,750,0)
svg('favicon-b.svg','SE',sans,800,-25)
svg('favicon-c.svg','S',serif,550,0)
print('Three original outlined/optically spaced concepts plus tiny-size alternatives. Source fonts remain OFL; no runtime dependency.')
