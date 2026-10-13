"""Render the no-WebGL poster from the same perimeter and curvature model as water.js."""
from pathlib import Path
import numpy as np
from PIL import Image
n=640
y,x=np.mgrid[0:n,0:n]/(n-1)
r=np.hypot(x-.5,y-.5)*2
def smooth(a,b,v):
 t=np.clip((v-a)/(b-a),0,1)
 return t*t*(3-2*t)
theta=np.arctan2(y-.5,x-.5+.000001)
edge=smooth(.38,1.,r)**1.65*(1-smooth(.98,1.07,r))
xq=x+.035*np.sin(y*9);yq=y+.028*np.sin(x*10)
xq*=1.55;yq*=1.55
hx=np.zeros_like(x);hy=hx.copy();hxy=hx.copy()
for kx,ky,a,phase in [(10.4,3.6,.0062,.6),(-4.8,12.5,.0038,1.8),(8.2,-9.6,.0035,3.4),(18,6,.00075,2.3),(-12,17,.00055,5.1),(3,6,.003,0)]:
 c=-a*np.cos(kx*xq+ky*yq+phase);hx+=c*kx*kx;hy+=c*ky*ky;hxy+=c*kx*ky
hx*=1.16;hy*=1.16;hxy*=1.16
det=(1+hx)*(1+hy)-hxy*hxy
dy,dx=np.gradient(det)
focus=np.exp(-abs(det)/np.maximum(.0625,(abs(dx)+abs(dy))*1.2))
shoulder=np.exp(-abs(det+.17)*6)
phase=r*25+1.3*np.sin(theta*3)+.65*np.sin(theta*7)+.28*np.sin(theta*11)
ridge=np.sin(phase)+.22*np.sin(theta*5-r*13)
dy,dx=np.gradient(phase)
band=np.exp(-(ridge/np.maximum(.16,(abs(dx)+abs(dy))*.75))**2)
shade=np.exp(-((np.sin(phase+.24)+.22*np.sin(theta*5-r*13))/.34)**2)
variation=.6+.24*np.sin(theta*5+r*8)+.16*np.sin(theta*8-r*5)
water=edge*(variation*(.095*band-.026*shade)+.08*focus-.018*shoulder-.012)
alpha=np.where(water>0,np.minimum(water*7,.74),np.minimum(-water*2.2,.19))
out=np.zeros((n,n,4),dtype=np.uint8)
for i,(hi,lo) in enumerate(zip([1,1,.985],[.55,.47,.34])):out[:,:,i]=np.where(water>0,hi,lo)*255
out[:,:,3]=alpha*255
Image.fromarray(out).save(Path(__file__).parent.parent/'assets/water-still.png',optimize=True)
