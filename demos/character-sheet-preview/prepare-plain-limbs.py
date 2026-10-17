"""Export local side-specific parts from purchased Illustrator vector paths.
Original PNGs and SCML stay unchanged. Requires PyMuPDF, Pillow, NumPy and OpenCV.
"""
from pathlib import Path
import json, hashlib
import fitz
import numpy as np
import cv2
from PIL import Image, ImageDraw
from clothing_surfaces import STYLES, clothing_surface, torso_surface
PACK=Path('artwork/zombie-tds-main-characters')
OUT=PACK/'plain-limbs-v01'
DATA=json.loads((PACK/'preview-data.json').read_text(encoding='utf-8'))
MASKS=json.loads((PACK/'material-masks-v01/masks.json').read_text(encoding='utf-8'))
VECTOR=PACK/'Characters/AI/Characters&Bodyparts.ai'
if hashlib.sha256(VECTOR.read_bytes()).hexdigest()!='a95a7386e124a6554d61afb51562f6e218fd9d21097bb4e9257120f6454ddfba':
 raise ValueError('Native source changed; review vector path selections before exporting.')
DOC=fitz.open(VECTOR)
PATHS=DOC[0].get_drawings()
# Reviewed native path ranges. Pouches and tattoos are distinct vector paths.
SLEEVES={
 'knife1_0002_man2.png':([195.8,215.8,237.1,249.6],range(3392,3415),set(range(3392,3401))|{3414}),
 'knife1_0005_man5.png':([130.4,171.7,163.5,199.4],range(3415,3444),set(range(3415,3424))|{3443}),
 'knife1_0008_girl2.png':([399.6,183.8,427.7,207.9],range(2087,2126),set(range(2087,2100))|{2125}),
 'knife1_0011_girl5.png':([456.6,221.2,478.5,240.7],range(2184,2197),{2190,2191}),
}
SLEEVES.update({
 'man_gun1_0006_Layer-10.png':([162.0,7.0,222.2,67.7],range(4,51),set(range(4,10))|set(range(20,46))|{48,50}),
 'girl_gun1_0005_Layer-3.png':([426.0,9.2,483.6,66.6],range(804,887),set(range(804,847))|set(range(872,887))|{848,850,851,852,853,854,855,856,857,858,867,868,869,870,871}),
 'man_leg_0001.png':([195.5,94.9,219.4,132.0],range(621,631),{621,623,624,625,628}),
 'man_leg_0001 - 2.png':([224.8,94.9,248.7,132.0],range(654,664),{654,656,657,658,661}),
 'man_leg_0002.png':([169,90.8,192,145.6],range(598,621),{598,605,606,607,611,612,620}),
 'man_leg_0002 - 2.png':([252.2,90.8,275.4,145.6],range(631,654),{631,638,639,640,644,645,653}),
})
def sleeve(file):
 rect,indices,removed=SLEEVES[Path(file['src']).name]
 document=fitz.open();page=document.new_page(width=DOC[0].rect.width,height=DOC[0].rect.height)
 for i in indices:
  if i in removed:continue
  d=PATHS[i];shape=page.new_shape()
  for command in d['items']:
   if command[0]=='l':shape.draw_line(*command[1:])
   elif command[0]=='c':shape.draw_bezier(*command[1:])
   elif command[0]=='re':shape.draw_rect(command[1])
   elif command[0]=='qu':shape.draw_quad(command[1])
   else:raise ValueError(command[0])
  fill=d['fill']
  # Brown equipment bands become cloth. Girl's upper-arm skin becomes a sleeve.
  if fill and max(fill)>.1:
   light=sum(v*w for v,w in zip(fill,[.2126,.7152,.0722]))
   fill=(light,light,light)
  outline=i in {3402,3403,3425,3426,2102,2103,2104,622,655,599,632,46,47,49}
  shape.finish(fill=fill,color=(.03,.03,.03) if outline else d['color'],width=.3 if outline else (d['width'] or 0),closePath=d['closePath'],even_odd=d['even_odd'],fill_opacity=d['fill_opacity'] if d['fill_opacity'] is not None else 1,stroke_opacity=d['stroke_opacity'] if d['stroke_opacity'] is not None else 1)
  shape.commit()
 pix=page.get_pixmap(matrix=fitz.Matrix(8,8),clip=fitz.Rect(rect),alpha=True)
 image=Image.frombytes('RGBA',[pix.width,pix.height],pix.samples).resize((file['width'],file['height']),Image.Resampling.LANCZOS)
 # Retained cloth paths define the silhouette; the original overall outline
 # included the pouch and is excluded from these native vector exports.
 a=np.array(image);lum=a[:,:,:3].mean(axis=2)
 a[(lum<8)&(a[:,:,3]>0),3]=0
 image=Image.fromarray(a)
 ids=np.where((a[:,:,3]>0)&(lum>16),1,0).astype('uint8')
 return image,Image.fromarray(ids)
