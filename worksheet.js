const S={
  design:'wide',orient:'portrait',
  lineH:42,reps:3,
  cellSz:32,lineWt:'normal',gridCross:'cross',
  boxSz:52,boxCross:'cross',
  dotSp:24,dotSz:1.2,
  slantSz:44,slantSkew:0.25,slantCross:'cross',
  ruleColor:'#9BA8B5',paperColor:'#FFFBF9',frameColor:'#8EC5BB',
  font:null
};
const DESIGNS=[
  {id:'wide',name:'Standard',sub:'Lined ruled',
   svg:`<svg viewBox="0 0 42 28" fill="none"><line x1="3" y1="4" x2="39" y2="4" stroke="#D0D8E0" stroke-width=".6"/><line x1="3" y1="17" x2="39" y2="17" stroke="#9BA8B5" stroke-width="1.1"/><line x1="3" y1="25" x2="39" y2="25" stroke="#D0D8E0" stroke-width=".4"/></svg>`},
  {id:'grid',name:'Square Grid',sub:'',
   svg:`<svg viewBox="0 0 42 28" fill="none">${[0,7,14,21,28,35,42].map(x=>`<line x1="${x+3}" y1="2" x2="${x+3}" y2="26" stroke="#B8C4CC" stroke-width=".6"/>`).join('')}${[0,6,12,18,24].map(y=>`<line x1="2" y1="${y+2}" x2="40" y2="${y+2}" stroke="#B8C4CC" stroke-width=".6"/>`).join('')}</svg>`},
  {id:'box',name:'Practice Box',sub:'',
   svg:`<svg viewBox="0 0 42 28" fill="none"><rect x="2" y="2" width="20" height="22" stroke="#9BA8B5" stroke-width=".9"/><line x1="2" y1="13" x2="22" y2="13" stroke="#B8C4CC" stroke-width=".45" stroke-dasharray="1.5 1.5"/><line x1="12" y1="2" x2="12" y2="24" stroke="#B8C4CC" stroke-width=".45" stroke-dasharray="1.5 1.5"/><rect x="25" y="2" width="10" height="10" stroke="#B8C4CC" stroke-width=".55"/><rect x="25" y="14" width="10" height="10" stroke="#B8C4CC" stroke-width=".55"/></svg>`},
  {id:'slant',name:'Slanted Grid',sub:'',
   svg:`<svg viewBox="0 0 42 28" fill="none">
     <polygon points="7,2 17,2 13,13 3,13" stroke="#9BA8B5" stroke-width=".8" fill="none"/>
     <polygon points="17,2 27,2 23,13 13,13" stroke="#9BA8B5" stroke-width=".8" fill="none"/>
     <polygon points="27,2 37,2 33,13 23,13" stroke="#9BA8B5" stroke-width=".8" fill="none"/>
     <polygon points="7,15 17,15 13,26 3,26" stroke="#B8C4CC" stroke-width=".6" fill="none"/>
     <polygon points="17,15 27,15 13,26 23,26" stroke="#B8C4CC" stroke-width=".6" fill="none"/>
   </svg>`},
  {id:'dot',name:'Dot Grid',sub:'Flexible',
   svg:`<svg viewBox="0 0 42 28" fill="none">${[6,13,20,27,34].flatMap(x=>[5,12,19].map(y=>`<circle cx="${x}" cy="${y}" r="1.1" fill="#B8C4CC"/>`)).join('')}</svg>`},
];
const PAPER_PRESETS=[
  {h:'#FFFFFF',l:'White'},{h:'#FFFBF9',l:'Warm White'},{h:'#FFF5F8',l:'Blush'},
  {h:'#F5F4F8',l:'Lavender'},{h:'#F0F8F5',l:'Mint'},{h:'#FFFDE8',l:'Lemon'},
  {h:'#EAE6DC',l:'Parchment'},{h:'#E8F0F5',l:'Ice Blue'},{h:'#1C1917',l:'Night'},
];
function buildSegments(rawText, maxWidth, measureFn) {
  const paras = rawText.split('\n');
  const out = [];
  for (const para of paras) {
    if (!para.trim()) { out.push(''); continue; }
    const words = para.split(/\s+/).filter(Boolean);
    let cur = '';
    for (const w of words) {
      if (measureFn(w) > maxWidth) {
        if (cur) { out.push(cur); cur = ''; }
        let chunk = '';
        for (const ch of w) {
          const test = chunk + ch;
          if (measureFn(test) <= maxWidth) { chunk = test; }
          else { if (chunk) out.push(chunk); chunk = ch; }
        }
        if (chunk) { cur = chunk; }
      } else {
        const test = cur ? cur + ' ' + w : w;
        if (measureFn(test) <= maxWidth) { cur = test; }
        else { if (cur) out.push(cur); cur = w; }
      }
    }
    if (cur) out.push(cur);
  }
  return out.length ? out : [''];
}
function cvsSegments(ctx, rawText, maxW) {
  return buildSegments(rawText, maxW, s => ctx.measureText(s).width);
}
function initDGrid(){
  document.getElementById('dGrid').innerHTML=DESIGNS.map(d=>
    `<div class="dc${d.id===S.design?' on':''}" onclick="selDesign('${d.id}')">${d.svg}<div class="dn">${d.name}</div><div class="ds">${d.sub}</div></div>`
  ).join('');
}
function initPaperPresets(){
  document.getElementById('paperPresets').innerHTML=PAPER_PRESETS.map(c=>
    `<div class="paper-dot${c.h===S.paperColor?' sel':''}" style="background:${c.h}" title="${c.l}" onclick="setPaperPreset('${c.h}')"></div>`
  ).join('');
}
function setPaperPreset(h){
  S.paperColor=h;
  document.getElementById('paperColorPicker').value=h;
  document.getElementById('paperColorHex').value=h;
  document.querySelectorAll('.paper-dot').forEach(d=>{d.classList.toggle('sel',d.style.background===h||d.style.backgroundColor===h);});
  if(isDark(h)){const rc='#7B8A94';S.ruleColor=rc;document.getElementById('ruleColorPicker').value=rc;document.getElementById('ruleColorHex').value=rc;}
  upd();
}
function isDark(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(r*299+g*587+b*114)/1000<128;}
function syncColor(w,v){
  const clean=v.startsWith('#')?v:'#'+v;
  if(!/^#[0-9A-Fa-f]{6}$/.test(clean))return;
  if(w==='rule'){S.ruleColor=clean;document.getElementById('ruleColorPicker').value=clean;document.getElementById('ruleColorHex').value=clean;}
  else if(w==='paper'){S.paperColor=clean;document.getElementById('paperColorPicker').value=clean;document.getElementById('paperColorHex').value=clean;}
  else if(w==='frame'){S.frameColor=clean;document.getElementById('frameColorPicker').value=clean;document.getElementById('frameColorHex').value=clean;}
  upd();
}
function selDesign(id){
  S.design=id;
  document.querySelectorAll('.dc').forEach(c=>c.classList.remove('on'));
  event.currentTarget.classList.add('on');
  renderOpts();upd();
}
function setOrient(o){
  S.orient=o;
  document.getElementById('oBtnPortrait').classList.toggle('on',o==='portrait');
  document.getElementById('oBtnLandscape').classList.toggle('on',o==='landscape');
  upd();
}
function renderOpts(){
  const p=document.getElementById('optPanel'),d=S.design;
  if(d==='wide'){
    p.innerHTML=`
    <div class="r2">
      <div class="field" style="margin:0"><label>Line spacing</label>
        <select id="oLH" onchange="S.lineH=+this.value;upd()">
          <option value="28"${S.lineH===28?' selected':''}>Small (28pt)</option>
          <option value="36"${S.lineH===36?' selected':''}>Medium (36pt)</option>
          <option value="42"${S.lineH===42?' selected':''}>Standard (42pt)</option>
          <option value="52"${S.lineH===52?' selected':''}>Large (52pt)</option>
          <option value="64"${S.lineH===64?' selected':''}>X-Large (64pt)</option>
        </select>
      </div>
      <div class="field" style="margin:0"><label>Practice rows</label>
        <select id="oReps" onchange="S.reps=+this.value;upd()">
          <option value="1"${S.reps===1?' selected':''}>1</option>
          <option value="2"${S.reps===2?' selected':''}>2</option>
          <option value="3"${S.reps===3?' selected':''}>3</option>
          <option value="4"${S.reps===4?' selected':''}>4</option>
        </select>
      </div>
    </div>
    <div class="toglist" style="margin-top:.6rem">
      <div class="togrow"><span>Dotted midline</span><button class="tog on" id="tMid" onclick="tc(this)"></button></div>
      <div class="togrow"><span>Ascender top line</span><button class="tog on" id="tTop" onclick="tc(this)"></button></div>
      <div class="togrow"><span>Descender area</span><button class="tog" id="tDesc" onclick="tc(this)"></button></div>
    </div>`;
  } else if(d==='grid'){
    p.innerHTML=`
    <div class="r2" style="margin-bottom:.65rem">
      <div class="field" style="margin:0"><label>Cell size</label>
        <select id="oCS" onchange="S.cellSz=+this.value;upd()">
          <option value="20"${S.cellSz===20?' selected':''}>Small 20pt</option>
          <option value="28"${S.cellSz===28?' selected':''}>Medium 28pt</option>
          <option value="32"${S.cellSz===32?' selected':''}>Standard 32pt</option>
          <option value="48"${S.cellSz===48?' selected':''}>Large 48pt</option>
        </select>
      </div>
      <div class="field" style="margin:0"><label>Line weight</label>
        <select id="oLW" onchange="S.lineWt=this.value;upd()">
          <option value="light">Light</option><option value="normal" selected>Normal</option><option value="bold">Bold</option>
        </select>
      </div>
    </div>
    <div class="field" style="margin:0"><label>Inner cell guide</label>
      <select id="oGCross" onchange="S.gridCross=this.value;upd()">
        <option value="none">None — plain grid</option>
        <option value="honly">Horizontal midline only</option>
        <option value="cross" selected>Cross +</option>
        <option value="diagonal">Diagonal ×</option>
        <option value="both">All lines combined</option>
      </select>
    </div>`;
  } else if(d==='box'){
    p.innerHTML=`
    <div class="r2" style="margin-bottom:.6rem">
      <div class="field" style="margin:0"><label>Box size</label>
        <select id="oBS" onchange="S.boxSz=+this.value;upd()">
          <option value="38"${S.boxSz===38?' selected':''}>Small 38pt</option>
          <option value="52"${S.boxSz===52?' selected':''}>Medium 52pt</option>
          <option value="66"${S.boxSz===66?' selected':''}>Large 66pt</option>
          <option value="80"${S.boxSz===80?' selected':''}>X-Large 80pt</option>
        </select>
      </div>
      <div class="field" style="margin:0"><label>Inner guide</label>
        <select id="oCross" onchange="S.boxCross=this.value;upd()">
          <option value="none">None</option><option value="cross" selected>Cross (+)</option>
          <option value="diagonal">Diagonal (×)</option><option value="both">Both</option>
        </select>
      </div>
    </div>
    <div class="tip" style="margin-top:.5rem">Upload a CJK font for Korean / Japanese / Chinese characters.</div>`;
  } else if(d==='slant'){
    p.innerHTML=`
    <div class="r2" style="margin-bottom:.65rem">
      <div class="field" style="margin:0"><label>Cell size</label>
        <select id="oSZ" onchange="S.slantSz=+this.value;upd()">
          <option value="36"${S.slantSz===36?' selected':''}>Small 36pt</option>
          <option value="44"${S.slantSz===44?' selected':''}>Medium 44pt</option>
          <option value="56"${S.slantSz===56?' selected':''}>Large 56pt</option>
          <option value="68"${S.slantSz===68?' selected':''}>X-Large 68pt</option>
        </select>
      </div>
      <div class="field" style="margin:0"><label>Slant angle</label>
        <select id="oSK" onchange="S.slantSkew=+this.value;upd()">
          <option value="0.15"${S.slantSkew===0.15?' selected':''}>Slight</option>
          <option value="0.25"${S.slantSkew===0.25?' selected':''}>Medium</option>
          <option value="0.38"${S.slantSkew===0.38?' selected':''}>Strong</option>
        </select>
      </div>
    </div>
    <div class="field" style="margin:0"><label>Inner cell guide</label>
      <select id="oSC" onchange="S.slantCross=this.value;upd()">
        <option value="none">None</option>
        <option value="cross" selected>Cross +</option>
        <option value="diagonal">Diagonal ×</option>
        <option value="both">Both</option>
      </select>
    </div>`;
  } else if(d==='dot'){
    p.innerHTML=`
    <div class="r2">
      <div class="field" style="margin:0"><label>Dot spacing</label>
        <select id="oDS" onchange="S.dotSp=+this.value;upd()">
          <option value="14">Small 14pt</option><option value="18">Med-S 18pt</option>
          <option value="24" selected>Standard 24pt</option><option value="30">Large 30pt</option><option value="36">X-Large 36pt</option>
        </select>
      </div>
      <div class="field" style="margin:0"><label>Dot size</label>
        <select id="oDotSz" onchange="S.dotSz=+this.value;upd()">
          <option value=".6">Fine</option><option value="1.2" selected>Normal</option><option value="2">Bold</option>
        </select>
      </div>
    </div>`;
  }
}
function tc(b){
  b.classList.toggle('on');
  if(b.id==='tFrame'){
    document.getElementById('frameColorWrap').style.display=b.classList.contains('on')?'block':'none';
  }
  upd();
}
function ion(id){const e=document.getElementById(id);return e?e.classList.contains('on'):false;}
async function loadFont(file){
  const name=file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]/g,'_');
  const cssName='WS_'+Date.now();
  const ab=await file.arrayBuffer();
  const base64=await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result.split(',')[1]);r.readAsDataURL(file);});
  try{const ff=new FontFace(cssName,ab);await ff.load();document.fonts.add(ff);}catch(e){}
  const magic=new Uint8Array(ab,0,4);
  const isCFF=(magic[0]===0x4F&&magic[1]===0x54&&magic[2]===0x54&&magic[3]===0x4F);
  S.font={name,base64,css:cssName,fname:file.name,isCFF};
  document.getElementById('fbadge').textContent=name+(isCFF?' (OTF)':'');
  document.getElementById('fpreview').style.fontFamily=`'${cssName}',sans-serif`;
  document.getElementById('fpreview').textContent='Aa Bb 가 나 永 水';
  document.getElementById('floaded').style.display='flex';
  if(isCFF){
    const badge=document.getElementById('fbadge');
    badge.title='CFF/OTF font — will be rendered as image in PDF (fully supported)';
  }
  cjkWarn();upd();
}
function clearFont(){
  S.font=null;
  document.getElementById('floaded').style.display='none';
  document.getElementById('fwarn').style.display='none';
  document.getElementById('fwarn').innerHTML='';
  upd();
}


