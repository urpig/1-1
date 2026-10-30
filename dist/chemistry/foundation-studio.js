import { CLASS_NA, molecularMass, elements } from './core.js';
const moleSpecimens='./assets/mole-specimens.png?v=17754b15220f';

// Specific isotopes, not the isotope-averaged masses of a natural sample.
export const teachingIsotopes = {
 C: {name:'碳-12',symbol:'C',protons:6,neutrons:6},
 H: {name:'氫-1',symbol:'H',protons:1,neutrons:0},
 O: {name:'氧-16',symbol:'O',protons:8,neutrons:8}
};
export function nucleusParticles(symbol){
 const atom=teachingIsotopes[symbol];
 if(!atom)throw new Error('Unknown teaching isotope');
 const rows=symbol==='H'?[1]:symbol==='C'?[3,4,3,2]:[3,4,5,4];
 let p=0,n=0,index=0;
 return rows.flatMap((size,row)=>Array.from({length:size},(_,col)=>{
  const proton=(index++%2===0&&p<atom.protons)||n>=atom.neutrons;
  const kind=proton?'proton':'neutron',number=proton?++p:++n;
  return {id:kind+'-'+number,kind,number,x:(col-(size-1)/2)*28,y:(row-(rows.length-1)/2)*24.25};
 }));
}
export const moleSamples={
 H2O:{name:'水',label:'水 H₂O',particle:'水分子',unit:'分子',macro:'一杯水',shape:'water'},
 C:{name:'碳',label:'碳 C',particle:'碳原子',unit:'原子',macro:'一份碳',shape:'carbon'},
 H2:{name:'氫氣',label:'氫氣 H₂',particle:'氫氣分子',unit:'分子',macro:'一份氫氣',shape:'h2'}
};
export function molePack(amount=1,formula='H2O'){return {amount,particles:amount*CLASS_NA,mass:amount*molecularMass(formula)};}
export function createPackingPlayer(onChange,{schedule=fn=>setTimeout(fn,2400),cancel=id=>clearTimeout(id)}={}){
 let step=0,playing=false,timer=null;
 function stop(){if(timer!==null)cancel(timer);timer=null;playing=false;}
 function emit(){onChange({step,playing});}
 function queue(){timer=schedule(()=>{timer=null;step=Math.min(3,step+1);if(step===3)playing=false;emit();if(playing)queue();});}
 return {
  play(){stop();if(step===3)step=0;playing=true;emit();queue();},
  pause(){stop();emit();},
  go(value){stop();step=Math.max(0,Math.min(3,value));emit();},
  reset(){stop();step=0;emit();},
  get state(){return {step,playing};}
 };
}
// Each mouse notch reveals one of seven wider fields. Small trackpad deltas accumulate.
export const MOLE_ZOOM_STEPS=7;
export function createMoleZoom(onChange){
 let step=0,pending=0,direction=0;
 return {
  get value(){return step/MOLE_ZOOM_STEPS;},get step(){return step;},
  clearWheel(){pending=0;direction=0;},
  set(next){step=Number.isFinite(next)?Math.round(Math.max(0,Math.min(1,next))*MOLE_ZOOM_STEPS):0;this.clearWheel();onChange(this.value);},
  wheel(delta,mode=0){
   if(!Number.isFinite(delta)||delta===0)return false;
   const sign=Math.sign(delta);
   if(step===0&&sign<0||step===MOLE_ZOOM_STEPS&&sign>0){this.clearWheel();return false;}
   if(direction!==sign){pending=0;direction=sign;}
   // Large/coalesced deltas still count as one action, never skipping a field.
   if(mode!==0||Math.abs(delta)>=40){this.set((step+sign)/MOLE_ZOOM_STEPS);return true;}
   pending+=Math.abs(delta);
   if(pending>=100)this.set((step+sign)/MOLE_ZOOM_STEPS);
   return true;
  },
  reset(){this.set(0);}
 };
}
function electronOrbits(symbol){
 const electrons=teachingIsotopes[symbol].protons;
 return [Math.min(2,electrons),Math.max(0,electrons-2)].map((count,shell)=>{
  if(!count)return '';
  const radius=shell?122:94,flatten=shell?108/122:80/94;
  const particles=Array.from({length:count},(_,i)=>{
   const angle=(i/count*360+(shell?30:0))*Math.PI/180;
   return `<g data-electron="true" transform="translate(${(Math.cos(angle)*radius).toFixed(2)} ${(Math.sin(angle)*radius).toFixed(2)})"><circle r="8.5" fill="#6caa8860"/><circle r="6" fill="url(#atom-${symbol}-electron)" stroke="#38664d" stroke-width=".8"/><path d="M-2.8 0h5.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></g>`;
  }).join('');
  return `<g data-electron-shell="${shell+1}" transform="translate(140 140) rotate(${shell?26:-26})"><ellipse rx="${radius}" ry="${shell?108:80}" class="atom-orbit-track"/><g transform="scale(1 ${flatten.toFixed(5)})"><g class="atom-electron-orbit" style="--orbit-duration:${shell?22:14}s;--orbit-direction:${shell?'reverse':'normal'}">${particles}</g></g></g>`;
 }).join('');
}
export function atomExplorerMarkup(){return `<div class="atom-comparison">
 <div class="atom-comparison-grid" role="group" aria-label="並排比較碳、氫、氧的原子模型與原子量">${Object.entries(teachingIsotopes).map(([symbol,atom])=>{
  const diagram=nucleusParticles(symbol).map(p=>`<g data-nuclear-particle="${p.kind}"><circle cx="${140+p.x}" cy="${140+p.y}" r="15" fill="url(#nucleus-${symbol}-${p.kind})" stroke="${p.kind==='proton'?'#ae604c':'#4e7c87'}" stroke-width=".8"/><text x="${140+p.x}" y="${144.5+p.y}" text-anchor="middle" fill="#fff" font-family="Georgia,serif" font-size="13" aria-hidden="true">${p.kind==='proton'?'p⁺':'n'}</text></g>`).join('');
  return `<section class="atom-comparison-card" aria-labelledby="atom-name-${symbol}" data-atom="${symbol}"><h5 id="atom-name-${symbol}"><b>${symbol}</b><span>${atom.name}</span></h5><svg class="atom-planetary-model" viewBox="0 0 280 280" role="img" aria-label="${atom.name}的行星模型：原子核有 ${atom.protons} 個質子、${atom.neutrons} 個中子，外圍有 ${atom.protons} 個電子繞行"><defs><radialGradient id="nucleus-${symbol}-proton" cx=".3" cy=".24"><stop stop-color="#f9c5ad"/><stop offset=".65" stop-color="#cd755c"/><stop offset="1" stop-color="#ac513c"/></radialGradient><radialGradient id="nucleus-${symbol}-neutron" cx=".3" cy=".24"><stop stop-color="#cee7e8"/><stop offset=".65" stop-color="#6a9ba6"/><stop offset="1" stop-color="#457584"/></radialGradient><radialGradient id="atom-${symbol}-electron" cx=".3" cy=".24"><stop stop-color="#d6f3cf"/><stop offset=".6" stop-color="#639975"/><stop offset="1" stop-color="#38634d"/></radialGradient></defs><circle cx="140" cy="140" r="132" fill="#f0f4ec"/>${electronOrbits(symbol)}<g class="atom-nucleus">${diagram}</g></svg><dl class="atom-composition"><div><dt><i class="proton-dot"></i>質子</dt><dd>${atom.protons}<small> 顆</small></dd></div><div><dt><i class="neutron-dot"></i>中子</dt><dd>${atom.neutrons}<small> 顆</small></dd></div></dl><div class="atom-weight"><span>原子量</span><strong>${elements[symbol].ar}</strong></div></section>`;
 }).join('')}</div>
 <p class="nucleus-model-note">行星模型示意，非真實電子軌道；尺寸不按比例。原子量採近似值、無單位。</p>
 </div>`;}
