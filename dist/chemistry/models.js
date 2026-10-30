import { balanceCoach, balanceOrder, balanceSpeciesNames } from './balance-coach.js';
import { mountBalanceDemonstration } from './balance-demo.js';
import { prepareStudio } from './studio.js';
import { elements, molecules, molecularMass, parseFormula, format, formulaHTML, reactions, atomLedger, equationHTML, convert, react, finite } from './core.js';
import { molecularSVG, particleGroup, stoichiometryArt, alchemySeal } from './art.js';
import { ExplorationWorkbench, numberField, bindNumber, metric, makeDraggable, notice, guideStep } from './components.js';
export function mountMolecule(root,ctx){
 let selected='H2O',counts={},angle=0,tilt=.3,zoom=1,compare='CO2',preview=false;
 root.classList.add('interactive-studio','molecule-studio');
 root.innerHTML=ExplorationWorkbench(
  '<div class="molecule-art" tabindex="0" role="group" aria-label="分子旋轉區，拖曳或方向鍵旋轉"></div><div class="rack-heading"><b>點選原子加入 · 拖曳模型旋轉</b></div><div class="element-rack"></div>',
  '<label class="select-label">要組哪種物質？<select class="molecule-select">'+Object.entries(molecules).map(([f,m])=>'<option value="'+f+'">'+f+' · '+m.name+'</option>').join('')+'</select></label><div class="molecule-recipe"></div><div class="atom-counts"></div><div class="molecule-readout"></div><div class="activity-status" role="status"></div><div class="button-row model-tools"><button class="secondary clear">重新組裝</button><button class="text-button complete">看完整模型</button></div><details class="view-options"><summary>調整模型視角</summary>'+numberField('molecule-zoom','模型縮放',1,.65,1.35,.05,'倍')+'<div class="button-row"><button class="secondary rotate-left" aria-label="模型向左旋轉">↶ 向左</button><button class="secondary rotate-right" aria-label="模型向右旋轉">向右 ↷</button></div><button class="text-button reset-view">還原視角</button><p class="model-note">模型不按比例；離子化合物只示意組成比例。</p></details>',
  '');
 root.insertAdjacentHTML('beforeend','<div class="observation-panel"><h3>比較兩種物質的相對質量</h3><label>比較對象 <select class="molecule-compare">'+Object.entries(molecules).map(([f,m])=>'<option value="'+f+'" '+(f===compare?'selected':'')+'>'+f+' · '+m.name+'</option>').join('')+'</select></label><div class="molecule-comparison"></div><details class="comparison-definition"><summary>深入了解：怎麼從質量比找原子量？</summary>待測原子的平均質量 ÷ 碳-12 原子質量＝待測元素原子量 ÷ 12。<br>例如氧：碳-12 的質量比約 4：3，氧原子量約為 12×4÷3＝16。使用同一標準時，兩元素的原子量比就是平均原子質量比。</details><details><summary>如果把比較標準加倍，原子真的變輕了嗎？</summary><div class="standard-demo"><p>原子本身沒有變重或變輕。下面只是試著換一把比較用的尺，不改課本採用的數值。</p><button class="secondary reference-toggle">把假想質量標準加倍</button><p class="reference-result">正式標準：碳-12 的相對質量是 12。</p><p>講義的另一種問法是「把碳-12 的相對數值改訂成 24」。那相當於把比較單位縮小一半，所有相對數值加倍；原子本身仍沒有變重，現行 1 mol 的粒子數也不變。</p></div></details></div>');

 prepareStudio(root,{number:'01',title:'分子鍊成陣'},ctx);
 function done(){return Object.entries(parseFormula(selected)).every(([e,n])=>counts[e]===n);}
 function draw(){
  const m=molecules[selected],wanted=parseFormula(selected),missing=Object.entries(wanted).filter(([e,n])=>(counts[e]||0)<n),total=Object.values(wanted).reduce((a,b)=>a+b,0),placed=Object.values(counts).reduce((a,b)=>a+b,0),complete=done();
  root.dataset.complete=String(complete);
  root.querySelector('.molecule-recipe').innerHTML='<div><span>目標</span><strong>'+formulaHTML(selected)+'</strong></div><div class="assembly-count"><b>'+placed+'<small> / '+total+'</small></b><span>已加入</span></div><progress max="'+total+'" value="'+placed+'" aria-label="原子組裝進度"></progress>';
  root.querySelectorAll('[data-element]').forEach(b=>{const e=b.dataset.element,remaining=Math.max(0,(wanted[e]||0)-(counts[e]||0));b.disabled=!remaining;b.setAttribute('aria-label',elements[e].name+'：'+(remaining?'還要 '+remaining+' 個':'已放足'));b.dataset.needed=remaining?String(remaining):'';b.closest('.atom-supply').querySelector('.token-stock').textContent=remaining?'還需 '+remaining+' 個':'✓ 已放齊';});
  guideStep(root,complete?'組裝完成，看質量加總':'還需：'+missing.map(([e,n])=>(n-(counts[e]||0))+' 個'+elements[e].name).join('、'),'',complete?'.molecule-readout':'[data-element="'+missing[0][0]+'"]');
  root.querySelector('.molecule-art').innerHTML=molecularSVG(m,{angle,tilt,zoom,counts});
  root.querySelector('.atom-counts').innerHTML=Object.entries(wanted).map(([e,n])=>'<div class="atom-line '+((counts[e]||0)===n?'is-filled':'')+'"><b style="--atom:'+elements[e].color+'">'+e+'</b><span>'+elements[e].name+'</span><strong>'+(counts[e]||0)+' / '+n+'</strong><button class="remove-atom" data-remove="'+e+'" aria-label="移除一個'+elements[e].name+'原子" '+(!(counts[e]>0)?'disabled':'')+'>−</button></div>').join('');
  root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const e=b.dataset.remove;counts[e]=Math.max(0,(counts[e]||0)-1);draw();root.querySelector((counts[e]>0?'[data-remove="':'[data-element="')+e+'"]').focus({preventScroll:true});});
  const sum=Object.entries(counts).reduce((s,[e,n])=>s+n*elements[e].ar,0);
  root.querySelector('.molecule-readout').innerHTML=''+metric(complete?(m.kind==='式單位'?'相對式量':'相對分子量'):'目前加總',format(sum))+'<div class="atom-sum">'+Object.entries(wanted).map(([e])=>'<span style="--atom:'+elements[e].color+'"><i></i>'+(counts[e]||0)+' × '+elements[e].ar+'</span>').join('<b>＋</b>')+'<b>＝ '+format(sum)+'</b></div>'+(complete?'<div class="molar-handoff"><b>1 mol '+formulaHTML(selected)+' → '+format(sum)+' g</b></div>':'');
  root.querySelector('.molecule-comparison').innerHTML='<div class="metrics">'+metric(formulaHTML(selected),format(molecularMass(selected)))+metric(formulaHTML(compare),format(molecularMass(compare)))+metric('前者 ÷ 後者',format(molecularMass(selected)/molecularMass(compare)),'倍')+'</div>';
  notice(root,complete?'✓ 組裝完成':'');
  root.querySelector('.clear').textContent=preview?'換我組裝':'重新組裝';
  if(complete&&preview)notice(root,'示範模型；按「換我組裝」試試。');
  if(complete&&!preview&&!ctx.data.moleculeAssembled){ctx.data.moleculeAssembled=true;ctx.mark('assembled');}
 }
 function add(e){const wanted=parseFormula(selected);if(!wanted[e]||(counts[e]||0)>=wanted[e])return;counts[e]=(counts[e]||0)+1;draw();}
 function rack(){root.querySelector('.element-rack').innerHTML=Object.keys(parseFormula(selected)).map(e=>'<div class="atom-supply"><button class="element-token" data-element="'+e+'" style="--atom:'+elements[e].color+'"><b aria-hidden="true">'+e+'</b></button><span class="token-name">'+elements[e].name+'<small>原子量 '+elements[e].ar+'</small></span><span class="token-stock"></span></div>').join('');root.querySelectorAll('[data-element]').forEach(b=>makeDraggable(b,root.querySelector('.molecule-art'),()=>add(b.dataset.element),root.querySelector('.activity-status')));}
 root.querySelector('.molecule-select').onchange=e=>{selected=e.target.value;counts={};preview=false;rack();draw();};
 root.querySelector('.molecule-compare').onchange=e=>{compare=e.target.value;draw();};
 root.querySelector('.complete').onclick=()=>{preview=true;counts=parseFormula(selected);draw();};
 root.querySelector('.clear').onclick=()=>{preview=false;counts={};draw();};
 const setZoom=bindNumber(root,'molecule-zoom',v=>{zoom=v;draw();});
