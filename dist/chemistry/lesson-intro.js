import { elements, molecularMass, CLASS_NA, format } from './core.js';

// Stacked, overlapping layers suggest a large quantity; this is not a crystal structure model.
function carbonAtomPile(){
 const layers=Array.from({length:8},(_,layer)=>{
  const count=8-layer;
  const atoms=[];
  for(let row=0;row<count;row++)for(let col=0;col<count;col++){
   atoms.push({x:60+(col-row)*6.3,y:104+(row+col-count+1)*3-layer*10,depth:row+col,front:row===count-1||col===count-1});
  }
  atoms.sort((a,b)=>a.depth-b.depth);
  return '<g data-carbon-layer="'+layer+'">'+atoms.map((a,i)=>'<circle cx="'+a.x.toFixed(1)+'" cy="'+a.y.toFixed(1)+'" r="6.2" fill="url(#carbon-many-shade)" stroke="#29473b" stroke-width=".6"/>'+(a.front&&i%2===0?'<text x="'+a.x.toFixed(1)+'" y="'+(a.y+2).toFixed(1)+'" text-anchor="middle" fill="#edf4df" font-family="Georgia,serif" font-size="5.3">C</text>':'')).join('')+'</g>';
 }).join('');
 return '<svg viewBox="0 0 180 145" role="img" aria-label="大量碳原子以八層球體前後堆疊，表示一莫耳的碳原子；代表約 6.02 × 10²³ 顆，並未逐顆畫出"><defs><radialGradient id="carbon-many-shade" cx=".27" cy=".22" r=".8"><stop stop-color="#b9cbbb"/><stop offset=".32" stop-color="#789681"/><stop offset=".7" stop-color="#3d604c"/><stop offset="1" stop-color="#1d3c30"/></radialGradient></defs><ellipse cx="60" cy="129" rx="51" ry="9" fill="#234735" opacity=".16"/>'+layers+'<path d="M113 30h5v96h-5M118 77h7" fill="none" stroke="#77936a" stroke-width="1.2"/><text x="128" y="63" fill="#34543a" font-size="9" font-weight="600">一莫耳的</text><text x="128" y="79" fill="#34543a" font-size="11" font-weight="600">碳原子</text><text x="128" y="99" fill="#6e805b" font-family="Georgia,serif" font-size="12">1 mol</text></svg>';
}

