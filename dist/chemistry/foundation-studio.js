import { CLASS_NA, molecularMass } from './core.js';

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
  return {id:kind+'-'+number,kind,number,x:(col-(size-1)/2)*47,y:(row-(rows.length-1)/2)*43};
 }));
}
export function countedNucleus(symbol,selected){
 const particles=nucleusParticles(symbol),chosen=new Set(selected);
 const protons=particles.filter(p=>p.kind==='proton'&&chosen.has(p.id)).length;
 const neutrons=particles.filter(p=>p.kind==='neutron'&&chosen.has(p.id)).length;
 return {protons,neutrons,complete:protons===teachingIsotopes[symbol].protons&&neutrons===teachingIsotopes[symbol].neutrons};
}
export function molePack(amount=1){return {amount,particles:amount*CLASS_NA,mass:amount*molecularMass('H2O')};}
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
// One deliberate wheel gesture pulls out; trackpads can scrub the view gradually.
export function createMoleZoom(onChange){
 let value=0;
 return {get value(){return value;},set(next){value=Number.isFinite(next)?Math.max(0,Math.min(1,next)):0;onChange(value);},wheel(delta,mode=0){if(!Number.isFinite(delta))return false;const next=Math.max(0,Math.min(1,value+delta*(mode===1?16:mode===2?300:1)/100));if(next===value)return false;this.set(next);return true;},reset(){this.set(0);}};
}
export function atomExplorerMarkup(){return `<div class="atom-explorer">
 <div class="atom-picker" role="group" aria-label="選擇觀察的原子">${Object.entries(teachingIsotopes).map(([s,a])=>`<button type="button" data-isotope="${s}" aria-pressed="${s==='C'}"><b>${s}</b>${a.name}</button>`).join('')}</div>
 <div class="atom-studio-layout"><div class="nucleus-view"><span class="nucleus-label">放大原子核 · 點選每一顆來計數</span><div class="atom-cloud-inset" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><radialGradient id="teaching-cloud"><stop stop-color="#658da6" stop-opacity=".8"/><stop offset=".55" stop-color="#7ba3b8" stop-opacity=".35"/><stop offset="1" stop-color="#98bbce" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#teaching-cloud)"/><circle cx="50" cy="50" r="3" fill="#b76c54"/></svg><span>電子雲</span><i>↗</i></div><div class="nucleus-particles" role="group" aria-label="原子核內的質子與中子"></div></div>
 <div class="nucleus-counter"><h5>數一數原子核</h5><p>點過的顆粒會留下編號。</p><div class="nucleus-tally"><span class="proton-key">質子 p⁺</span><output data-count="proton">0</output><span class="neutron-key">中子 n</span><output data-count="neutron">0</output></div><button type="button" class="primary nucleus-check">數完了，核對答案</button><button type="button" class="text-button nucleus-reset">重新數這一顆</button><p class="nucleus-feedback" role="status" aria-live="polite"></p></div></div>
 <p class="nucleus-model-note">結構示意，非實拍；原子核已放大，尺寸不按比例。球的顏色用來區分質子與中子。</p>
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
export function molePackingMarkup(){return `<div class="mole-packing is-wheel" data-step="1">
 <div class="zoom-view-labels"><span>微觀：很多水分子</span><span>巨觀：一杯水</span></div>
 <div class="packing-stage zoom-stage" tabindex="0" role="group" aria-label="水分子的遠近視野，向下滾動拉遠，向上滾動拉近，也可用上下方向鍵"><span class="zoom-wheel-hint">在這裡向下滾動，拉遠視野 ↓</span><div class="packing-molecules zoom-close" aria-hidden="true">${waterPackingSVG(1,1)}</div><div class="zoom-dense" aria-hidden="true">${waterPackingSVG(1,-1)}</div><div class="water-weighing"><svg viewBox="0 0 170 190" role="img" aria-label="許多水分子形成一份可秤量的水"><defs><linearGradient id="packed-water"><stop stop-color="#c7e2e8" stop-opacity=".85"/><stop offset="1" stop-color="#80b5c6" stop-opacity=".75"/></linearGradient></defs><path d="M36 19v102q0 15 15 15h68q15 0 15-15V19" fill="#fff" fill-opacity=".3" stroke="#819da1" stroke-width="3"/><path class="packed-liquid" d="M39 85q46-7 92 0v34q0 14-14 14H53q-14 0-14-14Z" fill="url(#packed-water)"/><ellipse class="packed-surface" cx="85" cy="85" rx="46" ry="5" fill="#d9f0f1"/><path d="M121 40h10m-10 20h10m-10 40h10" stroke="#819da1" stroke-width="2"/><rect x="18" y="141" width="134" height="40" rx="8" fill="#d9e3dc" stroke="#95aaa0"/><rect x="42" y="149" width="86" height="24" rx="4" fill="#284b41"/><text class="packing-scale-value" x="85" y="167" text-anchor="middle" fill="#e8f2cf" font-size="17" font-family="monospace">18.00 g</text></svg><span>扣除容器質量</span></div><span class="packing-badge">1 mol 水分子</span></div>
 <div class="zoom-controls"><button type="button" class="secondary zoom-in">看水分子</button><label>視野<input class="zoom-slider" type="range" min="0" max="100" step="1" value="0" aria-label="視野拉遠程度"></label><button type="button" class="primary zoom-out">拉遠成一杯水 →</button></div>
 <div class="packing-caption" role="status" aria-live="polite"><h5></h5><p></p></div>
 <div class="packing-amount" hidden><label for="packing-mol-slider">再改變水的份量：<strong class="packing-amount-value">1 mol</strong></label><input id="packing-mol-slider" class="packing-mol-slider" type="range" min="1" max="10" step="1" value="1" aria-label="水分子的莫耳數"><div class="packing-slider-ticks"><span>1 mol</span><span>5 mol</span><span>10 mol</span></div><output for="packing-mol-slider"></output></div>
 <p class="packing-model-note">滾輪只改變觀察視野，分子沒有融合或變大。僅畫部分分子，尺寸不按比例。</p>
 <div class="same-mole" hidden><h5>都是 1 mol，分子個數相同</h5><div><p><b>水 H₂O</b><span>約 6.02 × 10<sup>23</sup> 個分子</span><strong>約 18 g</strong></p><p><b>二氧化碳 CO₂</b><span>約 6.02 × 10<sup>23</sup> 個分子</span><strong>約 44 g</strong></p></div></div>
 </div>`;}
export function mountFoundationStudio(root){
 const host=root.querySelector('.atom-explorer'),particleArea=host.querySelector('.nucleus-particles');
 let symbol='C',selections={C:new Set(),H:new Set(),O:new Set()},checked={};
 function drawAtom(){
  const selected=selections[symbol],result=countedNucleus(symbol,selected),atom=teachingIsotopes[symbol];
  host.querySelectorAll('[data-isotope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.isotope===symbol)));
  const marked=[...selected];
  particleArea.innerHTML=nucleusParticles(symbol).map(p=>`<button type="button" class="nucleon ${p.kind}" data-nucleon="${p.id}" aria-label="${p.kind==='proton'?'質子':'中子'} ${p.number}" aria-pressed="${selected.has(p.id)}" style="--nx:${p.x}px;--ny:${p.y}px"><span>${p.kind==='proton'?'p⁺':'n'}</span>${selected.has(p.id)?`<small>${marked.filter(id=>id.startsWith(p.kind)).indexOf(p.id)+1}</small>`:''}</button>`).join('');
  host.querySelector('[data-count="proton"]').textContent=result.protons;host.querySelector('[data-count="neutron"]').textContent=result.neutrons;
  const feedback=host.querySelector('.nucleus-feedback');feedback.className='nucleus-feedback'+(checked[symbol]?' correct':'');
  feedback.textContent=checked[symbol]?`✓ ${atom.name}：${atom.protons} 個質子＋${atom.neutrons} 個中子＝質量數 ${atom.protons+atom.neutrons}；原子量約 ${atom.protons+atom.neutrons}。`:'';
 }
 host.addEventListener('click',e=>{
  const choice=e.target.closest('[data-isotope]'),ball=e.target.closest('[data-nucleon]');
  if(choice){symbol=choice.dataset.isotope;drawAtom();}
  if(ball){const id=ball.dataset.nucleon;selections[symbol].has(id)?selections[symbol].delete(id):selections[symbol].add(id);delete checked[symbol];drawAtom();particleArea.querySelector(`[data-nucleon="${id}"]`).focus({preventScroll:true});}
 });
 host.querySelector('.nucleus-check').onclick=()=>{
  if(countedNucleus(symbol,selections[symbol]).complete){checked[symbol]=true;drawAtom();}
  else host.querySelector('.nucleus-feedback').textContent='還有沒標記的顆粒。把每一顆都點過，再核對一次。';
 };
 host.querySelector('.nucleus-reset').onclick=()=>{selections[symbol].clear();delete checked[symbol];drawAtom();};drawAtom();
 const packing=root.querySelector('.mole-packing'),stage=packing.querySelector('.zoom-stage');let amount=1,view=0;
 function scientific(value){const [a,b]=value.toExponential(3).split('e');return Number(a)+' × 10<sup>'+Number(b)+'</sup>';}
 function updateAmount(){
  const pack=molePack(amount);
  packing.querySelector('.packing-scale-value').textContent=pack.mass.toFixed(2)+' g';
  const waterline=121-amount*8;
  packing.querySelector('.packed-liquid').setAttribute('d','M39 '+waterline+'q46-7 92 0v'+(119-waterline)+'q0 14-14 14H53q-14 0-14-14Z');
  packing.querySelector('.packed-surface').setAttribute('cy',waterline);
  packing.querySelector('.packing-badge').textContent=amount+' mol 水分子';
  packing.querySelector('.packing-amount-value').textContent=amount+' mol';
  const slider=packing.querySelector('.packing-mol-slider');slider.value=amount;slider.setAttribute('aria-valuetext',amount+' 莫耳的水分子');
  packing.querySelector('.packing-amount output').innerHTML='約 '+scientific(pack.particles)+' 個水分子 · 約 <b>'+pack.mass+' g</b>';
  const macro=view===1;
  packing.querySelector('.packing-caption h5').textContent=macro?amount+' mol 水，約 '+pack.mass+' g':view===0?'很多水分子，還看不到整杯水':'拉遠視野，看見更多水分子';
  packing.querySelector('.packing-caption p').innerHTML=macro?'這杯水約有 <b>'+scientific(pack.particles)+' 個水分子</b>。':view===0?'向下滾動滾輪，看看這一大群水分子的全貌。':'同一份水，只是觀察的視野變大了。';
 }
 const zoom=createMoleZoom(value=>{
  view=value;packing.dataset.step=value===1?'3':'1';
  stage.style.setProperty('--mole-view',String(value));
  stage.style.setProperty('--molecule-opacity',String(Math.max(0,1-value*2)));
  stage.style.setProperty('--dense-opacity',String(Math.max(0,1-Math.abs(value-.45)/.45)));
  stage.style.setProperty('--cup-opacity',String(Math.max(0,(value-.45)/.55)));
  packing.querySelector('.zoom-slider').value=Math.round(value*100);
  packing.querySelector('.zoom-slider').setAttribute('aria-valuetext',Math.round(value*100)+'%，'+(value===1?'一杯水':'水分子視野'));
  packing.querySelector('.packing-amount').hidden=packing.querySelector('.same-mole').hidden=value!==1;
  packing.querySelector('.zoom-wheel-hint').textContent=value===1?'向上滾動，回到水分子 ↑':'向下滾動，拉遠視野 ↓';
  updateAmount();
 });
 stage.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;if(zoom.wheel(e.deltaY,e.deltaMode))e.preventDefault();},{passive:false});
 stage.addEventListener('keydown',e=>{const next={ArrowDown:Math.min(1,view+.25),ArrowUp:Math.max(0,view-.25),PageDown:1,PageUp:0,End:1,Home:0};if(e.key in next){e.preventDefault();zoom.set(next[e.key]);}});
 packing.querySelector('.zoom-in').onclick=()=>zoom.set(0);
 packing.querySelector('.zoom-out').onclick=()=>zoom.set(1);
 packing.querySelector('.zoom-slider').oninput=e=>zoom.set(Number(e.target.value)/100);
 packing.querySelector('.packing-mol-slider').oninput=e=>{const value=Number(e.target.value);amount=Number.isFinite(value)?Math.max(1,Math.min(10,Math.round(value))):1;updateAmount();};
 zoom.reset();return {pause(){},reset(){symbol='C';selections={C:new Set(),H:new Set(),O:new Set()};checked={};drawAtom();amount=1;zoom.reset();}};
}
