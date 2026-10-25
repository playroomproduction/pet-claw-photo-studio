(() => {
  'use strict';
  const D = window.PET_CLAW_DATA;
  const escapeJson = v => JSON.stringify(v).replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4,'0'));
  const namesOf = names => Array.from({length:4}, (_,i) => Array.from(String(names?.[i] || `Pet ${i+1}`)).slice(0,24).join(''));
  const clamp = (v,a,b,f=0) => Number.isFinite(Number(v)) ? Math.max(a,Math.min(b,Number(v))) : f;
  const cache = new Map();
  function image(src) {
    if (!/^data:image\/(png|jpeg|webp);base64,/i.test(src)) return Promise.reject(new Error('Use a PNG, JPG or WebP image.'));
    const key = src.split('#')[0];
    if (cache.has(key)) return cache.get(key);
    const result = new Promise((resolve,reject) => {
      const img = new Image();
      img.onload = () => img.naturalWidth*img.naturalHeight <= 40000000 ? resolve(img) : reject(new Error('Image exceeds 40 megapixels.'));
      img.onerror = () => reject(new Error('Invalid image.'));
      img.src=key;
    });
    cache.set(key,result); while(cache.size>5) cache.delete(cache.keys().next().value);
    return result;
  }
  const masks = [ [[0,.18],[.91,.18],[.96,.34],[.96,.96],[0,.96]], [[0,.18],[1,.18],[1,.95],[0,.95]], [[.02,.12],[.99,.12],[.99,.89],[.02,.89]], [[.01,.55],[.18,.29],[.35,.10],[.59,.10],[.78,.26],[.98,.60],[.98,.84],[.78,.94],[.27,.94],[.01,.83]] ];
  async function drawPhoto(canvas, photo) {
    const img = await image(photo.src);
    const ctx = canvas.getContext('2d'); const w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.save();
    if(photo.circle) {ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip();}
    const sample = /#sample-([0-3])$/.exec(photo.src);
    let source=img,sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;
    if(sample) {
      const i=Number(sample[1]);sw/=2;sh/=2;sx=(i%2)*sw;sy=Math.floor(i/2)*sh;
      const clean=document.createElement('canvas');clean.width=sw;clean.height=sh;const cc=clean.getContext('2d');
      cc.beginPath();masks[i].forEach((p,j)=>cc[j?'lineTo':'moveTo'](p[0]*sw,p[1]*sh));cc.closePath();cc.clip();
      cc.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);source=clean;sx=sy=0;
    }
    const scale=Math.max(w/sw,h/sh)*clamp(photo.zoom,.5,3,1);
    const dw=sw*scale,dh=sh*scale;
    const dx=(w-dw)/2 + clamp(photo.x,-1,1)*Math.max(w*.25,Math.abs(dw-w)/2);
    const dy=(h-dh)/2 + clamp(photo.y,-1,1)*Math.max(h*.25,Math.abs(dh-h)/2);
    ctx.drawImage(source,sx,sy,sw,sh,dx,dy,dw,dh);ctx.restore();
  }
  async function atlas(photos) {
    if(!Array.isArray(photos)||photos.length!==4) throw new Error('Choose four portraits.');
    const target=document.createElement('canvas');target.width=target.height=512;
    const ctx=target.getContext('2d');
    for(let i=0;i<4;i++) {
      const cell=document.createElement('canvas');cell.width=cell.height=256;
      await drawPhoto(cell,photos[i]);ctx.drawImage(cell,(i%2)*256,Math.floor(i/2)*256);
    }
    return target.toDataURL('image/png');
  }
  const font = `@font-face{font-family:Outfit;src:url(data:font/ttf;base64,${D.font}) format('truetype');font-display:swap}`;
  const host = `*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;font-family:Outfit,system-ui,sans-serif}html{width:100%;height:100%}body{position:absolute;transform-origin:0 0}#clock{position:absolute;left:132px;top:94px;color:#eeded8;font-size:70px;font-weight:300}#signature{position:absolute;left:132px;bottom:130px;color:#b89ea9;letter-spacing:4px;font-size:19px}#petArcade .pet-names{overflow-wrap:anywhere;font-size:46px}#petArcade .pet-labels{max-width:900px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;
  async function makeDocument({names,photos}) {
    const png=await atlas(photos);
    const css=(D.css+host+font).replaceAll("url('pet-heads.png')",`url('${png}')`);
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; connect-src \'none\'; object-src \'none\'; base-uri \'none\'"><title>Pet Claw Wallpaper</title><style>'+css+'</style></head><body><script type="application/json" id="license-notices">'+escapeJson(D.notices)+'<\/script><div id="clock"></div><div id="signature">HAPPY TOGETHER · PET CLAW PHOTO STUDIO</div><script>window.PET_CLAW_THEME='+escapeJson({names:namesOf(names)})+';<\/script><script>'+D.js+'<\/script><script>function fit(){var s=Math.min(innerWidth/1920,innerHeight/1080);document.body.style.transform="scale("+s+")";document.body.style.left=(innerWidth-1920*s)/2+"px";document.body.style.top=(innerHeight-1080*s)/2+"px";}fit();addEventListener("resize",fit);function clock(){document.getElementById("clock").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});}clock();setInterval(clock,60000);<\/script></body></html>';
  }
  const enc = new TextEncoder();
  function crc32(bytes) {let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++) c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
  function zip(entries) {
    const chunks=[],central=[];let offset=0,size=0;
    for(const [name,value] of entries){
      const n=enc.encode(name),data=typeof value==='string'?enc.encode(value):value,crc=crc32(data);
      const h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
      v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);h.set(n,30);
      const c=new Uint8Array(46+n.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);c.set(n,46);
      chunks.push(h,data);central.push(c);offset+=h.length+data.length;size+=c.length;
    }
    const e=new Uint8Array(22),ev=new DataView(e.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,size,true);ev.setUint32(16,offset,true);
    return new Blob([...chunks,...central,e],{type:'application/zip'});
  }
  async function makeThemeZip({names,photos}) {
    const png=await atlas(photos),bytes=Uint8Array.from(atob(png.split(',')[1]),c=>c.charCodeAt(0));
    const entries=[['claw.css',D.css],['claw.js',D.js],['pet-theme-config.js','window.PET_CLAW_THEME='+escapeJson({names:namesOf(names)})+';\n'],['pet-heads.png',bytes],['README.md',D.integration]];
    for(const [name,value] of Object.entries(D.notices)) entries.push([name,value]);
    return zip(entries);
  }
  window.PetClawStudio={drawPhoto,makeDocument,makeThemeZip,defaults:{names:['Hung','Baby','Momo','Biru'],photos:[0,1,2,3].map(i=>({src:D.sample+'#sample-'+i,zoom:1,x:0,y:0,circle:false}))}};
})();