const denseWaterPattern=Array.from({length:910},(_,i)=>{
 const row=Math.floor(i/35),col=i%35;
 return `<use href="#packing-water-molecule" transform="translate(${(10+col*5.3+(row%2)*2.6).toFixed(1)} ${(8+row*4.1).toFixed(1)})"/>`;
}).join('');
export function waterPackingSVG(amount,step){
 const count=Number.isFinite(amount)?Math.max(1,Math.min(10,Math.round(amount))):1;
 const defs=`<defs><radialGradient id="packing-oxygen"><stop stop-color="#ffc7b3"/><stop offset="1" stop-color="#bd634d"/></radialGradient><radialGradient id="packing-hydrogen"><stop stop-color="#fff"/><stop offset="1" stop-color="#b9cfc7"/></radialGradient><g id="packing-water-molecule"><circle r="2.6" fill="url(#packing-oxygen)"/><circle cx="-2.8" cy="2.7" r="1.7" fill="url(#packing-hydrogen)" stroke="#8eada1" stroke-width=".2"/><circle cx="2.8" cy="2.7" r="1.7" fill="url(#packing-hydrogen)" stroke="#8eada1" stroke-width=".2"/></g><g id="packing-water-cloud">${denseWaterPattern}</g></defs>`;
 let body='';
 if(step===0)body='<use href="#packing-water-molecule" transform="translate(380 130) scale(12)"/>';
 else if(step===-1)body=Array.from({length:6},(_,i)=>`<use href="#packing-water-cloud" transform="translate(${45+i%3*225} ${25+Math.floor(i/3)*125}) scale(1.05)"/>`).join('');
 else if(step===1)body=Array.from({length:72},(_,i)=>{
  const col=i%12,row=Math.floor(i/12),x=48+col*59+(row%2)*9,y=33+row*42+(col%3)*4;
  return `<use class="loose-water-molecule" href="#packing-water-molecule" transform="translate(${x} ${y}) rotate(${(i*47)%100-50}) scale(2.7)"/>`;
 }).join('');
 else {
  const width=step===3?495:700,left=step===3?10:30,cols=Math.min(count,Math.ceil(Math.sqrt(count*1.5))),rows=Math.ceil(count/cols);
  const scale=Math.min(width/(cols*220),205/(rows*143),1.4),cellW=220*scale,cellH=143*scale;
  body=Array.from({length:count},(_,i)=>{
   const row=Math.floor(i/cols),rowSize=Math.min(cols,count-row*cols),x=left+(width-rowSize*cellW)/2+(i%cols)*cellW,y=24+(205-rows*cellH)/2+row*cellH;
   return `<g class="water-mole-pack" data-mol-pack="${i+1}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})"><rect x="0" y="0" width="209" height="132" rx="12" fill="#fffdf5" fill-opacity=".4" stroke="#789d86" stroke-width="1.4" stroke-dasharray="4 3"/><use href="#packing-water-cloud"/><text x="105" y="125" text-anchor="middle" fill="#355c48" font-size="13">1 mol</text></g>`;
  }).join('');
 }
 return `<svg viewBox="0 0 760 300" aria-hidden="true">${defs}${body}</svg>`;
}
function moleParticleDefs(formula,prefix='zoom'){
 const defs=formula==='C'?'<defs><radialGradient id="zoom-carbon-shade" cx=".3" cy=".25"><stop stop-color="#a3afb0"/><stop offset=".55" stop-color="#4e6061"/><stop offset="1" stop-color="#233536"/></radialGradient><g id="zoom-carbon"><circle data-element="C" r="3.8" fill="url(#zoom-carbon-shade)" stroke="#253a36" stroke-width=".15"/><text y="1.2" text-anchor="middle" fill="#f1f5e8" font-size="3.5" font-family="Georgia,serif">C</text></g></defs>':formula==='H2'?'<defs><radialGradient id="zoom-h2-shade" cx=".3" cy=".25"><stop stop-color="#fff"/><stop offset=".7" stop-color="#dce7dc"/><stop offset="1" stop-color="#8eaa9c"/></radialGradient><g id="zoom-h2"><path d="M-2.2 0h4.4" stroke="#859b8e" stroke-width="1.4"/><circle data-element="H" cx="-2.2" r="2.5" fill="url(#zoom-h2-shade)" stroke="#7b978a" stroke-width=".2"/><circle data-element="H" cx="2.2" r="2.5" fill="url(#zoom-h2-shade)" stroke="#7b978a" stroke-width=".2"/><text x="-2.2" y=".8" text-anchor="middle" fill="#50695a" font-size="2.3">H</text><text x="2.2" y=".8" text-anchor="middle" fill="#50695a" font-size="2.3">H</text></g></defs>':'<defs><radialGradient id="zoom-oxygen"><stop stop-color="#ffc7b3"/><stop offset="1" stop-color="#bd634d"/></radialGradient><radialGradient id="zoom-hydrogen"><stop stop-color="#fff"/><stop offset="1" stop-color="#b9cfc7"/></radialGradient><g id="zoom-water"><circle data-element="O" r="2.6" fill="url(#zoom-oxygen)"/><circle data-element="H" cx="-2.8" cy="2.7" r="1.7" fill="url(#zoom-hydrogen)" stroke="#8eada1" stroke-width=".2"/><circle data-element="H" cx="2.8" cy="2.7" r="1.7" fill="url(#zoom-hydrogen)" stroke="#8eada1" stroke-width=".2"/></g></defs>';
 return defs.replaceAll('id="zoom-','id="'+prefix+'-').replaceAll('url(#zoom-','url(#'+prefix+'-');
}
// Zoom changes the field of view, not the sample amount. All three samples share seven stages.
const moleZoomFields=new Map();
export function moleZoomSVG(level,formula='H2O'){
 const sample=moleSamples[formula];if(!sample)throw new Error('Unknown mole sample');
 const step=Number.isFinite(level)?Math.max(0,Math.min(MOLE_ZOOM_STEPS-1,Math.round(level))):0;
 const key=formula+':'+step;
 if(moleZoomFields.has(key))return moleZoomFields.get(key);
 const scale=2**(-step/2),cols=Math.ceil(12/scale),rows=Math.ceil(6/scale);
 const moleculeScale=5.5*scale;
 const defs=moleParticleDefs(formula);
 const field=Array.from({length:cols*rows},(_,i)=>{
  const x=i%cols-Math.floor(cols/2),y=Math.floor(i/cols)-Math.floor(rows/2),hash=((x*17+y*31)%11+11)%11;
  const px=formula==='C'?x*45+(y%2)*22.5:x*59+hash-5,py=formula==='C'?y*39:y*42+hash*.7-3.5;
  return `<use class="zoom-${sample.shape}-molecule" data-particle="${x},${y}" ${formula==='H2O'?`data-water="${x},${y}" `:''}href="#zoom-${sample.shape}" transform="translate(${(380+px*scale).toFixed(2)} ${(150+py*scale).toFixed(2)}) rotate(${formula==='C'?0:hash*9-45}) scale(${moleculeScale.toFixed(4)})"/>`;
 }).join('');
 const markup=`<svg viewBox="0 0 760 300" data-sample="${formula}" data-zoom-field="${step}" aria-hidden="true">${defs}${field}</svg>`;
 moleZoomFields.set(key,markup);return markup;
}
export function waterZoomSVG(level){return moleZoomSVG(level,'H2O');}
const moleBundleFields=new Map();
function moleBundleArt(formula,index){
 const key=formula+':'+index;if(moleBundleFields.has(key))return moleBundleFields.get(key);
 const prefix='bundle-'+formula+'-'+index,shape=moleSamples[formula].shape;
 const particles=Array.from({length:336},(_,i)=>{
  const row=Math.floor(i/24),col=i%24,x=7+col*8.4+(row%2)*2,y=6+row*7.1;
  return `<use href="#${prefix}-${shape}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(.85)"/>`;
 }).join('');
 const svg=`<svg viewBox="0 0 210 106" aria-hidden="true">${moleParticleDefs(formula,prefix)}${particles}</svg>`;
 moleBundleFields.set(key,svg);return svg;
}
export function moleBundlesMarkup(amount=1,formula='H2O'){
 const sample=moleSamples[formula];if(!sample)throw new Error('Unknown mole sample');
 const count=Number.isFinite(amount)?Math.max(1,Math.min(10,Math.round(amount))):1;
 return `<div class="mole-bundles" data-pack-count="${count}" role="group" aria-label="${count} 包，每包 1 mol ${sample.particle}">${Array.from({length:count},(_,i)=>`<div class="mole-bundle" data-mol-pack="${i+1}" role="img" aria-label="第 ${i+1} 包：1 mol ${sample.particle}，約 6.02 乘以 10 的 23 次方個"><div class="mole-bundle-particles">${moleBundleArt(formula,i+1)}</div><strong>1 mol ${sample.particle}</strong><span>約 6.02 × 10<sup>23</sup> 個</span></div>`).join('')}</div>`;
}
function moleSampleArt(formula,amount){
 if(formula==='C'){
  return `<svg class="realistic-specimen packed-carbon-heap" x="9" y="29" width="152" height="106" viewBox="120 210 980 565" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="${moleSpecimens}" width="1916" height="821"/></svg><text x="85" y="22" text-anchor="middle" fill="#3d5d45" font-size="14">碳 C</text>`;
 }
 if(formula==='H2')return `<svg class="realistic-specimen" x="35" y="7" width="100" height="130" viewBox="1210 0 580 821" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="${moleSpecimens}" width="1916" height="821"/></svg><rect x="65" y="79" width="40" height="26" rx="3" fill="#fffef8" fill-opacity=".93" stroke="#c8d4c6" stroke-width=".6"/><text x="85" y="98" text-anchor="middle" fill="#365b43" font-size="18" font-family="Georgia,serif">H₂</text><text x="85" y="118" text-anchor="middle" fill="#506a56" font-size="9">無色氣體</text>`;
 const line=121-amount*8;
 return `<defs><linearGradient id="packed-water"><stop stop-color="#c7e2e8" stop-opacity=".85"/><stop offset="1" stop-color="#80b5c6" stop-opacity=".75"/></linearGradient></defs><path d="M36 19v102q0 15 15 15h68q15 0 15-15V19" fill="#fff" fill-opacity=".3" stroke="#819da1" stroke-width="3"/><path class="packed-liquid" d="M39 ${line}q46-7 92 0v${119-line}q0 14-14 14H53q-14 0-14-14Z" fill="url(#packed-water)"/><ellipse class="packed-surface" cx="85" cy="${line}" rx="46" ry="5" fill="#d9f0f1"/><path d="M121 40h10m-10 20h10m-10 40h10" stroke="#819da1" stroke-width="2"/>`;
}
export function molePackingMarkup(){return `<div class="mole-packing is-wheel" data-step="1" data-sample="H2O">
 <div class="mole-samples" role="group" aria-label="選擇觀察物質">${Object.entries(moleSamples).map(([formula,sample])=>`<button type="button" data-mole-sample="${formula}" aria-pressed="${formula==='H2O'}">${sample.label}</button>`).join('')}</div>
 <div class="zoom-view-labels"><span class="zoom-micro-label">微觀：很多水分子</span><span class="zoom-macro-label">巨觀：一杯水</span></div>
 <div class="packing-stage zoom-stage" tabindex="0" role="group" aria-label="水分子的遠近視野，向下滾動拉遠，向上滾動拉近，也可用上下方向鍵"><span class="zoom-wheel-hint">向下滾動，逐段拉遠（0 / 7） ↓</span><div class="packing-molecules zoom-close" aria-hidden="true">${moleZoomSVG(0)}</div><div class="zoom-particle-count" hidden><strong class="zoom-count-number">約 6.02 × 10<sup>23</sup></strong><span class="zoom-count-unit">個水分子</span></div><div class="water-weighing"><svg viewBox="0 0 170 190" role="img" aria-label="許多水分子形成一份可秤量的水"><g class="packing-sample-art">${moleSampleArt('H2O',1)}</g><g class="packing-balance" data-instrument="electronic-balance"><ellipse cx="85" cy="140" rx="63" ry="4" fill="#c7d4cb" stroke="#92a89a" stroke-width="1"/><rect x="18" y="143" width="134" height="40" rx="8" fill="#d9e3dc" stroke="#879f90" stroke-width="1.4"/><path d="M25 151h8m104 0h8" stroke="#f7fbf4" stroke-width="2" stroke-linecap="round"/><rect x="40" y="150" width="90" height="25" rx="4" fill="#284b41" stroke="#718c7c" stroke-width="1"/><text class="packing-scale-value" x="85" y="168" text-anchor="middle" fill="#e8f2cf" font-size="18" font-family="monospace">18.00 g</text></g></svg><span>扣除容器質量</span></div><span class="packing-badge">1 mol 水</span></div>
 <div class="packing-amount" hidden><label for="packing-mol-slider"><span class="packing-amount-label">調整水的莫耳數</span><strong class="packing-amount-value">1 mol</strong></label><div class="packing-quantity-controls"><button type="button" class="packing-less" aria-label="減少 1 mol">−</button><input id="packing-mol-slider" class="packing-mol-slider" type="range" min="1" max="10" step="1" value="1" aria-label="水分子的莫耳數"><button type="button" class="packing-more" aria-label="增加 1 mol">＋</button></div><div class="packing-slider-ticks"><span>1 mol</span><span>5 mol</span><span>10 mol</span></div><output for="packing-mol-slider"></output></div>
 <div class="zoom-controls"><button type="button" class="secondary zoom-in">← 拉近一段</button><label>視野<input class="zoom-slider" type="range" min="0" max="7" step="1" value="0" aria-label="視野拉遠程度"></label><button type="button" class="primary zoom-out">拉遠一段 →</button></div>
 <div class="packing-caption" role="status" aria-live="polite"><h5></h5><p></p></div>
 <div class="same-mole" hidden><h5>各取 1 mol：粒子一樣多，質量不同</h5><div>${Object.entries(moleSamples).map(([formula,sample])=>`<p><b>${sample.label}</b><span>約 6.02 × 10<sup>23</sup> 個${sample.unit}</span><strong>約 ${molecularMass(formula)} g</strong></p>`).join('')}</div></div>
 </div>`;}
