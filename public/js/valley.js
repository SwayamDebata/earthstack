/* ─────────────────────────────────────────────────────────────
   A small hand-written WebGL renderer. No libraries; the page
   cannot load any. Procedural river-valley terrain, water,
   village and sky, with the camera bound to scroll position.
   ───────────────────────────────────────────────────────────── */

function meInitValley(opts) {
  opts = opts || {};
  var cv = opts.canvas;
  var sec = opts.section;
  var beats = opts.beats || [];
  if (!cv || !sec) return null;

  var gl = cv.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) return;

  /* ── math ── */
  function sub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
  function cross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function dot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function nrm(a){ var l=Math.sqrt(dot(a,a))||1; return [a[0]/l,a[1]/l,a[2]/l]; }
  function persp(fov, asp, n, f){ var t=1/Math.tan(fov/2);
    return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]; }
  function look(e,c,up){ var z=nrm(sub(e,c)), x=nrm(cross(up,z)), y=cross(z,x);
    return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,e),-dot(y,e),-dot(z,e),1]; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function sstep(a,b,x){ var t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }

  /* ── noise ── */
  function hash(i,j){ var n=Math.sin(i*127.1+j*311.7)*43758.5453; return n-Math.floor(n); }
  function vnoise(x,y){
    var xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
    var u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    var a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1);
    return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v;
  }
  function fbm(x,y){ var s=0,a=0.5,f=1; for(var i=0;i<4;i++){ s+=a*vnoise(x*f,y*f); f*=2; a*=0.5; } return s; }

  /* ── the valley ── */
  function riverX(z){ return 20*Math.sin(z*0.028) + 7*Math.sin(z*0.071+1.3); }
  function riverW(z){ return 11 + 3*Math.sin(z*0.05); }
  function height(x,z){
    var cx = riverX(z), d = Math.abs(x-cx), w = riverW(z);
    var h = 5.2*fbm(x*0.028+50, z*0.028+50) + 1.6*fbm(x*0.11, z*0.11) - 1.2;
    var edge = Math.max(0, (Math.abs(x)-40)/30);
    h += 18*edge*edge;
    var carve = 1 - sstep(w*0.55, w*2.4, d);
    h = h*(1-0.92*carve) - 8.0*carve;
    var fp = 1 - sstep(w*2.0, w*5.2, d);
    h = h*(1-0.45*fp) + 0.35*fp;
    var far = Math.max(0, (-138 - z)/78);          /* mountains close the horizon */
    h += 34*far*far;
    return h;
  }
  function colorAt(x,z,h){
    var n = fbm(x*0.2+11, z*0.2+7);
    if (h < 0.25) return [0.58+0.06*n, 0.50+0.05*n, 0.36+0.04*n];
    if (h < 1.9)  { var t = fbm(x*0.09, z*0.09); return [0.46+0.20*t, 0.58+0.06*t, 0.36+0.05*n]; }
    if (h < 5.5)  return [0.60+0.07*n, 0.61+0.05*n, 0.42+0.05*n];
    if (h < 11)   return [0.36+0.06*n, 0.44+0.05*n, 0.31+0.04*n];
    return [0.44+0.05*n, 0.50+0.04*n, 0.42+0.04*n];
  }

  var P=[], N=[], C=[], I=[];
  var COLS=110, ROWS=150, X0=-76, X1=76, Z0=34, Z1=-218;
  for (var j=0;j<ROWS;j++){
    for (var i=0;i<COLS;i++){
      var x = X0 + (X1-X0)*i/(COLS-1);
      var z = Z0 + (Z1-Z0)*j/(ROWS-1);
      var h = height(x,z);
      var e = 0.9;
      var hx = height(x+e,z), hz = height(x,z+e);
      var nv = nrm(cross([e,hx-h,0],[0,hz-h,e]));
      if (nv[1] < 0) nv = [-nv[0],-nv[1],-nv[2]];
      var c = colorAt(x,z,h);
      P.push(x,h,z); N.push(nv[0],nv[1],nv[2]); C.push(c[0],c[1],c[2]);
    }
  }
  for (var j2=0;j2<ROWS-1;j2++){
    for (var i2=0;i2<COLS-1;i2++){
      var a=j2*COLS+i2, b=a+1, c2=a+COLS, d2=c2+1;
      I.push(a,c2,b, b,c2,d2);
    }
  }

  /* ── props: houses and trees, flat-shaded ── */
  function tri(p1,p2,p3,col){
    var nv = nrm(cross(sub(p2,p1), sub(p3,p1)));
    var base = P.length/3;
    [p1,p2,p3].forEach(function(p){ P.push(p[0],p[1],p[2]); N.push(nv[0],nv[1],nv[2]); C.push(col[0],col[1],col[2]); });
    I.push(base, base+1, base+2);
  }
  function quad(p1,p2,p3,p4,col){ tri(p1,p2,p3,col); tri(p1,p3,p4,col); }
  function house(x,z,s,rot){
    var h0 = height(x,z); if (h0 < 0.9) return;
    var w=1.9*s, dp=1.5*s, wh=1.6*s, rh=1.3*s;
    var ca=Math.cos(rot), sa=Math.sin(rot);
    function pt(u,v,y){ return [x+u*ca-v*sa, h0+y, z+u*sa+v*ca]; }
    var wall=[0.90,0.86,0.76], roof=[0.62,0.29,0.16];
    var A=pt(-w,-dp,0), B=pt(w,-dp,0), Cc=pt(w,dp,0), D=pt(-w,dp,0);
    var A2=pt(-w,-dp,wh), B2=pt(w,-dp,wh), C2=pt(w,dp,wh), D2=pt(-w,dp,wh);
    quad(A,B,B2,A2,wall); quad(B,Cc,C2,B2,wall); quad(Cc,D,D2,C2,wall); quad(D,A,A2,D2,wall);
    var apex1=pt(-w*0.1,0,wh+rh), apex2=pt(w*0.1,0,wh+rh);
    quad(A2,B2,apex2,apex1,roof); quad(C2,D2,apex1,apex2,roof);
    tri(B2,C2,apex2,roof); tri(D2,A2,apex1,roof);
  }
  function tree(x,z,s,warm,palm){
    var h0 = height(x,z); if (h0 < 1.2 || h0 > 15) return;
    var trunk=[0.30,0.23,0.15];
    var leaf=[0.20+0.13*warm, 0.34+0.13*warm, 0.19+0.06*warm];
    var r=(palm?0.75:1.25)*s, th=(palm?4.6:1.4)*s, ch=(palm?2.1:3.4)*s;
    quad([x-0.18,h0,z-0.18],[x+0.18,h0,z-0.18],[x+0.18,h0+th,z-0.18],[x-0.18,h0+th,z-0.18],trunk);
    quad([x-0.18,h0,z+0.18],[x+0.18,h0,z+0.18],[x+0.18,h0+th,z+0.18],[x-0.18,h0+th,z+0.18],trunk);
    var seg=6;
    for (var k=0;k<seg;k++){
      var a1=k/seg*Math.PI*2, a2=(k+1)/seg*Math.PI*2;
      tri([x+Math.cos(a1)*r,h0+th,z+Math.sin(a1)*r],
          [x+Math.cos(a2)*r,h0+th,z+Math.sin(a2)*r],
          [x,h0+th+ch,z], leaf);
    }
  }
  var hz = [-58,-64,-70,-75,-81,-87,-93,-99];
  for (var k=0;k<hz.length;k++){
    var zz=hz[k], side = (k%2===0)? 1 : -1;
    var xx = riverX(zz) + side*(riverW(zz)+5.5+2.5*hash(k,3));
    house(xx, zz, 1.05+0.25*hash(k,9), hash(k,17)*1.2);
    if (k%2===0) house(xx+3.6*side, zz+2.4, 0.85, hash(k,23)*1.4);
  }
  for (var t=0;t<190;t++){
    var tx = -74 + 148*hash(t,41), tz = 30 - 210*hash(t,59);
    tree(tx, tz, 0.7+0.8*hash(t,71), hash(t,83), hash(t,97) > 0.72);
  }

  /* ── water grid ── */
  var WP=[], WI=[];
  var WC=44, WR=64;
  for (var j3=0;j3<WR;j3++) for (var i3=0;i3<WC;i3++){
    WP.push(-84 + 168*i3/(WC-1), 0.18, 40 - 200*j3/(WR-1));
  }
  for (var j4=0;j4<WR-1;j4++) for (var i4=0;i4<WC-1;i4++){
    var a3=j4*WC+i4; WI.push(a3, a3+WC, a3+1, a3+1, a3+WC, a3+WC+1);
  }

  /* ── programs ── */
  function sh(type, src){ var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  function prog(vs, fs){ var p=gl.createProgram(); gl.attachShader(p,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p); return p; }

  var pScene = prog(
    'attribute vec3 aPos;attribute vec3 aNrm;attribute vec3 aCol;uniform mat4 uP,uV;uniform float uFogD;varying vec3 vN,vC;varying float vF;' +
    'void main(){vec4 vp=uV*vec4(aPos,1.0);gl_Position=uP*vp;vN=aNrm;vC=aCol;float d=length(vp.xyz);vF=1.0-exp(-pow(d*uFogD,2.2));}',
    'precision mediump float;varying vec3 vN,vC;varying float vF;uniform vec3 uL,uKey,uFill,uFog;' +
    'void main(){vec3 n=normalize(vN);float df=max(dot(n,uL),0.0);float hm=0.55+0.45*n.y;' +
    'vec3 c=vC*(uFill*hm+uKey*df);c=mix(c,uFog,clamp(vF,0.0,1.0));gl_FragColor=vec4(c,1.0);}');

  var pWater = prog(
    'attribute vec3 aPos;uniform mat4 uP,uV;uniform float uFogD;varying vec3 vW;varying float vF;' +
    'void main(){vec4 vp=uV*vec4(aPos,1.0);gl_Position=uP*vp;vW=aPos;float d=length(vp.xyz);vF=1.0-exp(-pow(d*uFogD,2.2));}',
    'precision mediump float;varying vec3 vW;varying float vF;uniform float uT;uniform vec3 uDeep,uShal,uFog,uGlint,uEye,uSunD;' +
    'void main(){' +
    'float w1=sin(vW.x*0.52+uT*0.85);' +
    'float w2=sin(vW.z*0.29-uT*0.55+w1*0.45);' +
    'float w3=sin(vW.x*0.19+vW.z*0.33+uT*0.40);' +
    'float r=w1*0.30+w2*0.45+w3*0.25;' +
    'vec3 c=mix(uDeep,uShal,0.5+0.17*r);' +
    'vec3 n=normalize(vec3(-cos(vW.x*0.52+uT*0.85)*0.031, 1.0, -cos(vW.z*0.29-uT*0.55)*0.026));' +
    'vec3 V=normalize(uEye-vW);vec3 H=normalize(uSunD+V);' +
    'float sp=pow(max(dot(n,H),0.0),84.0);' +
    'c+=uGlint*sp*1.25;' +
    'c+=uGlint*pow(max(dot(n,H),0.0),9.0)*0.07;' +
    'c=mix(c,uFog,clamp(vF,0.0,1.0));gl_FragColor=vec4(c,1.0);}');

  var pSky = prog(
    'attribute vec2 aQ;varying vec2 vQ;void main(){vQ=aQ;gl_Position=vec4(aQ,0.999,1.0);}',
    'precision mediump float;varying vec2 vQ;uniform vec3 uFwd,uRight,uUp,uTop,uHor,uGnd,uSunC,uSunD;uniform float uTH,uTV;' +
    'void main(){vec3 dir=normalize(uFwd+uRight*(vQ.x*uTH)+uUp*(vQ.y*uTV));' +
    'vec3 c=mix(uHor,uTop,smoothstep(-0.02,0.55,dir.y));' +
    'c=mix(uGnd,c,smoothstep(-0.30,-0.01,dir.y));' +
    'float s=max(dot(dir,uSunD),0.0);' +
    'c+=uSunC*pow(s,760.0)*1.5;c+=uSunC*pow(s,14.0)*0.30;c+=uSunC*pow(s,3.0)*0.07;' +
    'gl_FragColor=vec4(c,1.0);}');

  function buf(data, target){ var b=gl.createBuffer(); gl.bindBuffer(target,b); gl.bufferData(target,data,gl.STATIC_DRAW); return b; }
  var bP=buf(new Float32Array(P), gl.ARRAY_BUFFER);
  var bN=buf(new Float32Array(N), gl.ARRAY_BUFFER);
  var bC=buf(new Float32Array(C), gl.ARRAY_BUFFER);
  var bI=buf(new Uint16Array(I), gl.ELEMENT_ARRAY_BUFFER);
  var bWP=buf(new Float32Array(WP), gl.ARRAY_BUFFER);
  var bWI=buf(new Uint16Array(WI), gl.ELEMENT_ARRAY_BUFFER);
  var bQ=buf(new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.ARRAY_BUFFER);

  /* ── camera path ── */
  var CAM = [
    { p:[  2, 34,  26], t:[  0,  6, -34] },
    { p:[-14, 18, -14], t:[  6,  4, -66] },
    { p:[  8,  8, -52], t:[ -6,  3,-100] },
    { p:[ -3, 4.2,-88], t:[  7, 2.4,-128] }
  ];
  function camAt(p){
    var n = CAM.length-1, f = Math.max(0, Math.min(0.9999, p))*n;
    var i = Math.floor(f), u = sstep(0,1,f-i);
    var A = CAM[i], B = CAM[Math.min(n,i+1)];
    return {
      e: [lerp(A.p[0],B.p[0],u), lerp(A.p[1],B.p[1],u), lerp(A.p[2],B.p[2],u)],
      c: [lerp(A.t[0],B.t[0],u), lerp(A.t[1],B.t[1],u), lerp(A.t[2],B.t[2],u)]
    };
  }

  var SUN = nrm([0.42, 0.20, -0.88]);
  var FOG = [0.925, 0.800, 0.640];
  var t1 = beats[0] || null, t2 = beats[1] || null, t3 = beats[2] || null;

  var shown = 0, target = 0, raf = null, dpr = Math.min(2, window.devicePixelRatio || 1);

  function sizeCanvas(){
    var w = cv.clientWidth || 1440, h = cv.clientHeight || 900;
    var W = Math.round(w*dpr), H = Math.round(h*dpr);
    if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
  }

  function scrollP(){
    var r = sec.getBoundingClientRect();
    var span = sec.offsetHeight - window.innerHeight;
    if (span <= 0) return 0;
    return Math.max(0, Math.min(1, -r.top / span));
  }

  function draw(ms){
    raf = requestAnimationFrame(draw);
    var vr = sec.getBoundingClientRect();
    var vis = vr.top < window.innerHeight && vr.bottom > 0;
    if (!vis || document.hidden) return;          /* idle when off-screen */
    target = scrollP();
    shown += (target - shown) * 0.12;            /* eased camera, so the fly is smooth */
    var p = shown, tt = ms * 0.001;

    sizeCanvas();
    var W = cv.width, H = cv.height, asp = W/H;
    gl.viewport(0,0,W,H);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(FOG[0],FOG[1],FOG[2],1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var cam = camAt(p);
    var fov = 50*Math.PI/180;
    var mP = persp(fov, asp, 0.6, 420);
    var mV = look(cam.e, cam.c, [0,1,0]);
    var fwd = nrm(sub(cam.c, cam.e));
    var right = nrm(cross(fwd,[0,1,0]));
    var up = cross(right, fwd);
    var tanV = Math.tan(fov/2), tanH = tanV*asp;

    /* sky */
    gl.depthMask(false);
    gl.useProgram(pSky);
    var aQ = gl.getAttribLocation(pSky,'aQ');
    gl.bindBuffer(gl.ARRAY_BUFFER,bQ); gl.enableVertexAttribArray(aQ); gl.vertexAttribPointer(aQ,2,gl.FLOAT,false,0,0);
    gl.uniform3fv(gl.getUniformLocation(pSky,'uFwd'), fwd);
    gl.uniform3fv(gl.getUniformLocation(pSky,'uRight'), right);
    gl.uniform3fv(gl.getUniformLocation(pSky,'uUp'), up);
    gl.uniform1f(gl.getUniformLocation(pSky,'uTH'), tanH);
    gl.uniform1f(gl.getUniformLocation(pSky,'uTV'), tanV);
    gl.uniform3f(gl.getUniformLocation(pSky,'uTop'), 0.79, 0.82, 0.80);
    gl.uniform3f(gl.getUniformLocation(pSky,'uHor'), 0.955, 0.815, 0.620);
    gl.uniform3f(gl.getUniformLocation(pSky,'uGnd'), 0.86, 0.74, 0.58);
    gl.uniform3f(gl.getUniformLocation(pSky,'uSunC'), 0.95, 0.66, 0.28);
    gl.uniform3fv(gl.getUniformLocation(pSky,'uSunD'), SUN);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.depthMask(true);

    /* terrain + props */
    gl.useProgram(pScene);
    var aP=gl.getAttribLocation(pScene,'aPos'), aN=gl.getAttribLocation(pScene,'aNrm'), aC=gl.getAttribLocation(pScene,'aCol');
    gl.bindBuffer(gl.ARRAY_BUFFER,bP); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bN); gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bC); gl.enableVertexAttribArray(aC); gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(gl.getUniformLocation(pScene,'uP'),false,new Float32Array(mP));
    gl.uniformMatrix4fv(gl.getUniformLocation(pScene,'uV'),false,new Float32Array(mV));
    gl.uniform3fv(gl.getUniformLocation(pScene,'uL'), SUN);
    gl.uniform3f(gl.getUniformLocation(pScene,'uKey'), 1.15, 0.92, 0.62);
    gl.uniform3f(gl.getUniformLocation(pScene,'uFill'), 0.44, 0.47, 0.54);
    gl.uniform3fv(gl.getUniformLocation(pScene,'uFog'), FOG);
    gl.uniform1f(gl.getUniformLocation(pScene,'uFogD'), 0.0078);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bI);
    gl.drawElements(gl.TRIANGLES, I.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(aN); gl.disableVertexAttribArray(aC);

    /* water */
    gl.useProgram(pWater);
    var wP=gl.getAttribLocation(pWater,'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER,bWP); gl.enableVertexAttribArray(wP); gl.vertexAttribPointer(wP,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(gl.getUniformLocation(pWater,'uP'),false,new Float32Array(mP));
    gl.uniformMatrix4fv(gl.getUniformLocation(pWater,'uV'),false,new Float32Array(mV));
    gl.uniform1f(gl.getUniformLocation(pWater,'uT'), tt);
    gl.uniform1f(gl.getUniformLocation(pWater,'uFogD'), 0.0078);
    gl.uniform3f(gl.getUniformLocation(pWater,'uDeep'), 0.086, 0.240, 0.238);
    gl.uniform3f(gl.getUniformLocation(pWater,'uShal'), 0.190, 0.400, 0.380);
    gl.uniform3f(gl.getUniformLocation(pWater,'uGlint'), 1.00, 0.76, 0.42);
    gl.uniform3fv(gl.getUniformLocation(pWater,'uEye'), cam.e);
    gl.uniform3fv(gl.getUniformLocation(pWater,'uSunD'), SUN);
    gl.uniform3fv(gl.getUniformLocation(pWater,'uFog'), FOG);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bWI);
    gl.drawElements(gl.TRIANGLES, WI.length, gl.UNSIGNED_SHORT, 0);

    /* title beats, driven by the same progress */
    if (t1) { t1.style.opacity = String(1 - sstep(0.06, 0.24, p)); t1.style.transform = 'translateY(' + (-56*sstep(0.06,0.30,p)) + 'px)'; }
    if (t2) { t2.style.opacity = String(sstep(0.30,0.44,p) * (1 - sstep(0.60,0.72,p))); t2.style.transform = 'translateY(' + (34 - 34*sstep(0.30,0.46,p)) + 'px)'; }
    if (t3) { t3.style.opacity = String(sstep(0.76,0.90,p)); t3.style.transform = 'translateY(' + (30 - 30*sstep(0.76,0.92,p)) + 'px)'; }
  }

  raf = requestAnimationFrame(draw);

  return function dispose(){
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    [bP,bN,bC,bI,bWP,bWI,bQ].forEach(function(b){ try { gl.deleteBuffer(b); } catch(e){} });
    [pScene,pWater,pSky].forEach(function(p){ try { gl.deleteProgram(p); } catch(e){} });
  };
}



window.meInitValley = meInitValley;