function hasNonAscii(str){return/[^\x00-\x7F]/.test(str);}
function cjkWarn(){
  const el=document.getElementById('fwarn');
  if(!S.font){
    el.style.display='block';
    el.innerHTML='To use non-English languages (Korean, Japanese, Chinese, etc.), please upload a matching font file above.';
  } else {
    el.style.display='none';
    el.innerHTML='';
  }
}
const fd=document.getElementById('fdrop');
fd.addEventListener('dragover',e=>{e.preventDefault();fd.classList.add('drag');});
fd.addEventListener('dragleave',()=>fd.classList.remove('drag'));
fd.addEventListener('drop',e=>{e.preventDefault();fd.classList.remove('drag');if(e.dataTransfer.files[0])loadFont(e.dataTransfer.files[0]);});
document.getElementById('finput').addEventListener('change',e=>{if(e.target.files[0])loadFont(e.target.files[0]);});
function h2r(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function blend(fg,bg,a){return fg.map((v,i)=>Math.round(v*a+bg[i]*(1-a)));}
function cssFont(sz){
  const weight=document.getElementById('iFontWeight')?.value||'normal';
  const style=document.getElementById('iFontStyle')?.value||'normal';
  const prefix=(style==='italic'?'italic ':'')+(weight==='bold'?'bold ':'');
  if(S.font)return`${prefix}${sz}px '${S.font.css}',sans-serif`;
  const f=document.getElementById('iFallback').value;
  return(f==='serif'?`${prefix}${sz}px Georgia,serif`:f==='mono'?`${prefix}${sz}px monospace`:`${prefix}${sz}px sans-serif`);
}
function cvsInner(ctx,bx,by,bs,cs,rr,rg,rb,pc,alpha){
  if(cs==='none')return;
  const[lr,lg,lb]=blend([rr,rg,rb],pc,alpha);
  ctx.setLineDash([1.5,2]);ctx.strokeStyle=`rgb(${lr},${lg},${lb})`;ctx.lineWidth=.4;
  if(cs==='cross'||cs==='both'||cs==='honly'){ctx.beginPath();ctx.moveTo(bx,by+bs/2);ctx.lineTo(bx+bs,by+bs/2);ctx.stroke();}
  if(cs==='cross'||cs==='both'){ctx.beginPath();ctx.moveTo(bx+bs/2,by);ctx.lineTo(bx+bs/2,by+bs);ctx.stroke();}
  if(cs==='diagonal'||cs==='both'){ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+bs,by+bs);ctx.stroke();ctx.beginPath();ctx.moveTo(bx+bs,by);ctx.lineTo(bx,by+bs);ctx.stroke();}
  ctx.setLineDash([]);
}
function estimatePages(){
  const isl=document.getElementById('iPaper').value==='letter';
  const isLand=S.orient==='landscape';
  const PW=isl?612:595.28, PH=isl?792:841.89;
  const W=isLand?PH:PW, H=isLand?PW:PH;
  const ML=60,MR=48,MB=48,cW=W-ML-MR;
  const rawTxt=document.getElementById('iText').value||'The quick brown fox jumps over the lazy dog.';
  const avH=H-MB-82; 
  const d=S.design;
  if(d==='wide'){
    const tmp=document.createElement('canvas').getContext('2d');
    const lh=S.lineH;
    tmp.font=cssFont(lh);
    const segs=buildSegments(rawTxt,cW-8,s=>tmp.measureText(s).width);
    const descH=lh*0.4;
    const setH=lh*S.reps+10;
    const setsPerPage=Math.max(1,Math.floor(avH/setH));
    return Math.max(1,Math.ceil(segs.length/setsPerPage));
  } else if(d==='dot'){
    const tmp=document.createElement('canvas').getContext('2d');
    const sp=S.dotSp;
    const zoneH=sp*4;
    tmp.font=cssFont(sp*0.6);
    const segs=buildSegments(rawTxt,cW-8,s=>tmp.measureText(s).width);
    const zonesPerPage=Math.max(1,Math.floor(avH/zoneH));
    return Math.max(1,Math.ceil(segs.length/zonesPerPage));
  } else if(d==='grid'){
    const cs=S.cellSz;
    const cols=Math.floor(cW/cs);
    const rows=Math.floor(avH/cs);
    const chars=[...(rawTxt)].filter(c=>/\S/.test(c));
    return Math.max(1,Math.ceil(chars.length/(cols*rows)));
  } else if(d==='box'){
    const bs=S.boxSz;
    const cols=Math.floor(cW/bs);
    const rowsPerPage=Math.max(1,Math.floor(avH/bs));
    const chars=[...(rawTxt)].filter(c=>c!=='\n');
    return Math.max(1,Math.ceil(Math.ceil(chars.length/cols)/rowsPerPage));
  } else if(d==='slant'){
    const bs=S.slantSz;
    const sk=S.slantSkew*bs;
    const cols=Math.max(1,Math.floor((cW-Math.abs(sk))/bs));
    const rows=Math.floor(avH/bs);
    const chars=[...(rawTxt)].filter(c=>c!=='\n');
    return Math.max(1,Math.ceil(chars.length/(cols*rows)));
  }
  return 1;
}
function upd(){
  cjkWarn();
  const pages=estimatePages();
  const copies=parseInt(document.getElementById('iCopies')?.value||1);
  const total=pages*copies;
  const el=document.getElementById('pageCount');
  if(copies>1){
    el.textContent=`${pages}p × ${copies} = ${total} pages`;
  } else {
    el.textContent=pages===1?'1 page':`${pages} pages`;
  }
  drawPrev();
}
function drawPrev(){
  const cv=document.getElementById('pc');
  const dpr=window.devicePixelRatio||1;
  const isLand=S.orient==='landscape';
  const ratio=isLand?612/792:792/612; 
  const cssW=cv.parentElement.clientWidth - 32; 
  const cssH=Math.round(cssW*ratio);
  if(cv.width!==Math.round(cssW*dpr)||cv.height!==Math.round(cssH*dpr)){
    cv.width=Math.round(cssW*dpr);
    cv.height=Math.round(cssH*dpr);
    cv.style.width=cssW+'px';
    cv.style.height=cssH+'px';
  }
  const ctx=cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const W=cssW,H=cssH;
  const rawTxt=document.getElementById('iText').value||'The quick brown fox…';
  const op=parseFloat(document.getElementById('iOpacity').value);
  const rc=h2r(S.ruleColor),pc=h2r(S.paperColor);
  const sc=isLand?W/792:W/612;
  const useFrame=ion('tFrame');
  const framePad=useFrame?parseInt(document.getElementById('iFrameSize')?.value||28)*sc:0;
  const fr=useFrame?h2r(S.frameColor):[255,255,255];
  ctx.clearRect(0,0,W,H);
  if(useFrame){
    ctx.fillStyle=S.frameColor;
    const fR=0;
    ctx.fillRect(0,0,W,H);
    ctx.shadowColor='rgba(0,0,0,.1)';ctx.shadowBlur=6*sc;ctx.shadowOffsetX=0;ctx.shadowOffsetY=2*sc;
    ctx.fillStyle=S.paperColor;
    ctx.fillRect(framePad,framePad,W-framePad*2,H-framePad*2);
    ctx.shadowColor='transparent';ctx.shadowBlur=0;
  } else {
    ctx.fillStyle=S.paperColor;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(W-3,2,3,H-2);ctx.fillRect(2,H-3,W-4,3);
  }
  const padX=framePad+Math.round(14*sc);
  const padY=framePad+Math.round(14*sc);
  const ML=padX+Math.round(14*sc);
  const MR=Math.round(14*sc);
  const MT=padY+Math.round(10*sc);
  const cW=W-ML-MR-framePad;
  const[rr,rg,rb]=blend(rc,pc,.65);
  if(!useFrame){
    ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=.7;
    ctx.beginPath();ctx.moveTo(ML-6,MT-8);ctx.lineTo(W-MR,MT-8);ctx.stroke();
    ctx.font=`bold ${Math.round(6*sc+4)}px 'Nunito',sans-serif`;
    ctx.fillStyle=`rgba(${rr},${rg},${rb},.7)`;
    if(S.design==='wide') ctx.fillText('DATE  ·  ·  ·  ·  ·',W-MR-Math.round(80*sc),MT-11);
  }
  const d=S.design;
  const contentH=H-MT-framePad-8;
  if(d==='wide') prevLined(ctx,ML,MT,cW,contentH,rc,pc,op,rawTxt,sc);
  else if(d==='grid') prevGrid(ctx,ML,MT,cW,contentH,rc,pc,op,rawTxt,sc);
  else if(d==='box') prevBox(ctx,ML,MT,cW,contentH,rc,pc,op,rawTxt,sc);
  else if(d==='slant') prevSlant(ctx,ML,MT,cW,contentH,rc,pc,op,rawTxt,sc);
  else if(d==='dot') prevDot(ctx,ML,MT,cW,contentH,rc,pc,op,rawTxt,sc);
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function prevLined(ctx,x,y,w,h,rc,pc,op,rawTxt,sc){
  const lh=S.lineH*sc;
  const showMid=ion('tMid'),showTop=ion('tTop'),showDesc=ion('tDesc'),showGuide=ion('tGuide');
  const descH=lh*0.4;
  const setGap=4*sc;
  const setH=lh*S.reps+(showDesc?descH:0)+setGap;
  const fontSize=lh;
  const fontStr=cssFont(fontSize);

  ctx.font=fontStr;
  const maxSegW=w-12;
  const segs=showGuide ? cvsSegments(ctx,rawTxt,maxSegW) : [''];

  let segIdx=0,sy=y;
  while(sy+lh<=y+h){
    const seg=segs[segIdx]??'';
    for(let r=0;r<S.reps;r++){
      const ry=sy+r*lh;
      if(ry+lh>y+h) break;
      if(showTop){
        const[a,b,c]=blend(rc,pc,.20);
        ctx.strokeStyle=`rgb(${a},${b},${c})`;ctx.lineWidth=.4;
        ctx.beginPath();ctx.moveTo(x,ry);ctx.lineTo(x+w,ry);ctx.stroke();
      }
      if(showMid){
        const[a,b,c]=blend(rc,pc,.42);
        ctx.setLineDash([3,3]);ctx.strokeStyle=`rgb(${a},${b},${c})`;ctx.lineWidth=.5;
        ctx.beginPath();ctx.moveTo(x,ry+lh*.5);ctx.lineTo(x+w,ry+lh*.5);ctx.stroke();
        ctx.setLineDash([]);
      }
      const[a,b,c]=blend(rc,pc,.78);
      ctx.strokeStyle=`rgb(${a},${b},${c})`;ctx.lineWidth=.9;
      ctx.beginPath();ctx.moveTo(x,ry+lh);ctx.lineTo(x+w,ry+lh);ctx.stroke();
      if(showDesc){
        const[da,db,dc]=blend(rc,pc,.20);
        ctx.strokeStyle=`rgb(${da},${db},${dc})`;ctx.lineWidth=.35;
        ctx.beginPath();ctx.moveTo(x,ry+lh+descH);ctx.lineTo(x+w,ry+lh+descH);ctx.stroke();
      }
      if(r===0&&showGuide&&seg){
        const[gr,gg,gb]=blend(rc,pc,op);
        ctx.font=fontStr;
        ctx.fillStyle=`rgb(${gr},${gg},${gb})`;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x,ry,w,lh+(showDesc?descH:lh*0.1));
        ctx.clip();
        ctx.fillText(seg,x+2,ry+lh);
        ctx.restore();
      }
    }
    segIdx++;
    if(segIdx>=segs.length) segIdx=0;
    sy+=setH;
  }
}
function prevGrid(ctx,x,y,w,h,rc,pc,op,rawTxt,sc){
  const cs=S.cellSz*sc,chars=[...rawTxt.replace(/\n/g,'')];
  const lw=S.lineWt==='light'?.3:S.lineWt==='bold'?.85:.55;
  const[rr,rg,rb]=blend(rc,pc,.65);ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=lw;
  let ci=0;
  for(let gy=y;gy+cs<=y+h;gy+=cs)for(let gx=x;gx+cs<=x+w;gx+=cs){
    ctx.strokeRect(gx,gy,cs,cs);
    cvsInner(ctx,gx,gy,cs,S.gridCross,rc[0],rc[1],rc[2],pc,.32);
    ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=lw;
    if(ion('tGuide')&&chars[ci]){const[gr,gg,gb]=blend(rc,pc,op);ctx.font=cssFont(cs*.62);ctx.fillStyle=`rgb(${gr},${gg},${gb})`;ctx.textAlign='center';ctx.fillText(chars[ci],gx+cs/2,gy+cs*.74);ctx.textAlign='left';ci++;}
  }
}
function prevBox(ctx,x,y,w,h,rc,pc,op,rawTxt,sc){
  const bs=S.boxSz*sc,cs=S.boxCross,chars=[...rawTxt.replace(/\n/g,'')];
  const cols=Math.floor(w/bs);
  let ci=0,sy=y;
  while(sy+bs<=y+h&&ci<chars.length){
    for(let i=0;i<cols;i++){
      const bx=x+i*bs,by=sy;
      const[rr,rg,rb]=blend(rc,pc,.85);
      ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=.9;ctx.strokeRect(bx,by,bs,bs);
      cvsInner(ctx,bx,by,bs,cs,rc[0],rc[1],rc[2],pc,.3);
      ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=.9;
      if(ion('tGuide')&&chars[ci]){
        const[gr,gg,gb]=blend(rc,pc,op);
        ctx.font=cssFont(bs*.62);ctx.fillStyle=`rgb(${gr},${gg},${gb})`;
        ctx.textAlign='center';ctx.fillText(chars[ci],bx+bs/2,by+bs*.74);ctx.textAlign='left';
      }
      ci++;
    }
    sy+=bs;
  }
}
function prevSlant(ctx,x,y,w,h,rc,pc,op,rawTxt,sc){
  const bs=S.slantSz*sc;
  const sk=S.slantSkew*bs;
  const cs=S.slantCross;
  const chars=[...rawTxt.replace(/\n/g,'')];
  const cols=Math.floor((w-Math.abs(sk))/bs);
  if(cols<1)return;
  const[rr,rg,rb]=blend(rc,pc,.82);
  const[ir,ig,ib]=blend(rc,pc,.28);
  let ci=0;
  for(let gy=y;gy+bs<=y+h;gy+=bs){
    for(let i=0;i<cols;i++){
      const bx=x+i*bs;
      const tl=[bx+sk,    gy   ];
      const tr=[bx+bs+sk, gy   ];
      const br=[bx+bs,    gy+bs];
      const bl=[bx,       gy+bs];
      ctx.strokeStyle=`rgb(${rr},${rg},${rb})`;ctx.lineWidth=.85;
      ctx.beginPath();ctx.moveTo(...tl);ctx.lineTo(...tr);ctx.lineTo(...br);ctx.lineTo(...bl);ctx.closePath();ctx.stroke();
      if(cs!=='none'){
        ctx.setLineDash([1.5,2]);ctx.strokeStyle=`rgb(${ir},${ig},${ib})`;ctx.lineWidth=.4;
        if(cs==='cross'||cs==='both'){
          const mtx=(tl[0]+tr[0])/2,mty=gy;
          const mbx=(bl[0]+br[0])/2,mby=gy+bs;
          ctx.beginPath();ctx.moveTo(mtx,mty);ctx.lineTo(mbx,mby);ctx.stroke();
          const mlx=(tl[0]+bl[0])/2,mly=(tl[1]+bl[1])/2;
          const mrx=(tr[0]+br[0])/2,mry=(tr[1]+br[1])/2;
          ctx.beginPath();ctx.moveTo(mlx,mly);ctx.lineTo(mrx,mry);ctx.stroke();
        }
        if(cs==='diagonal'||cs==='both'){
          ctx.beginPath();ctx.moveTo(...tl);ctx.lineTo(...br);ctx.stroke();
          ctx.beginPath();ctx.moveTo(...tr);ctx.lineTo(...bl);ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      if(ion('tGuide')&&chars.length){
        const ch=chars[ci%chars.length];ci++;
        const cx=(tl[0]+tr[0]+bl[0]+br[0])/4;
        const cy=(tl[1]+tr[1]+bl[1]+br[1])/4+bs*.2;
        const[gr,gg,gb]=blend(rc,pc,op);
        ctx.font=cssFont(bs*.58);ctx.fillStyle=`rgb(${gr},${gg},${gb})`;
        ctx.textAlign='center';ctx.fillText(ch,cx,cy);ctx.textAlign='left';
      }
    }
  }
}
function prevDot(ctx,x,y,w,h,rc,pc,op,rawTxt,sc){
  const sp=S.dotSp*sc,ds=S.dotSz*sc;
  const zoneH=sp*4; 
  const showGuide=ion('tGuide');
  const fontSize=Math.min(sp*0.68,12);
  const fontStr=cssFont(fontSize);
  ctx.font=fontStr;
  const segs=showGuide ? cvsSegments(ctx,rawTxt,w-12) : [];
  let segIdx=0;
  for(let zy=y;zy+sp<y+h;zy+=zoneH){
    if(showGuide&&segs[segIdx]!==undefined){
      const seg=segs[segIdx];
      if(seg){
        const[gr,gg,gb]=blend(rc,pc,op);
        ctx.font=fontStr;ctx.fillStyle=`rgb(${gr},${gg},${gb})`;
        ctx.save();
        ctx.beginPath();ctx.rect(x,zy,w,sp*1.2);ctx.clip();
        ctx.fillText(seg,x+2,zy+fontSize);
        ctx.restore();
      }
      segIdx++;
      if(segIdx>=segs.length) segIdx=0;
    }
    const[dr,dg,db]=blend(rc,pc,.55);ctx.fillStyle=`rgb(${dr},${dg},${db})`;
    for(let gy=zy+sp/2;gy<zy+zoneH&&gy<y+h;gy+=sp)
      for(let gx=x+sp/2;gx<x+w;gx+=sp){ctx.beginPath();ctx.arc(gx,gy,ds,0,Math.PI*2);ctx.fill();}
  }
  if(!showGuide){
    const[dr,dg,db]=blend(rc,pc,.55);ctx.fillStyle=`rgb(${dr},${dg},${db})`;
    for(let gy=y+sp/2;gy<y+h;gy+=sp)
      for(let gx=x+sp/2;gx<x+w;gx+=sp){ctx.beginPath();ctx.arc(gx,gy,ds,0,Math.PI*2);ctx.fill();}
  }
}

async function genPDF(){
  const btn=document.querySelector('.gbtn');
  const origLabel=btn.innerHTML;
  btn.innerHTML='⏳ Generating…';btn.disabled=true;

  try{
    const {jsPDF}=window.jspdf;
    const isl=document.getElementById('iPaper').value==='letter';
    const isLand=S.orient==='landscape';
    const doc=new jsPDF({orientation:isLand?'landscape':'portrait',unit:'pt',format:isl?'letter':'a4'});
    const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
    const ML=60,MR=48,MB=48,cW=W-ML-MR;
    const rawTxt=document.getElementById('iText').value.trim()||'The quick brown fox jumps over the lazy dog.';
    const wtitle=document.getElementById('iTitle').value.trim();
    const op=parseFloat(document.getElementById('iOpacity').value);
    const showGuide=ion('tGuide');
    const rc=h2r(S.ruleColor),pc=h2r(S.paperColor);
    const B=(fg,bg,a)=>fg.map((v,i)=>Math.round(v*a+bg[i]*(1-a)));
    const copies=parseInt(document.getElementById('iCopies')?.value||1);

    let fn='helvetica',fs='normal';
    const fontWeight=document.getElementById('iFontWeight')?.value||'normal';
    const fontStyle=document.getElementById('iFontStyle')?.value||'normal';
    const pdfStyle=(fontWeight==='bold'&&fontStyle==='italic')?'bolditalic'
                  :(fontWeight==='bold')?'bold'
                  :(fontStyle==='italic')?'italic'
                  :'normal';
    const needsStyleRender=S.font&&(fontStyle==='italic'||fontWeight==='bold');
    const useCFFRender=(S.font&&S.font.isCFF)||needsStyleRender;

    if(S.font&&!useCFFRender){
      try{
        const pdfFname=S.font.fname.replace(/\.(otf|woff2?)$/i,'.ttf');
        doc.addFileToVFS(pdfFname,S.font.base64);
        doc.addFont(pdfFname,'WScustom','normal');
        fn='WScustom';
        fs='normal';
      } catch(e){console.warn('Custom font err:',e);}
    } else if(!S.font&&(hasNonAscii(rawTxt)||hasNonAscii(wtitle))){
      btn.innerHTML=origLabel;btn.disabled=false;
      const w=document.getElementById('fwarn');
      w.scrollIntoView({behavior:'smooth',block:'center'});
      w.style.transition='all .1s';
      w.style.transform='scale(1.03)';
      w.style.boxShadow='0 0 0 3px #B05A30';
      setTimeout(()=>{w.style.transform='',w.style.boxShadow='';},600);
      return;
    } else if(!S.font){
      const fb=document.getElementById('iFallback').value;
      if(fb==='serif'){fn='times';}
      else if(fb==='mono'){fn='courier';}
      else{fn='helvetica';}
      fs=pdfStyle==='bolditalic'?'bolditalic':pdfStyle==='bold'?'bold':pdfStyle==='italic'?'italic':'normal';
    }

    function canvasTextImage(text,fontSizePt,r,g,b,alpha,maxWidthPt,scalePx){
      const sc=scalePx||3;
      const w=Math.ceil(maxWidthPt*sc),h=Math.ceil(fontSizePt*sc*1.4);
      const cv=document.createElement('canvas');
      cv.width=w;cv.height=h;
      const ctx=cv.getContext('2d');
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
      ctx.font=`${fontSizePt*sc}px '${S.font.css}',sans-serif`;
      ctx.textBaseline='alphabetic';
      ctx.fillText(text,2,fontSizePt*sc);
      return{dataUrl:cv.toDataURL('image/png'),wPt:maxWidthPt,hPt:fontSizePt*1.4};
    }

    function pdfCFFText(text,fontSizePt,x,baseline,maxWidth,r,g,b,alpha){
      if(!text)return;
      const img=canvasTextImage(text,fontSizePt,r,g,b,alpha,maxWidth);
      doc.addImage(img.dataUrl,'PNG',x,baseline-fontSizePt,img.wPt,img.hPt,'','FAST');
    }

    btn.innerHTML='⏳ Building PDF…';
  function pdfInner(bx,by,bs,cs,a){
    if(cs==='none')return;
    doc.setLineDashPattern([2,3],0);doc.setDrawColor(...B(rc,pc,a));doc.setLineWidth(.38);
    if(cs==='cross'||cs==='both'||cs==='honly')doc.line(bx,by+bs/2,bx+bs,by+bs/2);
    if(cs==='cross'||cs==='both')doc.line(bx+bs/2,by,bx+bs/2,by+bs);
    if(cs==='diagonal'||cs==='both'){doc.line(bx,by,bx+bs,by+bs);doc.line(bx+bs,by,bx,by+bs);}
    doc.setLineDashPattern([],0);
  }
  const useFrame=ion('tFrame');
  const framePad=useFrame?parseInt(document.getElementById('iFrameSize')?.value||28):0;
  const fr=useFrame?h2r(S.frameColor):[255,255,255];
  const IML=ML+(useFrame?framePad:0);
  const IMR=MR+(useFrame?framePad:0);
  const icW=W-IML-IMR;
  function pdfRoundRect(x,y,w,h,r,style){
    const k=r*0.552;
    doc.moveTo(x+r,y);doc.lineTo(x+w-r,y);doc.curveTo(x+w-r+k,y,x+w,y+r-k,x+w,y+r);
    doc.lineTo(x+w,y+h-r);doc.curveTo(x+w,y+h-r+k,x+w-r+k,y+h,x+w-r,y+h);
    doc.lineTo(x+r,y+h);doc.curveTo(x+r-k,y+h,x,y+h-r+k,x,y+h-r);
    doc.lineTo(x,y+r);doc.curveTo(x,y+r-k,x+r-k,y,x+r,y);
    doc.closePath();
    if(style==='F')doc.fillPath();else doc.strokePath();
  }
  function pageFrame(pg,totalPages){
    if(useFrame){
      doc.setFillColor(...fr);
      doc.rect(0,0,W,H,'F');
      doc.setFillColor(...pc);
      doc.rect(framePad,framePad,W-framePad*2,H-framePad*2,'F');
    } else {
      doc.setFillColor(...pc);doc.rect(0,0,W,H,'F');
    }
    let y=framePad+36;
    doc.setDrawColor(...B(rc,pc,.65));doc.setLineWidth(.55);doc.line(IML-10,y,W-IMR,y);y+=5;
    if(wtitle){doc.setFont('times','bold');doc.setFontSize(13);doc.setTextColor(...B(rc,pc,.65));doc.text(wtitle,IML,y+12);}
    doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(...B(rc,pc,.55));
    doc.text('DATE  ·  ·  ·  ·  ·',W-IMR,y+8,{align:'right'});
    y+=14;
    doc.setDrawColor(...B(rc,pc,.58));doc.setLineWidth(.4);doc.line(IML-10,y,W-IMR,y);y+=12;
    if(totalPages>1){doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...B(rc,pc,.4));doc.text(`${pg} / ${totalPages}`,W-IMR,H-framePad-20,{align:'right'});}
    return y;
  }
    function drawOneCopy(isFirst){
      const d=S.design;
      if(d==='wide'){
        doc.setFont(fn,fs);doc.setFontSize(S.lineH);
        let allLines;
        if(useCFFRender){
          const tmp=document.createElement('canvas').getContext('2d');
          tmp.font=`${S.lineH}px '${S.font.css}',sans-serif`;
          allLines=showGuide?buildSegments(rawTxt,icW-8,s=>tmp.measureText(s).width):[''];
        } else {
          allLines=showGuide?doc.splitTextToSize(rawTxt,icW-8):[''];
        }
        const lh=S.lineH,reps=S.reps;
        const showMid=ion('tMid'),showTop=ion('tTop'),showDesc=ion('tDesc');
        const descH=lh*0.4;
        const setH=lh*reps+(showDesc?descH:0)+10;
        const firstAvH=H-MB-framePad-82;
        const setsPerPage=Math.max(1,Math.floor(firstAvH/setH));
        const totalPages=Math.max(1,Math.ceil(allLines.length/setsPerPage));
        let lineIdx=0;
        for(let pg=1;pg<=totalPages;pg++){
          if(!isFirst||pg>1)doc.addPage();
          const sy=pageFrame(pg,totalPages);
          const avH=H-MB-framePad-sy;
          const setsThisPage=Math.max(1,Math.floor(avH/setH));
          let cy=sy;
          for(let s=0;s<setsThisPage;s++){
            const seg=allLines[lineIdx%allLines.length];lineIdx++;
            for(let r=0;r<reps;r++){
              const ry=cy+r*lh;
              if(showTop){doc.setDrawColor(...B(rc,pc,.18));doc.setLineWidth(.32);doc.line(IML,ry,IML+icW,ry);}
              if(showMid){doc.setLineDashPattern([2.5,2.5],0);doc.setDrawColor(...B(rc,pc,.45));doc.setLineWidth(.45);doc.line(IML,ry+lh*.5,IML+icW,ry+lh*.5);doc.setLineDashPattern([],0);}
              doc.setDrawColor(...B(rc,pc,.72));doc.setLineWidth(.65);doc.line(IML,ry+lh,IML+icW,ry+lh);
              if(showDesc){doc.setDrawColor(...B(rc,pc,.18));doc.setLineWidth(.28);doc.line(IML,ry+lh+descH,IML+icW,ry+lh+descH);}
              if(r===0&&showGuide&&seg){
                if(useCFFRender){
                  const[gr,gg,gb]=B(rc,pc,op);
                  pdfCFFText(seg,lh,IML+2,ry+lh,icW-4,gr,gg,gb,op);
                } else {
                  doc.setFont(fn,fs);doc.setFontSize(lh);
                  doc.setTextColor(...B(rc,pc,op));
                  doc.text(seg,IML+2,ry+lh);
                }
              }
            }
            cy+=setH;
          }
        }
      } else if(d==='grid'){
        const cs=S.cellSz,lw=S.lineWt==='light'?.24:S.lineWt==='bold'?.78:.45;
        const chars=[...rawTxt.replace(/\n/g,' ')].filter(c=>/\S/.test(c));
        if(!chars.length)chars.push(' ');
        const cols=Math.floor(icW/cs);
        const tmpAvH=H-MB-framePad-82;
        const rows=Math.max(1,Math.floor(tmpAvH/cs));
        const totalPages=Math.max(1,Math.ceil(chars.length/(cols*rows)));
        let ci=0;
        for(let pg=1;pg<=totalPages;pg++){
          if(!isFirst||pg>1)doc.addPage();
          const sy=pageFrame(pg,totalPages);
          const avH=H-MB-framePad-sy;
          const pageRows=Math.max(1,Math.floor(avH/cs));
          const gW=cols*cs,gH=pageRows*cs;
          doc.setDrawColor(...B(rc,pc,.62));doc.setLineWidth(lw);
          for(let i=0;i<=cols;i++)doc.line(IML+i*cs,sy,IML+i*cs,sy+gH);
          for(let j=0;j<=pageRows;j++)doc.line(IML,sy+j*cs,IML+gW,sy+j*cs);
          for(let j=0;j<pageRows;j++)for(let i=0;i<cols;i++)pdfInner(IML+i*cs,sy+j*cs,cs,S.gridCross,.3);
          doc.setDrawColor(...B(rc,pc,.62));doc.setLineWidth(lw);
          if(showGuide){
            if(!useCFFRender){doc.setFont(fn,'normal');doc.setFontSize(cs*.6);doc.setTextColor(...B(rc,pc,op));}
            for(let j=0;j<pageRows;j++)for(let i=0;i<cols;i++){
              const ch=chars[ci%chars.length];ci++;
              if(!ch.trim())continue;
              const cx=IML+i*cs,cy=sy+j*cs;
              if(useCFFRender){
                const[gr,gg,gb]=B(rc,pc,op);
                pdfCFFText(ch,cs*.6,cx,cy+cs*.72,cs,gr,gg,gb,op);
              } else {
                doc.text(ch,cx+cs*.5,cy+cs*.72,{align:'center'});
              }
            }
          }
        }
      } else if(d==='box'){
        const bs=S.boxSz,cs=S.boxCross;
        const cols=Math.floor(icW/bs);
        const chars=[...rawTxt.replace(/\n/g,'')];
        if(!chars.length)chars.push(' ');
        const tmpAvH=H-MB-framePad-82;
        const rowsPerPage=Math.max(1,Math.floor(tmpAvH/bs));
        const totalPages=Math.max(1,Math.ceil(Math.ceil(chars.length/cols)/rowsPerPage));
        let ci=0;
        for(let pg=1;pg<=totalPages;pg++){
          if(!isFirst||pg>1)doc.addPage();
          const sy=pageFrame(pg,totalPages);
          const avH=H-MB-framePad-sy;
          let ry=sy;
          const rowsThisPage=Math.max(1,Math.floor(avH/bs));
          for(let row=0;row<rowsThisPage;row++){
            if(ry+bs>sy+avH)break;
            doc.setDrawColor(...B(rc,pc,.8));doc.setLineWidth(.75);
            for(let i=0;i<cols;i++){
              const bx=IML+i*bs,by=ry;
              doc.rect(bx,by,bs,bs,'S');pdfInner(bx,by,bs,cs,.26);
              doc.setDrawColor(...B(rc,pc,.8));doc.setLineWidth(.75);
              if(showGuide&&chars.length){
                const ch=chars[ci%chars.length];ci++;
                if(useCFFRender){
                  const[gr,gg,gb]=B(rc,pc,op);
                  pdfCFFText(ch,bs*.62,bx,by+bs*.73,bs,gr,gg,gb,op);
                } else {
                  doc.setFont(fn,'normal');doc.setFontSize(bs*.62);
                  doc.setTextColor(...B(rc,pc,op));
                  doc.text(ch,bx+bs*.5,by+bs*.73,{align:'center'});
                }
              }
            }
            ry+=bs;
          }
        }
      } else if(d==='slant'){
        const bs=S.slantSz,sk=S.slantSkew*bs,cs=S.slantCross;
        const chars=[...rawTxt.replace(/\n/g,'')];
        if(!chars.length)chars.push(' ');
        const cols=Math.max(1,Math.floor((icW-Math.abs(sk))/bs));
        const tmpAvH=H-MB-framePad-82;
        const rowsPerPage=Math.max(1,Math.floor(tmpAvH/bs));
        const totalPages=Math.max(1,Math.ceil(Math.ceil(chars.length/cols)/rowsPerPage));
        let ci=0;
        for(let pg=1;pg<=totalPages;pg++){
          if(!isFirst||pg>1)doc.addPage();
          const sy=pageFrame(pg,totalPages);
          const avH=H-MB-framePad-sy;
          for(let gy=sy;gy+bs<=sy+avH;gy+=bs){
            for(let i=0;i<cols;i++){
              const bx=IML+i*bs;
              const tlx=bx+sk,tly=gy;
              const trx=bx+bs+sk,try_=gy;
              const brx=bx+bs,bry=gy+bs;
              const blx=bx,bly=gy+bs;
              doc.setDrawColor(...B(rc,pc,.82));doc.setLineWidth(.75);
              doc.lines([[trx-tlx,0],[brx-trx,bry-try_],[blx-brx,0]],tlx,tly,null,null,'S',true);
              if(cs!=='none'){
                doc.setLineDashPattern([2,3],0);doc.setDrawColor(...B(rc,pc,.28));doc.setLineWidth(.4);
                if(cs==='cross'||cs==='both'){
                  doc.line((tlx+trx)/2,tly,(blx+brx)/2,bly);
                  doc.line((tlx+blx)/2,(tly+bly)/2,(trx+brx)/2,(try_+bry)/2);
                }
                if(cs==='diagonal'||cs==='both'){
                  doc.line(tlx,tly,brx,bry);
                  doc.line(trx,try_,blx,bly);
                }
                doc.setLineDashPattern([],0);
              }
              if(showGuide&&chars.length){
                const ch=chars[ci%chars.length];ci++;
                const cx=(tlx+trx+blx+brx)/4;
                const cy=(tly+try_+bly+bry)/4+bs*.18;
                if(useCFFRender){
                  const[gr,gg,gb]=B(rc,pc,op);
                  pdfCFFText(ch,bs*.6,cx-bs*.5,cy,bs,gr,gg,gb,op);
                } else {
                  doc.setFont(fn,'normal');doc.setFontSize(bs*.6);
                  doc.setTextColor(...B(rc,pc,op));
                  doc.text(ch,cx,cy,{align:'center'});
                }
              }
            }
          }
        }
      } else if(d==='dot'){
        const sp=S.dotSp,ds=S.dotSz;
        const zoneH=sp*4;
        doc.setFont(fn,fs);doc.setFontSize(sp*0.65);
        let allLines;
        if(useCFFRender){
          const tmp=document.createElement('canvas').getContext('2d');
          tmp.font=`${sp*0.65}px '${S.font.css}',sans-serif`;
          allLines=showGuide?buildSegments(rawTxt,icW-8,s=>tmp.measureText(s).width):[];
        } else {
          allLines=showGuide?doc.splitTextToSize(rawTxt,icW-8):[];
        }
        const tmpAvH=H-MB-framePad-82;
        const zonesPerPage=Math.max(1,Math.floor(tmpAvH/zoneH));
        const totalPages=Math.max(1,Math.ceil(Math.max(allLines.length,1)/zonesPerPage));
        let lineIdx=0;
        for(let pg=1;pg<=totalPages;pg++){
          if(!isFirst||pg>1)doc.addPage();
          const sy=pageFrame(pg,totalPages);
          const avH=H-MB-framePad-sy;
          for(let zy=sy;zy+sp<sy+avH;zy+=zoneH){
            if(showGuide&&allLines.length>0){
              const seg=allLines[lineIdx%allLines.length];lineIdx++;
              if(seg){
                if(useCFFRender){
                  const[gr,gg,gb]=B(rc,pc,op);
                  pdfCFFText(seg,sp*0.65,IML+2,zy+sp*0.75,icW-4,gr,gg,gb,op);
                } else {
                  doc.setFont(fn,fs);doc.setFontSize(sp*0.65);doc.setTextColor(...B(rc,pc,op));doc.text(seg,IML+2,zy+sp*0.75);
                }
              }
            }
            doc.setFillColor(...B(rc,pc,.5));
            for(let gy=zy+sp/2;gy<zy+zoneH&&gy<sy+avH;gy+=sp)
              for(let gx=IML+sp/2;gx<IML+icW;gx+=sp)doc.circle(gx,gy,ds,'F');
          }
        }
      }
    }

    for(let c=0;c<copies;c++) drawOneCopy(c===0);

    const rawName=wtitle||rawTxt.slice(0,20);
    const sn=rawName.replace(/[\/\\:*?"<>|]/g,'').replace(/\s+/g,'_').trim()||'worksheet';
    doc.save(`${sn}.pdf`);

  } catch(err){
    console.error('PDF error:',err);
    alert('error: '+err.message);
  } finally {
    btn.innerHTML=origLabel;btn.disabled=false;
  }
}
['iText','iTitle'].forEach(id=>document.getElementById(id).addEventListener('input',upd));
['iOpacity','iFallback','iPaper','iCopies','iFontWeight','iFontStyle'].forEach(id=>document.getElementById(id).addEventListener('change',upd));
const FRAME_PRESETS=[
  {h:'#8EC5BB',l:'Teal'},{h:'#F4A7B9',l:'Pink'},{h:'#B5A8D9',l:'Lavender'},
  {h:'#A8D5A2',l:'Sage'},{h:'#F9D78E',l:'Butter'},{h:'#F4B8A0',l:'Peach'},
  {h:'#A8C5E0',l:'Sky'},{h:'#C8A8D0',l:'Mauve'},{h:'#B8B8B8',l:'Stone'},
];
function initFramePresets(){
  document.getElementById('framePresets').innerHTML=FRAME_PRESETS.map(c=>
    `<div class="paper-dot${c.h===S.frameColor?' sel':''}" style="background:${c.h}" title="${c.l}" onclick="setFramePreset('${c.h}')"></div>`
  ).join('');
}
function setFramePreset(h){
  S.frameColor=h;document.getElementById('frameColorPicker').value=h;document.getElementById('frameColorHex').value=h;
  document.querySelectorAll('#framePresets .paper-dot').forEach(d=>d.classList.toggle('sel',d.title===FRAME_PRESETS.find(p=>p.h===h)?.l));
  upd();
}
window.addEventListener('resize',upd);
document.fonts.ready.then(()=>upd());

initDGrid();initPaperPresets();initFramePresets();renderOpts();upd();