root.querySelector('.rotate-left').onclick=()=>{angle-=.25;draw();};root.querySelector('.rotate-right').onclick=()=>{angle+=.25;draw();};root.querySelector('.reset-view').onclick=()=>{angle=0;tilt=.3;zoom=1;setZoom(1);draw();};
const area=root.querySelector('.molecule-art');area.onselectstart=area.ondragstart=e=>e.preventDefault();let drag=null;area.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();area.focus({preventScroll:true});area.classList.add('is-rotating');drag={x:e.clientX,y:e.clientY};area.setPointerCapture(e.pointerId);};area.onpointermove=e=>{if(!drag)return;e.preventDefault();angle+=(e.clientX-drag.x)*.012;tilt+=(e.clientY-drag.y)*.01;drag={x:e.clientX,y:e.clientY};draw();};area.onpointerup=area.onpointercancel=()=>{drag=null;area.classList.remove('is-rotating');};area.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')angle-=.2;if(e.key==='ArrowRight')angle+=.2;if(e.key==='ArrowUp')tilt-=.2;if(e.key==='ArrowDown')tilt+=.2;draw();}};area.addEventListener('wheel',e=>{if(document.activeElement!==area)return;e.preventDefault();zoom=Math.max(.65,Math.min(1.35,Math.round((zoom-e.deltaY*.001)*20)/20));setZoom(zoom);draw();},{passive:false});
let doubled=false;root.querySelector('.reference-toggle').onclick=e=>{doubled=!doubled;e.target.textContent=doubled?'恢復正式標準：碳-12':'把假想質量標準加倍';root.querySelector('.reference-result').textContent=doubled?'假想比較尺變成 2 倍，碳-12 的比值會成為 6；但同一顆碳原子的真實質量完全沒變。正式相對原子質量定義仍用 1/12 碳-12。':'正式標準：碳-12 的相對質量是 12。';};

 rack();draw();return{reset(){ctx.data.moleculeAssembled=false;preview=false;counts={};angle=0;tilt=.3;zoom=1;setZoom(1);draw();}};
}
export function mountBalancer(root,ctx){
 let id='water',coeff=[1,1,1],solved=new Set((ctx.data.balanced||[]).filter(key=>balanceOrder.includes(key)));
 root.classList.add('balance-studio');
 root.innerHTML='<div class="equation-workbench"><div class="balance-top"><label>練習題目<select class="balance-select">'+balanceOrder.map((key,i)=>'<option value="'+key+'">'+(i+1)+' · '+reactions[key].name+'</option>').join('')+'</select></label><span class="balance-done"></span></div><div class="balance-alchemy"></div><p class="balance-one-rule"><b>只改前面的係數</b><span>化學式與下標保持不動</span></p><div class="equation-controls" aria-label="按加減鍵調整化學式前面的係數"></div><div class="balance-ledger"></div><div class="button-row balance-actions"><button class="secondary balance-hint">提示下一步</button><button class="text-button balance-reset">重新配平</button><button class="primary balance-next" disabled>下一題 →</button></div><div class="activity-status" role="status"></div><details class="particle-view"><summary>看粒子怎麼分組</summary><div class="balance-models"></div><p class="model-note">每框代表一份；MgO、Fe₂O₃ 只示意組成比例。</p></details></div>';
 root.insertAdjacentHTML('beforeend','<details class="balance-method"><summary>配平小提醒</summary><ol><li>只調整化學式前面的係數。</li><li>逐種檢查原子數，讓左右一樣多。</li><li>係數若能一起約小，就寫成最簡整數比；1 通常省略。</li></ol><p>原子數不變，分子總數可以改變。</p></details>');
 const bench=root.querySelector('.equation-workbench');
 const shelf=document.createElement('section');shelf.className='balance-shelf specimen-shelf';shelf.setAttribute('aria-label','反應樣本架');
 shelf.innerHTML='<div class="shelf-heading"><b>反應樣本架</b><span>點選或拖入操作台</span></div><div class="shelf-rail">'+balanceOrder.map(key=>'<button type="button" class="balance-sample" data-balance-sample="'+key+'" aria-pressed="false"><div class="specimen-vial" aria-hidden="true">'+particleGroup(reactions[key].left[0],1)+'</div><b>'+reactions[key].name+'</b><small class="sample-state">尚未完成</small></button>').join('')+'</div>';
 bench.prepend(shelf);
 const record=document.createElement('section');record.className='balance-records';record.setAttribute('aria-label','我的配平紀錄');bench.append(record);
 prepareStudio(root,{number:'03',title:'反應式配平'},ctx);
 const balanceDemo=mountBalanceDemonstration(root);
 function draw(){
  const reaction=reactions[id],ledger=atomLedger(id,coeff),formulas=[...reaction.left,...reaction.right],coach=balanceCoach(id,coeff);
  const matched=ledger.rows.filter(row=>row.left===row.right).length,complete=ledger.balanced&&ledger.minimal;
  root.querySelector('.balance-alchemy').innerHTML='<div class="balance-emblem">'+alchemySeal(matched+' / '+ledger.rows.length,'種原子相同',matched/ledger.rows.length)+'</div><div><h3>'+coach.title+'</h3><p>'+coach.detail+'</p></div>';
  root.querySelector('.equation-controls').innerHTML=formulas.map((formula,i)=>(i===reaction.left.length?'<strong class="equation-arrow" aria-label="反應生成">→</strong>':i?'<span class="equation-plus">＋</span>':'')+'<div class="coefficient '+(i===coach.index?'is-suggested':'')+'" data-side="'+(i<reaction.left.length?'reactant':'product')+'"><span class="species-side">'+(i<reaction.left.length?'反應物':'生成物')+'</span><div class="coefficient-formula"><output aria-label="'+formula+' 係數">'+coeff[i]+'</output><b>'+formulaHTML(formula)+'</b></div><span class="coefficient-name">'+balanceSpeciesNames[formula]+'</span><div class="coefficient-buttons"><button data-adjust="'+i+'" data-delta="-1" aria-label="減少'+balanceSpeciesNames[formula]+'的係數" '+(coeff[i]<=1?'disabled':'')+'>−</button><span>係數</span><button data-adjust="'+i+'" data-delta="1" aria-label="增加'+balanceSpeciesNames[formula]+'的係數" '+(coeff[i]>=12?'disabled':'')+'>＋</button></div><div class="coefficient-atoms">'+Object.entries(parseFormula(formula)).map(([element,n])=>'<span><i style="background:'+elements[element].color+'"></i>'+element+' <b>'+n*coeff[i]+'</b></span>').join('')+'</div></div>').join('');
  root.querySelectorAll('[data-adjust]').forEach(button=>button.onclick=()=>{
   const index=Number(button.dataset.adjust),delta=Number(button.dataset.delta),focusLabel=button.getAttribute('aria-label');
   if(!Number.isInteger(index)||index<0||index>=coeff.length||![-1,1].includes(delta))return;
   coeff[index]=Math.max(1,Math.min(12,coeff[index]+delta));draw();
   [...root.querySelectorAll('[data-adjust]')].find(item=>item.getAttribute('aria-label')===focusLabel)?.focus({preventScroll:true});
  });
  root.querySelector('.balance-models').innerHTML=formulas.map((formula,i)=>'<div class="particle-species"><strong>'+coeff[i]+formulaHTML(formula)+'</strong>'+particleGroup(formula,coeff[i])+'</div>').join('');
  root.querySelector('.balance-ledger').innerHTML='<div class="ledger-title"><b>核對原子數</b><span>左邊＝右邊</span></div>'+ledger.rows.map(row=>{
   const equal=row.left===row.right,max=Math.max(row.left,row.right,1);
   return '<div class="ledger-row '+(equal?'is-equal':'is-mismatch')+'"><span class="ledger-element" aria-label="'+elements[row.e].name+'原子" style="--atom:'+elements[row.e].color+'">'+row.e+'</span><div class="ledger-count"><span>左邊 <b>'+row.left+'</b></span><i style="--fill:'+row.left/max*100+'%"></i></div><div class="ledger-count"><span>右邊 <b>'+row.right+'</b></span><i style="--fill:'+row.right/max*100+'%"></i></div><strong class="ledger-verdict">'+(equal?'✓ 相同':(row.left>row.right?'右邊少 ':'左邊少 ')+Math.abs(row.left-row.right)+' 個')+'</strong></div>';
  }).join('');
  notice(root,'');
  if(complete){
   const first=!solved.has(id);solved.add(id);ctx.data.balanced=[...solved];ctx.save();
   if(first)ctx.mark('balanced-reaction');
  }
  const next=root.querySelector('.balance-next');next.disabled=!complete;next.hidden=false;
  next.textContent=solved.size===balanceOrder.length?'四題完成，答一題 →':'完成這題，下一題 →';
  root.querySelector('.balance-done').textContent='已完成 '+solved.size+' / '+balanceOrder.length;
  root.querySelector('.equation-workbench').classList.toggle('balanced',complete);
  root.querySelectorAll('[data-balance-sample]').forEach(button=>{const key=button.dataset.balanceSample;button.setAttribute('aria-pressed',String(key===id));button.querySelector('.sample-state').textContent=solved.has(key)?'✓ 已配平':'拿取這一題';});
  record.innerHTML='<h4>我的配平紀錄</h4><table><thead><tr><th>反應</th><th>最簡係數比</th><th>原子核對</th></tr></thead><tbody>'+balanceOrder.map(key=>'<tr><th>'+reactions[key].name+'</th><td>'+(solved.has(key)?reactions[key].coeff.join('：'):'—')+'</td><td>'+(solved.has(key)?'✓ 相同':'尚未完成')+'</td></tr>').join('')+'</tbody></table>';

 }
 root.querySelector('.balance-next').onclick=()=>{
  const ledger=atomLedger(id,coeff);if(!ledger.balanced||!ledger.minimal)return;
  if(solved.size===balanceOrder.length){const quiz=root.closest('.learning-card')?.querySelector(':scope > .card-body > .quiz');quiz?.scrollIntoView({behavior:'auto',block:'start'});quiz?.querySelector('input')?.focus({preventScroll:true});return;}
  id=balanceOrder.find(key=>!solved.has(key));coeff=reactions[id].coeff.map(()=>1);root.querySelector('.balance-select').value=id;draw();
 };
 function chooseReaction(key){if(!balanceOrder.includes(key))return;id=key;coeff=reactions[id].coeff.map(()=>1);root.querySelector('.balance-select').value=id;draw();}
 root.querySelector('.balance-select').onchange=event=>chooseReaction(event.target.value);
 root.querySelectorAll('[data-balance-sample]').forEach(button=>makeDraggable(button,root.querySelector('.equation-controls'),()=>chooseReaction(button.dataset.balanceSample),root.querySelector('.activity-status')));
 root.querySelector('.balance-reset').onclick=()=>{coeff=coeff.map(()=>1);draw();};
 root.querySelector('.balance-hint').onclick=()=>notice(root,balanceCoach(id,coeff).hint);
 draw();return{reset(){balanceDemo.reset();solved.clear();ctx.data.balanced=[];id='water';coeff=[1,1,1];root.querySelector('.balance-select').value=id;draw();}};
}
export function mountStoich(root,ctx){
 root.classList.add('stoich-studio');
 let id='peroxide',unit='g',value=34,productIndex=1,current=null;
 let level=1,levels=new Set(ctx.data.stoichLevels||[]),levelDrafts=new Map();
 const units={g:'公克 g',mg:'毫克 mg',kg:'公斤 kg',mol:'莫耳 mol',particles:'粒子個數'};
 const names={H2O2:'過氧化氫',H2O:'水',O2:'氧氣',Mg:'鎂',MgO:'氧化鎂',CaCO3:'碳酸鈣',CaCl2:'氯化鈣',CO2:'二氧化碳'};
 root.innerHTML=ExplorationWorkbench('<div class="stoich-visual"></div>','<div class="stoich-stage-controls"></div>','教學模型：假設反應完全進行、沒有材料損失；其他反應物給得足夠。')+'<details class="workshop-challenges" open><summary>換你練習：三個小關卡</summary><div class="challenge-inner"><div class="level-tabs" role="group" aria-label="工坊三關">'+[1,2,3].map(n=>'<button data-level="'+n+'"></button>').join('')+'</div><div class="level-question"></div><div class="answer-row"><label>我的答案<input class="level-answer" type="number" step="any" min="0"></label><span class="level-unit"></span><button class="primary level-check">檢查本關</button></div><p class="level-feedback" role="status"></p><button type="button" class="secondary level-next" hidden>繼續下一關 →</button><details class="final-challenge"><summary>挑戰：里昂需要 8 g 氧氣</summary><p>有 40 g 過氧化氫水溶液，其中一半質量是 H₂O₂，另一半是水。完全分解後，能收集到 8 g 氧氣嗎？先算裡面有幾克 H₂O₂。</p><div class="answer-row"><label>算出的氧氣質量<input class="challenge-answer" type="number" step="any" min="0"></label><span>g</span><button class="secondary challenge-check">檢查挑戰</button></div><p class="challenge-feedback" role="status"></p></details></div></details>';
 prepareStudio(root,{number:'04',title:'產量計算工作室'},ctx);

 const exampleReaction=reactions.peroxide, exampleMass=exampleReaction.coeff[0]*molecularMass('H2O2'),exampleOxygen=react('peroxide',[exampleMass]).products[1].mass,exampleWater=react('peroxide',[exampleMass]).products[0].mass;
 const example=document.createElement('section');example.className='worked-example';example.setAttribute('aria-label','先看一個完整例題');
 example.innerHTML='<div class="example-heading"><h3>68 g 過氧化氫，能產生多少氧氣？</h3><p>68 g 指純 H₂O₂，假設完全分解。</p></div><div class="example-tabs" role="group" aria-label="例題示範步驟"><button data-example-step="0">1 看配方</button><button data-example-step="1">2 換成克數</button><button data-example-step="2">3 用量減半</button></div><div class="example-board" aria-live="polite"></div><div class="example-actions"><button class="primary example-next">下一步：換成克數 →</button><button class="text-button example-explore">我懂了，調整用量 ↓</button></div>';
 const free=document.createElement('details');free.className='free-stoich';free.innerHTML='<summary><span>自由試算：調整用量</span></summary>';const bench=root.querySelector('.workbench');bench.before(example,free);free.append(bench);
 let exampleStep=0;
 const exampleViews=[
 '<div class="example-recipe"><div><b>2 <small>mol</small></b><strong>H₂O₂</strong><span>過氧化氫</span></div><i>→</i><div><b>2 <small>mol</small></b><strong>H₂O</strong><span>水</span></div><i>＋</i><div><b>1 <small>mol</small></b><strong>O₂</strong><span>氧氣</span></div></div><p class="example-takeaway"><b>2 mol 過氧化氫 → 1 mol 氧氣</b>，莫耳比是 2：1。</p>',
 '<span class="example-caption">每莫耳幾克 × 有幾莫耳 ＝ 總共幾克</span><div class="example-recipe"><div><span>2 × 34 g</span><b>'+exampleMass+' <small>g</small></b><strong>H₂O₂</strong></div><i>→</i><div><span>2 × 18 g</span><b>'+exampleWater+' <small>g</small></b><strong>H₂O</strong></div><i>＋</i><div><span>1 × 32 g</span><b>'+exampleOxygen+' <small>g</small></b><strong>O₂</strong></div></div><p class="example-takeaway">所以 <b>'+exampleMass+' g 過氧化氫 → '+exampleOxygen+' g 氧氣</b>，同時生成 '+exampleWater+' g 水。檢查一下：'+exampleWater+'＋'+exampleOxygen+'＝'+exampleMass+' g。</p>',
 '<div class="example-halves"><div><span>原本</span><b>'+exampleMass+' g H₂O₂ → '+exampleOxygen+' g O₂</b></div><span class="half-arrow">兩邊都 ÷ 2 ↓</span><div><span>減半</span><b>'+exampleMass/2+' g H₂O₂ → '+exampleOxygen/2+' g O₂</b></div></div><p class="example-takeaway"><b>用量減半，產量也減半。</b>質量比維持 68：32。</p>'
 ];
 function showExample(){root.querySelector('.example-board').innerHTML=exampleViews[exampleStep];root.querySelectorAll('[data-example-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.exampleStep===exampleStep)));root.querySelector('.example-next').textContent=['下一步：換成克數 →','下一步：用量減半 →','看懂了，試著改用量 →'][exampleStep];}
 const openFree=()=>{free.open=true;free.scrollIntoView({behavior:'auto',block:'start'});root.querySelector('.stoich-value').focus({preventScroll:true});};
 root.querySelectorAll('[data-example-step]').forEach(b=>b.onclick=()=>{exampleStep=+b.dataset.exampleStep;showExample();});root.querySelector('.example-next').onclick=()=>{if(exampleStep<2){exampleStep++;showExample();}else openFree();};root.querySelector('.example-explore').onclick=openFree;showExample();
 const control=root.querySelector('.stoich-stage-controls');
 function inUnit(grams){const c=convert(grams,'g',reactions[id].left[0]);return unit==='mol'?c.mol:unit==='particles'?Math.round(c.particles):c.mass/{g:1,mg:.001,kg:1000}[unit];}
 function compute(raw){try{if(raw===''||!Number.isFinite(Number(raw))||Number(raw)<0)throw new Error('請填入 0 或大於 0 的數字。');if(Number(raw)>1e30)throw new Error('數字太大了，請把材料用量調小。');finite(raw,0,1e30);if(unit==='particles'&&!Number.isInteger(Number(raw)))throw new Error('粒子要一個一個數，請輸入整數。');const r=reactions[id],f=r.left[0],c=convert(Number(raw),unit,f);if(c.mass>1e6)throw new Error('材料最多可輸入 1,000,000 g，請把數字調小。');const masses=r.left.map((formula,i)=>i===0?c.mass:c.mol/r.coeff[0]*r.coeff[i]*molecularMass(formula)*2+1),out=react(id,masses);value=Number(raw);current={r,f,c,out,product:out.products[productIndex]};return '';}catch(e){current=null;return e.message;}}
 function steps(){const {r,c,product}=current,a=r.coeff[0],b=r.coeff[r.left.length+productIndex],M=molecularMass(product.formula);return[
  {title:'材料有幾莫耳？',why:'每 '+c.M+' g 是 1 mol，所以用克數除以 '+c.M+'。',formula:format(c.mass)+' g ÷ '+c.M+' g/mol',answer:c.mol,unit:'mol',hint:'算 '+format(c.mass)+' ÷ '+c.M+'，就知道材料有幾莫耳。'},
  {title:'會有幾莫耳產物？',why:'配方是 '+a+' mol '+names[current.f]+' → '+b+' mol '+names[product.formula]+'，所以乘 '+b+'/'+a+'。',formula:format(c.mol)+' mol × '+b+'/'+a,answer:product.mol,unit:'mol',hint:'用剛才的 '+format(c.mol)+' mol，乘上「產物係數 '+b+' ÷ 反應物係數 '+a+'」。'},
  {title:'產物有幾克？',why:'1 mol '+names[product.formula]+' 是 '+M+' g，所以再乘 '+M+'。',formula:format(product.mol)+' mol × '+M+' g/mol',answer:product.mass,unit:'g',hint:'用 '+format(product.mol)+' × '+M+'，把產物的莫耳數換回克數。'}
 ];}

 function drawVisual(){
  const area=root.querySelector('.stoich-visual');area.dataset.phase='auto';
  if(!current){area.innerHTML='<div class="invalid-state"><h3>先把用量改好</h3><p>請依用量欄位的提示，修正輸入的數字。</p></div>';return;}
  const {f,c,out,product}=current;
  area.innerHTML='<div class="stoich-flow"><div><span>投入材料</span><b>'+format(c.mass)+' <small>g</small></b><strong>'+formulaHTML(f)+'</strong></div><span class="flow-arrow" aria-hidden="true">→</span><div><span>指定產物</span><b>'+format(product.mass)+' <small>g</small></b><strong>'+formulaHTML(product.formula)+'</strong></div></div><section class="stoich-result-card"><h3>'+format(c.mass)+' g '+formulaHTML(f)+' 可以生成</h3><div class="stoich-result-number" data-result="product-mass">'+format(product.mass)+' <small>g '+formulaHTML(product.formula)+'</small></div><div class="equation">'+equationHTML(id)+'</div><ol class="automatic-steps">'+steps().map((s,i)=>'<li><span class="automatic-step-number">'+(i+1)+'</span><div><b>'+s.title+'</b><p>'+s.why+'</p><div class="automatic-formula">'+s.formula+' ＝ <strong>'+format(s.answer)+' '+s.unit+'</strong></div></div></li>').join('')+'</ol><details class="apparatus-details"><summary>查看材料與產物的示意</summary><div class="stoich-apparatus">'+stoichiometryArt(f,c.mass,out.products,{revealed:true})+'</div></details><details class="result-particles"><summary>這份材料有多少個粒子？</summary><p>'+format(c.mass)+' g '+formulaHTML(f)+'＝'+format(c.mol)+' mol，約有 '+format(c.particles)+' 個'+(f==='Mg'?'鎂原子':f==='CaCO3'?'碳酸鈣式單位':'過氧化氫分子')+'。</p></details></section>';
 }
 function syncDose(raw){
  const error=compute(raw),input=control.querySelector('.stoich-value'),range=control.querySelector('.stoich-dose-slider');input.setCustomValidity(error);control.querySelector('.stoich-error').textContent=error;
  if(current){input.value=String(value);range.max=String(inUnit(Math.max(100,current.c.mass)));range.value=String(value);guideStep(root,'用量一改，答案立即更新','看三步計算，再到小關卡練習。','.stoich-value');}
  else guideStep(root,'這個用量需要調整',error,'.stoich-value');input.setAttribute('aria-invalid',String(!!error));control.querySelectorAll('[data-dose]').forEach(b=>b.setAttribute('aria-pressed',String(!!current&&Math.abs(current.c.mass-Number(b.dataset.dose))<1e-8)));drawVisual();
 }
 function show(){
  const r=reactions[id];
  control.innerHTML='<span class="panel-eyebrow">自由調整用量</span><h3>讓系統算給你看</h3><label class="select-label">做哪個反應？<select class="stoich-reaction">'+['peroxide','magnesium','limestone'].map(x=>'<option value="'+x+'" '+(x===id?'selected':'')+'>'+reactions[x].name+'</option>').join('')+'</select></label><label class="select-label">想算哪個產物？<select class="stoich-product">'+r.right.map((f,i)=>'<option value="'+i+'" '+(i===productIndex?'selected':'')+'>'+names[f]+'（'+f+'）</option>').join('')+'</select></label><label class="select-label dose-label">'+names[r.left[0]]+'的用量（'+units[unit]+'）<input class="stoich-value" type="number" min="0" max="1e30" step="any" value="'+value+'"></label><input class="stoich-dose-slider" aria-label="材料用量滑桿" type="range" min="0" max="'+inUnit(Math.max(100,current?.c.mass||0))+'" step="any" value="'+value+'"><div class="dose-presets">'+({peroxide:[17,34,68],magnesium:[6,12,24],limestone:[5,10,20]}[id]).map(v=>'<button data-dose="'+v+'">'+v+' g</button>').join('')+'</div><div class="dose-scale"><span>比較用量</span><button type="button" data-scale="0.5">減半 ÷ 2</button><button type="button" data-scale="2">加倍 × 2</button></div><p class="stoich-error field-error" role="status"></p><p class="excess-note">'+(r.left.length>1?'另一種反應物足量，不會先用完。':'這裡只算 H₂O₂ 的量，不包含溶液裡的水。')+'</p><details class="input-unit-options"><summary>想換別的單位輸入？</summary><label class="select-label">單位<select class="stoich-unit">'+Object.entries(units).map(([u,t])=>'<option value="'+u+'" '+(u===unit?'selected':'')+'>'+t+'</option>').join('')+'</select></label><p>換單位不會改變材料多少。例如 1 g＝1,000 mg。</p></details><button class="secondary auto-practice-jump">換我自己練習 ↓</button><button class="text-button stoich-reset">恢復 34 g 過氧化氫</button>';
  control.querySelector('.stoich-value').oninput=e=>syncDose(e.target.value);
  control.querySelector('.stoich-dose-slider').oninput=e=>syncDose(unit==='particles'?Math.round(Number(e.target.value)):Number(Number(e.target.value).toPrecision(4)));
  control.querySelectorAll('[data-scale]').forEach(b=>b.onclick=()=>{if(current)syncDose(unit==='particles'?Math.floor(value*Number(b.dataset.scale)):Number((value*Number(b.dataset.scale)).toPrecision(12)));});
  control.querySelectorAll('[data-dose]').forEach(b=>b.onclick=()=>syncDose(inUnit(Number(b.dataset.dose))));
  control.querySelector('.stoich-reaction').onchange=e=>{id=e.target.value;productIndex=reactions[id].right.length-1;compute(value);show();};
  control.querySelector('.stoich-product').onchange=e=>{productIndex=Number(e.target.value);compute(value);show();};
  control.querySelector('.stoich-unit').onchange=e=>{const grams=current?.c.mass??34;unit=e.target.value;value=inUnit(grams);compute(value);show();control.querySelector('.input-unit-options').open=true;};
  control.querySelector('.stoich-reset').onclick=reset;
  control.querySelector('.auto-practice-jump').onclick=()=>{const panel=root.querySelector('.workshop-challenges');panel.open=true;panel.scrollIntoView({behavior:'auto',block:'start'});panel.querySelector('.level-answer').focus({preventScroll:true});};
  syncDose(value);
 }
 const tasks={1:{q:'18 g 水，每 1 mol 是 18 g。這些水有幾 mol？',unit:'mol',a:1,reason:'18÷18＝1 mol。'},2:{q:'0.5 mol 水約有幾個水分子？很大的數可寫成 3.01e23。',unit:'個分子',a:3.01e23,reason:'0.5×6.02×10²³＝3.01×10²³ 個水分子。'},3:{q:'8.4 g 小蘇打和夠多的醋酸反應，產生幾克 CO₂？1 mol 小蘇打是 84 g，可生成 1 mol、44 g 的 CO₂。',unit:'g',a:4.4,reason:'8.4÷84＝0.1 mol；0.1×1×44＝4.4 g CO₂。'}};
 function showLevel(){const t=tasks[level];root.querySelector('.level-question').innerHTML='<h3>第 '+level+' 關</h3><p>'+t.q+'</p>';root.querySelector('.level-unit').textContent=t.unit;root.querySelector('.level-answer').value=levelDrafts.get(level)||'';root.querySelector('.level-answer').removeAttribute('aria-invalid');root.querySelector('.level-next').hidden=true;root.querySelector('.level-feedback').textContent='';root.querySelector('.level-feedback').className='level-feedback';root.querySelectorAll('[data-level]').forEach(b=>{const n=Number(b.dataset.level);b.setAttribute('aria-pressed',String(n===level));b.textContent=['1 · 克與莫耳','2 · 莫耳與粒子','3 · 算產物'][n-1]+(levels.has(n)?' ✓':'');});}
 root.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.level);showLevel();});
 root.querySelector('.level-answer').addEventListener('input',e=>{levelDrafts.set(level,e.target.value);root.querySelector('.level-feedback').textContent='';root.querySelector('.level-feedback').className='level-feedback';root.querySelector('.level-next').hidden=true;e.target.removeAttribute('aria-invalid');});
 root.querySelector('.level-answer').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('.level-check').click();}});
 root.querySelector('.level-next').onclick=()=>{if(level<3){level++;showLevel();root.querySelector('.level-answer').focus({preventScroll:true});}};
 root.querySelector('.challenge-answer').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('.challenge-check').click();}});
 root.querySelector('.level-check').onclick=()=>{const raw=root.querySelector('.level-answer').value,n=Number(raw),t=tasks[level];if(raw===''||!Number.isFinite(n)||n<0){root.querySelector('.level-feedback').textContent='請輸入 0 或大於 0 的數字。';root.querySelector('.level-answer').setAttribute('aria-invalid','true');root.querySelector('.level-answer').focus({preventScroll:true});return;}const ok=Math.abs(n-t.a)<=Math.max(t.a*.005,1e-8);if(ok){levels.add(level);ctx.data.stoichLevels=[...levels];ctx.save();root.querySelector('[data-level="'+level+'"]').textContent=['1 · 克與莫耳','2 · 莫耳與粒子','3 · 算產物'][level-1]+' ✓';ctx.mark('workshop-level');}root.querySelector('.level-next').hidden=!ok||level===3;root.querySelector('.level-answer').setAttribute('aria-invalid',String(!ok));root.querySelector('.level-feedback').className='level-feedback '+(ok?'correct':'incorrect');root.querySelector('.level-feedback').innerHTML=ok?'✓ 正確！'+t.reason:'<b>再試一次：</b>'+({1:'題目問幾莫耳，用總質量除以每莫耳的質量。',2:'一莫耳有 6.02 × 10²³ 個，半莫耳呢？可用 e23 輸入 ×10²³。',3:'先算小蘇打的莫耳數，再用 1：1 的比例算 CO₂，最後乘上 44 g/mol。'}[level])+'<details class="solution-reveal"><summary>看完整計算</summary><p>'+t.reason+'</p></details>';};
 root.querySelector('.challenge-check').onclick=()=>{const raw=root.querySelector('.challenge-answer').value,answer=react('peroxide',[20]).products[1].mass,ok=raw!==''&&Number.isFinite(Number(raw))&&Math.abs(Number(raw)-answer)<.05;root.querySelector('.challenge-feedback').textContent=(ok?'✓ 正確，氧氣夠用！':'算出的氧氣約 9.41 g，所以夠用。')+'先算 H₂O₂：40×50%＝20 g。再算氧氣：20÷34×(1/2)×32≈9.41 g。原來的 20 g 水，加上新生成的約 10.59 g 水，再加氧氣，總共仍是 40 g。';};

 function reset(){id='peroxide';unit='g';value=34;productIndex=1;compute(value);show();}
 compute(value);show();showLevel();return{reset(){exampleStep=0;showExample();free.open=false;levels.clear();levelDrafts.clear();ctx.data.stoichLevels=[];level=1;reset();showLevel();root.querySelector('.challenge-answer').value='';root.querySelector('.challenge-feedback').textContent='';}};
}
