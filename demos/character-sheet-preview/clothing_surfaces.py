"""Editable vector clothing details for the local backpack-free torso study.

These are provisional visual designs, not authored profession equipment rules.
The caller clips details to an existing torso's alpha and retains rig metadata.
"""
import fitz
import numpy as np
from PIL import Image

STYLES = {
 'technician': ('Technician utility shirt', '#929394'),
 'scientist': ('Scientist lab jacket', '#d5d9dd'),
 'medic': ('Medic field tunic', '#b7c7c8'),
 'scout': ('Scout field jacket', '#798775'),
 'soldier': ('Soldier protective vest', '#717983'),
 'diplomat': ('Diplomat tailored jacket', '#536580'),
}

def torso_surface(source, source_ids, source_svg):
 """Rotate the shirt silhouette toward the front without adding skin patches.

 This changes local artwork only, not the authored skeleton or frame size.
 """
 width,height=source.size
 center=(width*.43,height*.55);shift=round(width*.07)
 source=source.rotate(45,resample=Image.Resampling.BICUBIC,center=center)
 source_ids=source_ids.rotate(45,resample=Image.Resampling.NEAREST,center=center)
 source=source.transform(source.size,Image.Transform.AFFINE,(1,0,-shift,0,1,0))
 source_ids=source_ids.transform(source_ids.size,Image.Transform.AFFINE,(1,0,-shift,0,1,0))
 opening=source_svg.index('>')+1
 source_svg=source_svg[:opening]+f'<g transform="translate({shift} 0) rotate(-45 {center[0]} {center[1]})">'+source_svg[opening:].replace('</svg>','</g></svg>')
 return source,source_ids,source_svg

def clothing_surface(source, style, source_ids):
 width,height=source.size
 shapes=[]
 def path(d,material,color,width=.008):
  shapes.append((material,f'<path d="{d}" fill="{color}" stroke="#292e34" stroke-width="{width}" stroke-linejoin="round"/>'))
 def pocket(x,y,w=.09,h=.09):
  path(f'M{x} {y}h{w}v{h}h{-w}Z',1,'#b1b5b8')
  path(f'M{x} {y+.025}h{w}',0,'none',.004)
 # Chest faces forward, like the authored head. Keep bone rotation untouched.
 if style=='technician':
  path('M-.27 -.22 L-.09 -.10 L0 .07 L.09 -.10 L.27 -.22 L.18 -.02 L0 .15 L-.18 -.02 Z',1,'#bec1c4')
  pocket(-.25,.03);pocket(.16,.03)
  path('M-.23 .055h.015v.095h-.015Z',4,'#e3a52e')
 elif style=='scientist':
  path('M-.27 -.25 L-.05 -.03 L-.12 .16 L-.02 .27 L0 .04 L.04 -.06 L.26 -.25 L.17 -.02 L.1 .15 L.02 .3 L-.08 .3 L-.2 .12 Z',1,'#edf0f2')
  path('M0 .06v.25',0,'none',.006);pocket(-.26,.10,.095,.12);pocket(.17,.10,.095,.12)
 elif style=='medic':
  path('M-.23 -.22 Q0 .07 .23 -.22 L.18 -.08 Q0 .17 -.18 -.08 Z',1,'#dae1e1')
  path('M0 .06v.22',0,'none',.006);pocket(.15,.04,.105,.12)
  path('M-.25 -.05h.12v.11h-.12Z',4,'#e3a52e')
  path('M-.21 -.035h.035v.08h-.035Z M-.235 -.01h.085v.03h-.085Z',0,'#e9eeee',0)
 elif style=='scout':
  path('M-.28 -.23 Q0 -.37 .28 -.23 L.2 -.05 Q0 -.22 -.2 -.05 Z',1,'#a2ae9b')
  path('M-.27 .015L.27 .015L.23 .12L-.23 .12Z',3,'#62676b')
  pocket(-.25,.15,.10,.08);pocket(.15,.15,.10,.08)
 elif style=='soldier':
  path('M-.28 -.21 L-.12 -.23 L-.08 -.03 L.08 -.03 L.12 -.23 L.28 -.21 L.28 .23 Q0 .36 -.28 .23 Z',2,'#343a40')
  path('M-.20 .01L.20 .01L.20 .18L-.20 .18Z',2,'#59636d')
  for y in [.06,.12,.20]:path(f'M-.23 {y}h.46',3,'none',.015)
 elif style=='diplomat':
  path('M-.27 -.24L-.06 -.07L0 .15L-.17 .025Z M.27 -.24L.06 -.07L0 .15L.17 .025Z',1,'#8595ae')
  path('M-.04 -.10L.04 -.10L.025 .07L-.025 .07Z',3,'#62676b')
  path('M0 .15v.14',0,'none',.006)
  path('M.16 .025h.09v.022h-.09Z',4,'#e3a52e')
 else:raise ValueError(style)
 transform=f'translate({width*.47} {height*.80}) scale({width*.96} {height*.53})'
 def svg(body):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"><g transform="{transform}">{body}</g></svg>'
 def raster(body):
  vector=fitz.open(stream=svg(body).encode(),filetype='svg');pdf=fitz.open('pdf',vector.convert_to_pdf());pix=pdf[0].get_pixmap(alpha=True)
  a=np.frombuffer(pix.samples,dtype=np.uint8).reshape(height,width,4).copy()
  # MuPDF RGBA is premultiplied. PIL alpha compositing expects straight RGB.
  alpha=a[:,:,3].astype(float);nz=alpha>0
  a[:,:,:3][nz]=np.clip(a[:,:,:3][nz].astype(float)*255/alpha[nz,None],0,255).astype('uint8')
  return Image.fromarray(a)
 base=np.array(source);alpha=base[:,:,3].copy();light=base[:,:,:3]@[.2126,.7152,.0722]
 region=alpha>0;skin=np.array(source_ids)==5;reference=max(1,float(np.median(light[region&~skin])))
 color=STYLES[style][1];target=np.array([int(color[k:k+2],16) for k in [1,3,5]])
 colored=np.clip(target*light[:,:,None]/reference,0,255).astype('uint8');base[:,:,:3][~skin]=colored[~skin]
 image=Image.alpha_composite(Image.fromarray(base),raster(''.join(s for _,s in shapes)))
 pixels=np.array(image);pixels[:,:,3]=alpha;pixels[alpha==0]=0
 ids=np.array(source_ids).copy()
 for material,shape in shapes:
  coverage=np.array(raster(shape))[:,:,3]>64
  ids[region&coverage&~skin]=material
 pixels[skin]=base[skin]
 # Keep an editable overlay rather than embedding the purchased torso.
 return Image.fromarray(pixels),Image.fromarray(ids),svg(''.join(s for _,s in shapes))
