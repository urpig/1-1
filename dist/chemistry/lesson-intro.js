import { atomExplorerMarkup, molePackingMarkup } from './foundation-studio.js';

export function foundationLesson(){
 return '<section class="foundation-lesson" aria-labelledby="foundation-title" data-glossary-skip><div class="lesson-section-heading"><h3 id="foundation-title">先知道「多重」，再學會「有多少」</h3></div><div class="foundation-grid"><article><h4>原子量：比較三種原子</h4>'+atomExplorerMarkup()+'<p>以<b>碳-12</b>為標準，把它的原子量定為 <b>12</b>。氫原子的質量約為碳-12 的 <b>1/12</b>，所以氫的原子量約為 <b>1</b>。</p><p class="concept-key"><b>質量數＝質子數＋中子數。</b>單一同位素的原子量約等於質量數；原子量沒有單位。</p></article><article><h4>分子量：動手組一個分子</h4><p><b>分子量＝一個分子中所有原子的原子量總和。</b></p><div class="foundation-assembly-slot"></div></article><article><h4>莫耳：把很多粒子算成一份</h4>'+molePackingMarkup()+'</article></div><p class="foundation-footnote">本章使用教學近似值；1 mol 的精確定義為 6.02214076 × 10²³ 個指定粒子。NaCl 等離子化合物沒有獨立分子，依化學式加總的相對質量稱為「式量」。 <a href="https://www.bipm.org/en/si-base-units/mole" target="_blank" rel="noopener">莫耳定義 ↗</a> · <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8" target="_blank" rel="noopener">相對質量定義 ↗</a></p></section>';
}
export function equationLesson(){return '<section class="equation-primer" data-glossary-skip><div class="lesson-section-heading"><h3>先看反應物與生成物</h3></div><div class="equation-reading"><div><span>反應物 · 反應前</span><b>H₂ ＋ O₂</b><small>氫氣＋氧氣</small></div><strong aria-label="反應生成">→</strong><div><span>生成物 · 反應後</span><b>H₂O</b><small>水</small></div></div><p class="equation-reading-key">這式子還沒配平。接著只改前面的<b>係數</b>，讓每種原子一樣多。</p><details class="equation-symbols"><summary>查看符號與寫法</summary><p>先依實驗確認反應物與生成物，再寫化學式；＋表示一起反應，→表示生成。</p><dl><div><dt>(s)</dt><dd>固體</dd></div><div><dt>(l)</dt><dd>液體</dd></div><div><dt>(g)</dt><dd>氣體</dd></div><div><dt>(aq)</dt><dd>水溶液</dd></div></dl><p>加熱、點火或催化劑等條件寫在箭頭旁。</p><p>配平後的 2H₂＋O₂→2H₂O，係數比 2：1：2 是分子個數比或莫耳數比，不是質量比。</p></details></section>';}

export function mountFoundationSteps(root,{finish,onChange}={}){
 const panels=[...root.querySelectorAll('.foundation-grid>article')],grid=root.querySelector('.foundation-grid');
 const footnote=root.querySelector('.foundation-footnote');
 const nav=document.createElement('nav'),controls=document.createElement('div');
 nav.className='foundation-steps';nav.setAttribute('aria-label','一次認識一個基礎觀念');
 const labels=['原子量：比較原子','分子量：組裝分子','莫耳：打包粒子'];
 nav.innerHTML=labels.map((label,i)=>'<button type="button" data-concept="'+i+'" aria-controls="foundation-panel-'+i+'"><span>'+(i+1)+'</span>'+label+'</button>').join('');
 panels.forEach((panel,i)=>{panel.id='foundation-panel-'+i;panel.setAttribute('tabindex','-1');});
 const notes=document.createElement('details');notes.className='foundation-source';notes.innerHTML='<summary>深入了解：精確定義與資料來源</summary>';footnote.before(notes);notes.append(footnote);
 controls.className='foundation-controls';controls.innerHTML='<button type="button" class="secondary concept-back">← 上一個觀念</button><span class="concept-count" role="status"></span><button type="button" class="primary concept-next"></button>';
 grid.before(nav);grid.after(controls);root.classList.add('is-guided');
 let step=0;
 function draw(focus=false){
  panels.forEach((panel,i)=>panel.hidden=i!==step);
  nav.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===step)));
  controls.querySelector('.concept-back').disabled=step===0;
  controls.querySelector('.concept-count').textContent='觀念 '+(step+1)+' / 3';
  controls.querySelector('.concept-next').textContent=step===2?(finish?'完成探索，試一題 →':'接著親手組裝 →'):'下一個：'+labels[step+1].split('：')[0]+' →';
  onChange?.(step);
  if(focus){nav.scrollIntoView({behavior:'auto',block:'start'});panels[step].focus({preventScroll:true});}
 }
 nav.querySelectorAll('button').forEach(button=>button.onclick=()=>{step=Number(button.dataset.concept);draw(true);});
 controls.querySelector('.concept-back').onclick=()=>{step=Math.max(0,step-1);draw(true);};
 controls.querySelector('.concept-next').onclick=()=>{
  if(step<2){step++;draw(true);return;}
  if(finish){finish();return;}
  step=1;draw(false);const activity=root.closest('.learning-card').querySelector('.activity');activity.scrollIntoView({behavior:'auto',block:'start'});activity.querySelector('button')?.focus({preventScroll:true});
 };
 draw();return {show(value,focus=true){step=Math.max(0,Math.min(2,value));draw(focus);},reset(){step=0;draw();}};
}