export function foundationLesson(){
 const water=molecularMass('H2O'),carbon=molecularMass('CO2');
 return '<section class="foundation-lesson" aria-labelledby="foundation-title" data-glossary-skip><div class="lesson-section-heading"><h3 id="foundation-title">先知道「多重」，再學會「有多少」</h3></div><div class="foundation-grid"><article><h4>原子量</h4><div class="atom-mass-tokens"><span><b>H</b><small>氫</small><strong>'+elements.H.ar+'</strong></span><span><b>C</b><small>碳</small><strong>'+elements.C.ar+'</strong></span><span><b>O</b><small>氧</small><strong>'+elements.O.ar+'</strong></span></div><p><b>原子平均質量 ÷ 碳-12 原子質量的 1/12</b>，就是相對原子量。</p><p class="concept-key"><b>沒有單位</b>；氧原子量 16，不表示一顆氧原子重 16 g。</p></article><article><h4>分子量</h4><div class="water-molecule" aria-label="一個水分子由兩個氫原子與一個氧原子組成"><i>H</i><b>O</b><i>H</i></div><p><b>分子量＝一個分子中所有原子量的加總。</b></p><div class="concept-formula">H₂O：2 × 1 + 16 = <b>'+water+'</b></div><p class="concept-key">分子量也沒有單位。<br>CO₂：12 + 2 × 16 = '+carbon+'。</p></article><article><h4>莫耳 <small>mol</small></h4><div class="carbon-scale-comparison" role="group" aria-label="一顆碳原子與一莫耳碳原子的比較"><figure><svg viewBox="0 0 180 145" role="img" aria-label="一顆碳-12 原子的放大球形示意"><defs><radialGradient id="carbon-single-shade" cx=".3" cy=".25" r=".8"><stop stop-color="#a5b9b0"/><stop offset=".4" stop-color="#4e6961"/><stop offset="1" stop-color="#1b3530"/></radialGradient></defs><ellipse cx="90" cy="119" rx="40" ry="7" fill="#274d3a" opacity=".1"/><circle cx="90" cy="70" r="43" fill="none" stroke="#c4d1bc" stroke-dasharray="3 5"/><circle cx="90" cy="70" r="33" fill="url(#carbon-single-shade)" stroke="#456358"/><ellipse cx="79" cy="54" rx="13" ry="7" fill="#e3eee5" opacity=".17"/><text x="90" y="80" text-anchor="middle" fill="#fffdf0" font-family="Georgia,serif" font-size="30">C</text></svg><figcaption><b>一顆碳原子</b><strong>1 <small>顆</small></strong><span>約 1.99 × 10<sup>−23</sup> g</span></figcaption></figure><figure>'+carbonAtomPile()+'<figcaption><b>一莫耳的碳原子</b><strong>6.02 × 10<sup>23</sup> <small>顆</small></strong><span>約 12 g</span></figcaption></figure></div><p class="carbon-scale-note"><b>1 mol 是一大群原子，不是一顆變大的原子。</b><br>碳-12 示意：僅畫部分原子，不按比例或晶體排列。</p><p><b>莫耳是物質的量單位</b>；須說清楚數的是原子、分子或離子。</p><p class="concept-key">1 mol 水與 1 mol 二氧化碳：<br>分子個數相同，質量不同。</p></article></div><section class="atomic-mole-bridge" aria-labelledby="atomic-mole-title"><div class="lesson-section-heading"><h3 id="atomic-mole-title">從原子量，連到一莫耳的克數</h3><p>原子量的數值，約等於 1 mol 原子的質量（g）。</p></div><div class="atomic-mole-examples"><div><span class="mole-element">C</span><div><b>碳原子</b><span>原子量 12</span></div><i aria-hidden="true">→</i><p>1 mol 碳原子<strong>約 12 <small>g</small></strong></p></div><div><span class="mole-element">H</span><div><b>氫原子</b><span>原子量 1</span></div><i aria-hidden="true">→</i><p>1 mol 氫原子<strong>約 1 <small>g</small></strong></p></div></div><div class="atomic-mole-check" role="group" aria-labelledby="atomic-mole-question"><h4 id="atomic-mole-question">氧原子的原子量是 16，那麼 1 mol 氧原子約有幾克？</h4><div class="atomic-mole-options"><button type="button" data-atomic-mass="1" aria-pressed="false">1 g</button><button type="button" data-atomic-mass="16" aria-pressed="false">16 g</button><button type="button" data-atomic-mass="32" aria-pressed="false">32 g</button></div><p class="atomic-mole-feedback" role="status" aria-live="polite"></p></div><details class="molecular-mole-extension"><summary>再延伸：換成水分子，也是同樣的道理嗎？</summary><p>水 H₂O 的分子量是 18，所以 1 mol 水分子的質量約是 18 g。</p><p><b>例：36 g 水 ÷ 18 g/mol＝2 mol 水分子。</b></p></details></section><p class="foundation-footnote">本章使用教學近似值；1 mol 的精確定義為 6.02214076 × 10²³ 個指定粒子。NaCl 等離子化合物沒有獨立分子，依化學式加總的相對質量稱為「式量」。 <a href="https://www.bipm.org/en/si-base-units/mole" target="_blank" rel="noopener">莫耳定義 ↗</a> · <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8" target="_blank" rel="noopener">相對質量定義 ↗</a></p></section>';
}
export function equationLesson(){return '<section class="equation-primer" data-glossary-skip><div class="lesson-section-heading"><h3>寫化學反應式的四個步驟</h3></div><ol class="equation-writing"><li><b>確認反應物與生成物</b><p>先確認：氫氣＋氧氣 → 水。</p></li><li><b>左邊寫反應物，右邊寫生成物</b><p class="concept-formula">H₂ + O₂ → H₂O <small>（尚未配平）</small></p></li><li><b>只改係數，讓各種原子一樣多</b><p class="concept-formula"><em>2</em>H₂ + O₂ → <em>2</em>H₂O</p><p>左右各有 4 個 H、2 個 O。係數 1 省略；H₂O 的下標不能改。</p></li><li><b>標出狀態與需要的條件</b><p>(s) 固體、(l) 液體、(g) 氣體、(aq) 水溶液。加熱、點火或催化劑等條件寫在箭頭旁，依實際反應填寫。</p></li></ol><div class="equation-note"><b>係數比 2：1：2</b><span>表示氫氣、氧氣、水的分子數比或莫耳數比；不是質量比。</span></div></section>';}