def clean_forearm(file,material,source=None,join_surface=False):
 # Make an editable vector surface from the part's external silhouette. External
 # contour only: no wrap stripes, pouch detail or hollow accessory cuffs survive.
 source=source if source is not None else Image.open(PACK/file['src']).convert('RGBA');a=np.array(source)
 contours,_=cv2.findContours((a[:,:,3]>64).astype('uint8'),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
 contour=cv2.convexHull(np.concatenate(contours)) if join_surface else max(contours,key=cv2.contourArea)
 points=cv2.approxPolyDP(contour,.012*cv2.arcLength(contour,True),True)[:,0,:].astype(float)
 # Smooth closed contour with cubic segments, retaining the original frame.
 commands=[f'M {points[0,0]:.3f} {points[0,1]:.3f}']
 for j in range(len(points)):
  previous,start,end,following=[points[k%len(points)] for k in [j-1,j,j+1,j+2]]
  c1=start+(end-previous)/6;c2=end-(following-start)/6
  commands.append(f'C {c1[0]:.3f} {c1[1]:.3f} {c2[0]:.3f} {c2[1]:.3f} {end[0]:.3f} {end[1]:.3f}')
 colors=['#70503b','#f1ba89','#d59b70','#926449'] if material==5 else ['#44474a','#b5b8ba','#929394','#626669']
 width,height=source.size
 path=' '.join(commands)+' Z'
 # MuPDF does not rasterize SVG paint-server gradients reliably. Explicit
 # vector strips clipped to the silhouette keep shading portable and editable.
 shades=[]
 for n in range(48):
  t=n/47*3;j=min(2,int(t));f=t-j
  first=np.array([int(colors[j][k:k+2],16) for k in [1,3,5]])
  last=np.array([int(colors[j+1][k:k+2],16) for k in [1,3,5]])
  rgb=np.clip(first*(1-f)+last*f,0,255).astype(int);color='#'+''.join(f'{v:02x}' for v in rgb)
  shades.append(f'<rect x="{n*width/48}" y="0" width="{width/48+.1}" height="{height}" fill="{color}"/>')
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><defs><clipPath id="outline"><path d="{path}"/></clipPath></defs><g clip-path="url(#outline)">{"".join(shades)}</g><path d="{path}" fill="none" stroke="#252526" stroke-width="1.5"/></svg>'
 # MuPDF also ignores SVG clipPath when converting strips. Rasterize the
 # solid vector silhouette for alpha, then sample the same gradient inside it.
 silhouette=f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"><path d="{path}" fill="#ffffff" stroke="#252526" stroke-width="1.5"/></svg>'
 vector=fitz.open(stream=silhouette.encode(),filetype='svg');pdf=fitz.open('pdf',vector.convert_to_pdf());pix=pdf[0].get_pixmap(alpha=True)
 image=Image.frombytes('RGBA',[pix.width,pix.height],pix.samples)
 assert image.size==source.size
 a=np.array(image);surface=a[:,:,:3].mean(axis=2)>100
 palette=np.array([[int(color[k:k+2],16) for k in [1,3,5]] for color in colors])
 gradient=np.stack([np.interp(np.linspace(0,1,width),np.linspace(0,1,4),palette[:,channel]) for channel in range(3)],axis=1)
 rgb=np.broadcast_to(gradient,(height,width,3));a[:,:,:3][surface]=rgb[surface].astype('uint8')
 assert np.count_nonzero(a[:,:,3]==0)>width*height*.15,'Forearm background must remain transparent'
 image=Image.fromarray(a);ids=np.where(surface&(a[:,:,3]>0),material,0).astype('uint8')
 return image,Image.fromarray(ids),svg
records=[]
for character in DATA['characters']:
 files=character['files'];bat=next(a for a in character['animations'] if a['name']=='Walk_bat');rifle=next(a for a in character['animations'] if a['name']=='Walk_riffle')
 selections=[]
 ref=next(r for r in bat['mainline'][0]['objects'] if r['z_index']==2);k=bat['timelines'][str(ref['timeline'])]['keys'][0]['transform'];selections.append(('center','torso',2,files[f"{k.get('folder',0)}:{k['file']}"]))
 for side,upperZ,lowerZ in [('left',3,4),('right',7,5)]:
  for kind,z in [('upper-arm',upperZ),('forearm',lowerZ)]:
   ref=next(r for r in bat['mainline'][0]['objects'] if r['z_index']==z);k=bat['timelines'][str(ref['timeline'])]['keys'][0]['transform'];file=files[f"{k.get('folder',0)}:{k['file']}"];selections.append((side,kind,z,file))
 for ref in rifle['mainline'][0]['objects']:
  if ref['z_index']>1:continue
  side='left' if ref['z_index']==0 else 'right'
  keys=rifle['timelines'][str(ref['timeline'])]['keys']
  for key in keys:
   k=key['transform'];file=files[f"{k.get('folder',0)}:{k['file']}"]
   if not any(s[0]==side and s[1].startswith('leg') and s[3]['src']==file['src'] for s in selections):selections.append((side,'leg-'+('short' if '_0002' in file['name'] else 'long'),ref['z_index'],file))
 for side,kind,z,file in selections:
  source=PACK/file['src'];sha=hashlib.sha256(source.read_bytes()).hexdigest()
  stem=f"{character['name']}/{side}-{kind}";dest=OUT/f'{stem}.png';dest.parent.mkdir(parents=True,exist_ok=True)
  if kind=='torso':
   # The native garment is interrupted by baked-in straps. Bridge those gaps
   # from the retained cloth shapes, not the larger backpack silhouette.
   surface,_=sleeve(file);image,ids,svg=clean_forearm(file,1,source=surface,join_surface=True)
   image,ids,svg=torso_surface(image,ids,svg);(OUT/f'{stem}.svg').write_text(svg,encoding='utf-8')
  elif kind=='forearm':
   image,ids,svg=clean_forearm(file,1 if character['name']=='Man' else 5);(OUT/f'{stem}.svg').write_text(svg,encoding='utf-8')
  elif Path(file['src']).name in SLEEVES:
   image,ids=sleeve(file)
   if kind.startswith('leg'):ids=Image.open(PACK/MASKS['files'][file['src']]['map']).convert('L')
  else:image=Image.open(source).convert('RGBA');ids=Image.open(PACK/MASKS['files'][file['src']]['map']).convert('L')
  assert image.size==(file['width'],file['height']) and ids.size==image.size
  image.save(dest);ids.save(OUT/f'{stem}-mask.png')
  a=np.array(image);mask=np.array(ids);mask[a[:,:,3]==0]=0;ids=Image.fromarray(mask);ids.save(OUT/f'{stem}-mask.png');light=a[:,:,:3]@[.2126,.7152,.0722];m=np.array(ids)
  refs={name:max(1,float(np.median(light[m==entry['id']]))) for name,entry in MASKS['materials'].items() if np.any(m==entry['id'])}
  records.append({'character':character['name'],'side':side,'variant':'plain','part':kind,'z':z,'source':file['src'],'sha256':sha,'src':f'plain-limbs-v01/{stem}.png','name':f'Plain limbs/{character["name"]}/{side}-{kind}.png','width':file['width'],'height':file['height'],'pivot_x':file.get('pivot_x',0),'pivot_y':file.get('pivot_y',1),'map':f'plain-limbs-v01/{stem}-mask.png','references':refs})
  assert hashlib.sha256(source.read_bytes()).hexdigest()==sha
# Compact leg images scale toward the top-center hip anchor within the unchanged
# source frame, so rear toes are less exposed when the backpack is absent.
for base in list(records):
 if not base['part'].startswith('leg-'):continue
 image=Image.open(PACK/base['src']).convert('RGBA');ids=Image.open(PACK/base['map']);w,h=image.size
 small=(round(w*.40),round(h*.40));position=((w-small[0])//2,0)
 compact=Image.new('RGBA',(w,h));compact.paste(image.resize(small,Image.Resampling.LANCZOS),position)
 mask=Image.new('L',(w,h));mask.paste(ids.resize(small,Image.Resampling.NEAREST),position)
 pixels=np.array(compact);m=np.array(mask);m[pixels[:,:,3]==0]=0
 stem=f"{base['character']}/{base['side']}-{base['part']}-compact"
 compact.save(OUT/f'{stem}.png');Image.fromarray(m).save(OUT/f'{stem}-mask.png')
 light=pixels[:,:,:3]@[.2126,.7152,.0722];refs={name:max(1,float(np.median(light[m==entry['id']]))) for name,entry in MASKS['materials'].items() if np.any(m==entry['id'])}
 records.append({**base,'variant':'compact','label':'Compact','src':f'plain-limbs-v01/{stem}.png','name':f"Compact legs/{base['character']}/{base['side']}-{base['part']}.png",'map':f'plain-limbs-v01/{stem}-mask.png','references':refs})
# Profession tops are visual studies over the registered plain torso surface.
for base in list(records):
 if base['part']!='torso':continue
 for style,(label,color) in STYLES.items():
  image,ids,svg=clothing_surface(Image.open(PACK/base['src']).convert('RGBA'),style,Image.open(PACK/base['map']))
  stem=f"{base['character']}/center-torso-{style}"
  image.save(OUT/f'{stem}.png');ids.save(OUT/f'{stem}-mask.png');(OUT/f'{stem}.svg').write_text(svg,encoding='utf-8')
  a=np.array(image);m=np.array(ids);light=a[:,:,:3]@[.2126,.7152,.0722]
  refs={name:max(1,float(np.median(light[m==entry['id']]))) for name,entry in MASKS['materials'].items() if np.any(m==entry['id'])}
  records.append({**base,'variant':style,'label':label,'src':f'plain-limbs-v01/{stem}.png','name':f"Clothing/{base['character']}/{label}.png",'map':f'plain-limbs-v01/{stem}-mask.png','references':refs})
# Sleeve variants use the same native part silhouette and exclusive material
# masks. A short sleeve ends halfway along the upper arm; the forearm stays bare.
# Long sleeves cover upper arm and forearm. Clean forearms exclude wrist gear.
for base in list(records):
 if base['part'] not in ('upper-arm','forearm'):continue
 for length in ['long','short']:
  image=Image.open(PACK/base['src']).convert('RGBA');ids=Image.open(PACK/base['map'])
  if base['part']=='forearm':
   image,ids,svg=clean_forearm({**base,'src':base['source']},1 if length=='long' else 5)
   (OUT/f"{base['character']}/{base['side']}-{length}-sleeve-forearm.svg").write_text(svg,encoding='utf-8')
  a=np.array(image);ids=np.array(ids)
  paint=(a[:,:,3]>0)&(a[:,:,:3].mean(axis=2)>16)
  if base['part']=='upper-arm':
   yy,xx=np.mgrid[:a.shape[0],:a.shape[1]]
   start,end=([.82,.12],[.18,.80]) if base['side']=='left' else ([.25,.72],[.82,.12])
   dx,dy=end[0]-start[0],end[1]-start[1]
   along=((xx/a.shape[1]-start[0])*dx+(yy/a.shape[0]-start[1])*dy)/(dx*dx+dy*dy)
   ids[paint]=1
   if length=='short':ids[paint&(along>.52)]=5
  else:
   ids[(a[:,:,3]>0)&np.isin(ids,[1,5])]=1 if length=='long' else 5
  light=a[:,:,:3]@[.2126,.7152,.0722]
  for material,target in [(1,[146,147,148]),(5,[213,155,112])]:
   region=(ids==material)&paint
   if np.any(region):
    reference=max(1,float(np.median(light[region])))
    a[:,:,:3][region]=np.clip(np.array(target)*light[region,None]/reference,0,255).astype('uint8')
  ids[a[:,:,3]==0]=0
  stem=f"{base['character']}/{base['side']}-{length}-sleeve-{base['part']}"
  Image.fromarray(a).save(OUT/f'{stem}.png');Image.fromarray(ids).save(OUT/f'{stem}-mask.png')
  light=a[:,:,:3]@[.2126,.7152,.0722]
  refs={name:max(1,float(np.median(light[ids==m['id']]))) for name,m in MASKS['materials'].items() if np.any(ids==m['id'])}
  records.append({**base,'variant':length,'src':f'plain-limbs-v01/{stem}.png','name':f"Sleeves/{base['character']}/{base['side']}-{length}-{base['part']}.png",'map':f'plain-limbs-v01/{stem}-mask.png','references':refs})
(OUT/'README.md').write_text('Local derived Man/Girl parts: 54 independent PNGs and masks, including backpack-free torsos, twelve forward-facing profession clothing studies and eight compact leg copies. Each has separate left/right plain upper arms, forearms and long/short leg frames, plus long/short sleeve upper-arm/forearm variants. Native vector pouch/tattoo paths removed. Clean forearms omit wrist wraps and cuff accessories and have editable SVG surfaces with smoothed source outlines. Upper-arm bands are cloth shading; short sleeves expose distal upper arm/forearm (skin ID5), long sleeves cover both (shirt ID1). Dimensions/pivots preserved; shading, outline smoothing, hem placement and native crop registration provisional. Preview sidebar tiles support independent upper-arm and lower-arm choices on each side, plus Authored/No backpack torso comparison. Torso cloth uses shirt ID1 without an added neck skin patch; forward chest overlays preserve the previous back silhouette. Compact leg tiles use 40 percent image size anchored top-center in unchanged source frames. All visual fitting remains provisional. Review before-after.png. Sources unchanged; keep derived artwork local.\n',encoding='utf-8')
(OUT/'index.json').write_text(json.dumps({'format':'plain-limbs-v1','parts':records},indent=2)+'\n',encoding='utf-8')
sheet=Image.new('RGB',(800,len(records)*100),'#d0d7dc');draw=ImageDraw.Draw(sheet)
for i,r in enumerate(records):
 draw.text((5,i*100+5),f"{r['character']} {r['side']} {r['part']}",fill='black')
 for x,path in [(250,PACK/r['source']),(480,PACK/r['src'])]:
  im=Image.open(path).convert('RGBA');im.thumbnail((180,90));sheet.paste(im,(x,i*100),im)
sheet.save(OUT/'before-after.png')
print(f'Prepared {len(records)} independently editable side-specific parts: {OUT}')