export function mountFoundationStudio(root){
 const packing=root.querySelector('.mole-packing'),stage=packing.querySelector('.zoom-stage'),sampleButtons=[...packing.querySelectorAll('[data-mole-sample]')];
 let amount=1,view=0,displayedField='',formula='H2O';
 function scientific(value){const [a,b]=value.toExponential(3).split('e');return Number(a)+' × 10<sup>'+Number(b)+'</sup>';}
 function updateAmount(){
  const sample=moleSamples[formula],pack=molePack(amount,formula),macro=view===1;
  const field=packing.querySelector('.packing-molecules'),level=Math.min(Math.round(view*MOLE_ZOOM_STEPS),MOLE_ZOOM_STEPS-1),fieldKey=formula+':'+(macro?'bundles:'+amount:level);
  field.hidden=false;field.setAttribute('aria-hidden',String(!macro));
  if(displayedField!==fieldKey){field.innerHTML=macro?moleBundlesMarkup(amount,formula):moleZoomSVG(level,formula);displayedField=fieldKey;}
  packing.dataset.sample=formula;
  sampleButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.moleSample===formula)));
  packing.querySelector('.zoom-micro-label').textContent=macro?'打包成 '+amount+' 包，每包 1 mol':'微觀：很多'+sample.particle;
  packing.querySelector('.zoom-macro-label').textContent='巨觀：'+sample.macro;
  stage.setAttribute('aria-label',sample.particle+'的遠近視野，向下滾動拉遠，向上滾動拉近，也可用上下方向鍵');
  packing.querySelector('.packing-sample-art').innerHTML=moleSampleArt(formula,amount);
  packing.querySelector('.water-weighing svg').setAttribute('aria-label',amount+' mol '+sample.name+'，扣除容器質量約 '+pack.mass+' 公克');
  packing.querySelector('.packing-scale-value').textContent=pack.mass.toFixed(2)+' g';
  packing.querySelector('.packing-badge').textContent=amount+' mol '+sample.name;
  packing.querySelector('.zoom-count-number').innerHTML='約 '+scientific(pack.particles);
  packing.querySelector('.zoom-count-unit').textContent='個'+sample.particle;
  packing.querySelector('.packing-amount-value').textContent=amount+' mol';
  packing.querySelector('.packing-amount-label').textContent='調整'+sample.name+'的莫耳數';
  const slider=packing.querySelector('.packing-mol-slider');slider.value=amount;slider.setAttribute('aria-label',sample.particle+'的莫耳數');slider.setAttribute('aria-valuetext',amount+' 莫耳的'+sample.particle);
  packing.querySelector('.packing-less').disabled=amount===1;packing.querySelector('.packing-more').disabled=amount===10;
  packing.querySelector('.packing-amount output').innerHTML='<strong>'+amount+' mol → 約 '+pack.mass+' g</strong><span>約 '+scientific(pack.particles)+' 個'+sample.particle+'</span>';
  packing.querySelector('.packing-caption h5').textContent=macro?amount+' mol '+sample.name+'，約 '+pack.mass+' g':view===0?'很多'+sample.particle+'，還看不到整份'+sample.name:'拉遠視野，看見更多'+sample.particle;
  packing.querySelector('.packing-caption p').innerHTML=macro?'每包 <b>1 mol '+sample.particle+'</b>，約 6.02 × 10<sup>23</sup> 個；<b>'+amount+' 包＝'+amount+' mol</b>。':view===0?'滾輪向下滾七下，就能看到整份'+sample.name+'。':'同一份'+sample.name+'；視野越大，看到的'+sample.particle+'就越多。';
 }
 const zoom=createMoleZoom(value=>{
  const level=Math.round(value*MOLE_ZOOM_STEPS),macro=level===MOLE_ZOOM_STEPS,sample=moleSamples[formula];
  view=value;packing.dataset.step=macro?'3':'1';packing.dataset.zoomLevel=String(level);
  stage.style.setProperty('--mole-view',String(value));
  stage.style.setProperty('--molecule-opacity','1');
  stage.style.setProperty('--cup-opacity',macro?'1':'0');
  packing.querySelector('.zoom-particle-count').hidden=level<MOLE_ZOOM_STEPS-1;
  packing.querySelector('.water-weighing').hidden=packing.querySelector('.packing-badge').hidden=!macro;
  packing.querySelector('.zoom-slider').value=level;
  packing.querySelector('.zoom-slider').setAttribute('aria-valuetext','拉遠 '+level+' / 7，'+(macro?sample.macro:'更多'+sample.particle));
  packing.querySelector('.packing-amount').hidden=packing.querySelector('.same-mole').hidden=!macro;
  packing.querySelector('.zoom-in').disabled=level===0;packing.querySelector('.zoom-out').disabled=macro;
  packing.querySelector('.zoom-wheel-hint').textContent=macro?'第 7 張：每包 1 mol，增加莫耳數就增加包數':'向下滾動，逐段拉遠（'+level+' / 7） ↓';
  updateAmount();
 });
 sampleButtons.forEach(button=>button.onclick=()=>{const next=button.dataset.moleSample;if(!moleSamples[next]||next===formula)return;formula=next;amount=1;zoom.reset();});
 stage.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;if(zoom.wheel(e.deltaY,e.deltaMode))e.preventDefault();},{passive:false});
 stage.addEventListener('keydown',e=>{const next={ArrowDown:Math.min(1,view+1/MOLE_ZOOM_STEPS),ArrowUp:Math.max(0,view-1/MOLE_ZOOM_STEPS),PageDown:Math.min(1,view+1/MOLE_ZOOM_STEPS),PageUp:Math.max(0,view-1/MOLE_ZOOM_STEPS),End:1,Home:0};if(e.key in next){e.preventDefault();zoom.set(next[e.key]);}});
 packing.querySelector('.zoom-in').onclick=()=>zoom.set(view-1/MOLE_ZOOM_STEPS);
 packing.querySelector('.zoom-out').onclick=()=>zoom.set(view+1/MOLE_ZOOM_STEPS);
 packing.querySelector('.zoom-slider').oninput=e=>zoom.set(Number(e.target.value)/MOLE_ZOOM_STEPS);
 function setAmount(value){amount=Number.isFinite(value)?Math.max(1,Math.min(10,Math.round(value))):1;updateAmount();}
 packing.querySelector('.packing-mol-slider').oninput=e=>setAmount(Number(e.target.value));
 packing.querySelector('.packing-less').onclick=()=>setAmount(amount-1);
 packing.querySelector('.packing-more').onclick=()=>setAmount(amount+1);
 zoom.reset();return {pause(){zoom.clearWheel();},reset(){amount=1;formula='H2O';zoom.reset();}};
}
