"""Offline, composition-preserving derivatives and art-direction manifest.

Requires Pillow (the session workspace runtime provides it). Sources are the
existing licensed 960px reference files; no request-time processing/recolouring.
"""
from pathlib import Path
from PIL import Image
import json

root=Path('assets'); inventory=json.loads((root/'data/creative-image-inventory.json').read_text())
notes={
 'campaign':'Three complete walking figures; preserve heads, hands and all footwear. Text belongs outside the photograph.',
 'p1':'Red-haired portrait in a white T-shirt; preserve hair, face and visible shirt. Original frame ends at the upper thighs.',
 'p2':'Jacket portrait from hair to thighs; preserve head, lapels and hands. Source itself is a three-quarter portrait.',
 'p3':'Denim styling from midriff to feet; the original intentionally excludes the head. Preserve both feet and denim silhouette.',
 'p4':'Seated fashion portrait on steps; preserve head, hands and boots.',
 'p5':'Cap portrait; cap intentionally shades the eyes. Preserve cap, mouth, hair and shoulder bounds.',
 'p6':'Green knitwear portrait against blue sky; preserve hair, raised arm and knit silhouette.',
 'p7':'Full-length blazer reference against a mural; preserve head, long trousers and feet.',
 'p8':'Shirt portrait against coloured architectural lines; preserve head and hands; source ends at hips.',
 'p9':'Complete backpack still life; preserve handle and base.',
 'p10':'Monochrome sunglasses still life; source has no meaningful colour to invent.',
 'p11':'Scarf portrait in snow; preserve head, scarf and hand.',
 'p12':'Watch still life; preserve full band and face.',
 'p13':'Landscape belt/watch still life; never force-cover into a portrait. Preserve the whole landscape source.',
 'p14':'Close knitwear portrait; the source intentionally frames a face partially behind a raised sleeve. No further crop.',
 'p15':'Boots still life on a ledge; preserve complete soles and shafts.',
 'p16':'Floating wallet still life; preserve all object corners and negative space.',
 'p17':'Earrings on fabric; preserve both earrings and chains.',
 'p18':'Woven bag still life; preserve full bag and handles.',
 'p19':'Bracelet still life; preserve the full object and source depth.',
 'p20':'Blouse portrait at a green doorway; preserve head, hands and visible blouse. The source intentionally ends at the skirt.'
}
records=[]
contexts=['card','detail','quick','line','compare','studio','saved','collection','editorial','hero','journal-cover']
for item in inventory:
    key='campaign' if item['id']=='campaign' else 'p'+str(item['id'])
    path=item['path']; img=Image.open(path.lstrip('/')); width,height=img.size
    avif_sources=[]
    if key!='campaign':
        for target_width in [480,640,960]:
            derivative=img.copy();derivative.thumbnail((target_width,2000),Image.Resampling.LANCZOS)
            avif_path=path.replace('-960.webp','-'+str(target_width)+'.avif')
            derivative.save(avif_path.lstrip('/'),quality=60,speed=6,icc_profile=img.info.get('icc_profile',b''))
            avif_sources.append({'path':avif_path,'width':derivative.width,'height':derivative.height})
    if key!='campaign':
        small=img.copy();small.thumbnail((480,2000),Image.Resampling.LANCZOS)
        small.save(path.lstrip('/').replace('-960.','-480.'),quality=82,method=6)
        medium=img.copy();medium.thumbnail((640,2000),Image.Resampling.LANCZOS)
        medium.save(path.lstrip('/').replace('-960.','-640.'),quality=82,method=6,icc_profile=img.info.get('icc_profile',b''))
    sources=[{'path':path,'width':width,'height':height}]
    if key!='campaign':
        small_path=path.replace('-960.','-480.');w,h=Image.open(small_path.lstrip('/')).size
        sources.insert(0,{'path':small_path,'width':w,'height':h})
        medium_path=path.replace('-960.','-640.');w,h=Image.open(medium_path.lstrip('/')).size
        sources.insert(1,{'path':medium_path,'width':w,'height':h})
    record={
      'id':key,'src':path,'width':width,'height':height,'orientation':'landscape' if width>height else 'portrait',
      'format':'webp','source':item['source'],'license':item['license'],
      'alt':notes[key].split(';')[0].split('. ')[0], 'subject':notes[key],
      'minimumVisibleBounds':[0,0,100,100], 'mobileCropRequired':False,
      'treatment':'natural monochrome' if key=='p10' else 'original colour; grayscale is CSS-only and reversible',
      'sources':sources,'avifSources':avif_sources,
      'contexts':{context:{'fit':'contain','desktopFocal':[50,50],'tabletFocal':[50,50],'mobileFocal':[50,50],
       'ratio':'2 / 3 frame; complete source contained' if context=='card' else 'intrinsic source ratio',
       'maxZoom':1,'loading':'eager' if context in ['hero','detail'] else 'lazy'} for context in contexts}
    }
    records.append(record)
(root/'data/image-art-direction.json').write_text(json.dumps(records,indent=2))
# Compile responsive focal metadata into CSP-safe CSS, never inline styles.
rules=[]
for breakpoint,field in [('', 'desktopFocal'),('(max-width:1000px)','tabletFocal'),('(max-width:600px)','mobileFocal')]:
    groups={}
    for record in records:
        for context,settings in record['contexts'].items():
            point=tuple(settings[field]); groups.setdefault(point,[]).append('.photo-'+record['id']+'.media-'+context+' img')
    section='\n'.join(','.join(selectors)+'{object-position:'+str(point[0])+'% '+str(point[1])+'%;}' for point,selectors in groups.items())
    rules.append('@media '+breakpoint+'{'+section+'}' if breakpoint else section)
(root/'css/art-direction.css').write_text('/* Generated by scripts/creative-v2-art.py; focal settings live in the manifest. */\n'+'\n'.join(rules))
print('21 art-directed sources; all 20 small derivatives rebuilt at actual source aspect ratios. Full-frame minimum bounds, no extra crop or invented colour.')