export function mountFoundationCheck(root){
 const buttons=root.querySelectorAll('[data-atomic-mass]'),feedback=root.querySelector('.atomic-mole-feedback');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const answer=Number(button.dataset.atomicMass);
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  feedback.dataset.correct=String(answer===16);
  feedback.textContent=answer===16?'✓ 1 mol 氧原子約 16 g；1 mol O₂ 才約 32 g。':answer===32?'32 g 是 1 mol O₂；這題問氧原子 O。':'1 g 對應氫原子；氧的原子量是 16。';
 }));
 return {reset(){buttons.forEach(button=>button.setAttribute('aria-pressed','false'));delete feedback.dataset.correct;feedback.textContent='';}};
}

export function mountFoundationSteps(root){
 const panels=[...root.querySelectorAll('.foundation-grid>article')],grid=root.querySelector('.foundation-grid');
 const bridge=root.querySelector('.atomic-mole-bridge'),footnote=root.querySelector('.foundation-footnote');
 const nav=document.createElement('nav'),controls=document.createElement('div');
 nav.className='foundation-steps';nav.setAttribute('aria-label','一次認識一個基礎觀念');
 const labels=['原子量：比較一顆','分子量：把原子加起來','莫耳：數一大群'];
 nav.innerHTML=labels.map((label,i)=>'<button type="button" data-concept="'+i+'" aria-controls="foundation-panel-'+i+'"><span>'+(i+1)+'</span>'+label+'</button>').join('');
 panels.forEach((panel,i)=>{panel.id='foundation-panel-'+i;panel.setAttribute('tabindex','-1');});
 panels[2].append(bridge);
 const notes=document.createElement('details');notes.className='foundation-source';notes.innerHTML='<summary>深入了解：精確定義與資料來源</summary>';footnote.before(notes);notes.append(footnote);
 controls.className='foundation-controls';controls.innerHTML='<button type="button" class="secondary concept-back">← 上一個觀念</button><span class="concept-count" role="status"></span><button type="button" class="primary concept-next"></button>';
 grid.before(nav);grid.after(controls);root.classList.add('is-guided');
 let step=0;
 function draw(focus=false){
  panels.forEach((panel,i)=>panel.hidden=i!==step);
  nav.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===step)));
  controls.querySelector('.concept-back').disabled=step===0;
  controls.querySelector('.concept-count').textContent='觀念 '+(step+1)+' / 3';
  controls.querySelector('.concept-next').textContent=step===2?'接著親手組裝 →':'下一個：'+labels[step+1].split('：')[0]+' →';
  if(focus){nav.scrollIntoView({behavior:'auto',block:'start'});panels[step].focus({preventScroll:true});}
 }
 nav.querySelectorAll('button').forEach(button=>button.onclick=()=>{step=Number(button.dataset.concept);draw(true);});
 controls.querySelector('.concept-back').onclick=()=>{step=Math.max(0,step-1);draw(true);};
 controls.querySelector('.concept-next').onclick=()=>{
  if(step<2){step++;draw(true);return;}
  const prediction=root.closest('.learning-card').querySelector('.prediction');prediction.scrollIntoView({behavior:'auto',block:'start'});prediction.querySelector('button').focus({preventScroll:true});
 };
 draw();return {reset(){step=0;draw();}};
}
