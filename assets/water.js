/* A shallow refracting surface. Only this canvas receives water shading;
   the complete interface is in its own stacking context above it. */
(() => {
  'use strict';
  const screen = document.getElementById('screen');
  const canvas = document.getElementById('water-canvas');
  const layer = canvas.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fallbackRipple = document.getElementById('ripple');
  let gl, program, frame = 0, previous = 0;
  const origin = performance.now();
  let waterTime = 0, lastDraw = 0, turnAt = -100, turnAmount = 0;
  let enabled = screen.dataset.liquid !== 'off', lost = false;
  const taps = [];
  const tapData = new Float32Array(12);
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 uv;
    uniform float time;
    uniform float turn;
    uniform vec3 taps[4];
    // Crossing-wave curvature adds organic detail to the continuous perimeter fronts.
    // The determinant approximates the concentration of refracted light.
    void wave(inout vec3 h, vec2 p, vec2 k, float a, float phase){
      float c=-a*cos(dot(k,p)+phase);
      h+=c*vec3(k.x*k.x,k.y*k.y,k.x*k.y);
    }
    float gaussian(float x){return exp(-x*x);}
    void main(){
      vec2 p=vec2(uv.x,1.-uv.y);
      vec2 centered=p-.5;
      float radius=length(centered)*2.;
      float theta=atan(centered.y,centered.x+.000001);
      // A long radial fade avoids a visible inner boundary or empty edge sectors.
      float edge=pow(smoothstep(.38,1.,radius),1.65)*(1.-smoothstep(.98,1.07,radius));
      float t=time*.065;
      vec2 q=p+vec2(.035*sin(p.y*9.+t*.7),.028*sin(p.x*10.-t*.6));
      q*=1.55;
      q+=turn*vec2(.012*sin(p.y*7.),.009*cos(p.x*8.));
      vec3 h=vec3(0.);
      wave(h,q,vec2(10.4,3.6),.0062,t+.6);
      wave(h,q,vec2(-4.8,12.5),.0038,-t*.73+1.8);
      wave(h,q,vec2(8.2,-9.6),.0035,t*.61+3.4);
      wave(h,q,vec2(18.0,6.0),.00075,-t*.4+2.3);
      wave(h,q,vec2(-12.0,17.0),.00055,t*.52+5.1);
      wave(h,q,vec2(3.0,6.0),.003,t*.3);
      h*=1.16;
      float det=(1.+h.x)*(1.+h.y)-h.z*h.z;
      float width=.0625;
      #ifdef WATER_DERIVATIVES
      width=max(width,fwidth(det)*1.2);
      #endif
      float focus=exp(-abs(det)/width);
      float shoulder=exp(-abs(det+.17)*6.);
      // Long, gently folded fronts follow the edge all the way around. The
      // crossing-wave detail keeps them from reading as drawn concentric rings.
      float phase=radius*25.+1.3*sin(theta*3.+t*.55)
                 +.65*sin(theta*7.-t*.38)+.28*sin(theta*11.+t*.27);
      float ridge=sin(phase)+.22*sin(theta*5.-radius*13.+t*.35);
      float bandWidth=.16;
      #ifdef WATER_DERIVATIVES
      bandWidth=max(bandWidth,fwidth(phase)*.75);
      #endif
      float band=gaussian(ridge/bandWidth);
      float shade=gaussian((sin(phase+.24)+.22*sin(theta*5.-radius*13.+t*.35))/.34);
      float variation=.6+.24*sin(theta*5.+radius*8.+t*.4)+.16*sin(theta*8.-radius*5.-t*.3);
      float water=edge*(variation*(.095*band-.026*shade)+.08*focus-.018*shoulder-.012);
      // Each touch sends a short train of capillary waves through the background.
      for(int i=0;i<4;i++){
        float age=taps[i].z;
        if(age>=0.&&age<2.6){
          float seed=dot(taps[i].xy,vec2(17.3,29.1));
          // Slight directional stretch and a drifting origin avoid perfect target rings.
          vec2 drift=vec2(cos(seed),sin(seed))*.004*age;
          vec2 d=p-taps[i].xy-drift;
          float cs=cos(seed),sn=sin(seed);
          vec2 local=vec2(cs*d.x+sn*d.y,-sn*d.x+cs*d.y)*vec2(.94,1.04);
          float dist=length(local);
          float azimuth=atan(local.y,local.x+.000001);
          float r=.015+age*.095;
          float fade=smoothstep(0.,.12,age)*(1.-smoothstep(.55,2.6,age));
          float ripple=0.;
          for(int j=0;j<3;j++){
            float lane=float(j);
            float offset=lane*.021;
            float irregularity=.038*sin(azimuth*3.+seed+lane*.28-age*.45)
                              +.019*sin(azimuth*5.-seed+lane*.43+age*.25);
            float front=(r-offset)*(1.+irregularity);
            float distanceToFront=dist-front;
            float softness=1.+.16*sin(azimuth*2.+seed+lane*.7);
            float crest=gaussian(distanceToFront/(.0025*softness));
            float trough=gaussian((distanceToFront+.004)/(.0055*softness));
            float strength=(1.-lane*.28)*(.86+.14*sin(azimuth*2.+seed+lane));
            ripple+=(crest-.32*trough)*strength*smoothstep(.005,.025,r-offset);
          }
          float lightDirection=.76+.24*dot(d/max(dist,.001),vec2(-.6,-.8));
          water+=ripple*.11*fade*lightDirection;
        }
      }
      // Separate warm shadow and light, without changing or warping the UI.
      vec3 light=vec3(1.,1.,.985);
      vec3 shadow=vec3(.55,.47,.34);
      float alpha=water>0.?min(water*7.,.74):min(-water*2.2,.19);
      gl_FragColor=vec4(water>0.?light:shadow,alpha);
    }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  let uTime, uTurn, uTaps;
  function setup() {
    gl = canvas.getContext('webgl', {alpha:true, antialias:false, depth:false, stencil:false,
      premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:'low-power'});
    if (!gl) return false;
    program = gl.createProgram();
    const derivatives=gl.getExtension('OES_standard_derivatives');
    const prefix=derivatives?'#extension GL_OES_standard_derivatives : enable\n#define WATER_DERIVATIVES\n':'';
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, prefix+fragment);
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program,'position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    uTime=gl.getUniformLocation(program,'time');uTurn=gl.getUniformLocation(program,'turn');uTaps=gl.getUniformLocation(program,'taps[0]');
    layer.classList.add('water-ready');
    resize(); return true;
  }
  function resize() {
    if (!gl || lost) return;
    // A capped backing surface keeps the Pi's fragment workload independent of display DPI.
    const size=Math.min(512,Math.max(320,Math.round(screen.clientWidth*.7)));
    canvas.width=canvas.height=size; gl.viewport(0,0,size,size); draw(performance.now());
  }
  function draw(now) {
    if (!gl || lost) return;
    const seconds=(now-origin)/1000;
    const age=seconds-turnAt;
    const disturbance=motion.matches?0:turnAmount*Math.sin(age*3.2)*Math.exp(-age*1.7);
    for(let i=0;i<4;i++){
      const tap=taps[i];
      tapData[i*3]=tap?tap.x:0;tapData[i*3+1]=tap?tap.y:0;
      tapData[i*3+2]=tap&&!motion.matches?seconds-tap.time:-1;
    }
    gl.uniform1f(uTime,waterTime);gl.uniform1f(uTurn,disturbance);gl.uniform3fv(uTaps,tapData);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function tick(now) {
    frame=0;
    if (!enabled || document.hidden || lost || !gl || motion.matches) {previous=0;return;}
    // 30 fps, no simulation buffers, no per-frame DOM layout or allocations.
    if(now-lastDraw>=32){
      if(previous) waterTime+=Math.min((now-previous)/1000,.1);
      previous=now;lastDraw=now;draw(now);
    }
    frame=requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    if(enabled&&!document.hidden&&!lost&&gl){draw(performance.now());if(!motion.matches)frame=requestAnimationFrame(tick);}
  }
  window.GaiaWater={
    tap(x,y){
      if(!enabled||motion.matches)return;
      if(gl&&!lost){taps.unshift({x,y,time:(performance.now()-origin)/1000});taps.length=Math.min(taps.length,4);}
      else {fallbackRipple.style.setProperty('--ripple-angle',((x*173+y*291)%180)+'deg');fallbackRipple.style.left=x*100+'%';fallbackRipple.style.top=y*100+'%';fallbackRipple.classList.remove('show');void fallbackRipple.offsetWidth;fallbackRipple.classList.add('show');}
    },
    turn(delta){if(enabled){turnAmount=Math.max(-1,Math.min(1,delta/90));turnAt=(performance.now()-origin)/1000;}},
    setEnabled(value){enabled=value;taps.length=0;resume();}
  };
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);layer.classList.remove('water-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;try{setup();resume();}catch(error){console.warn('Water renderer:',error);}});
  document.addEventListener('visibilitychange',()=>{taps.length=0;resume();});
  motion.addEventListener('change',()=>{taps.length=0;resume();});
  new ResizeObserver(resize).observe(screen);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  try{if(setup())resume();}catch(error){layer.classList.remove('water-ready');console.warn('Water renderer:',error);gl=null;}
})();
