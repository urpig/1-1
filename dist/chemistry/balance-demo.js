import { particleGroup } from './art.js';
import { reactions, atomLedger, formulaHTML, elements } from './core.js';
export const balanceDemonstrationSteps=[
 {title:'先數一數：哪一種原子還沒對上？',coeff:[1,1,1],explanation:'氧原子：左 2、右 1。先增加水的份數。',next:'下一步：把水的係數改成 2 →'},
 {title:'在 H₂O 前面加上 2',coeff:[1,1,2],explanation:'氧相同了；氫原子：左 2、右 4。再增加氫氣的份數。',next:'下一步：把氫氣的係數也改成 2 →'},
 {title:'在 H₂ 前面加上 2，完成！',coeff:[2,1,2],explanation:'左右各有 4 個氫、2 個氧；最簡係數比是 2：1：2。',next:'看懂了，換我自己操作 →'}
];
export function mountBalanceDemonstration(root){
 const practice=root.querySelector('.equation-workbench'),modes=document.createElement('nav'),demo=document.createElement('section');
 modes.className='balance-mode-tabs';modes.setAttribute('aria-label','選擇配平學習方式');
 modes.innerHTML='<button type="button" data-balance-mode="demo" aria-pressed="true">① 看一題示範</button><button type="button" data-balance-mode="practice" aria-pressed="false">② 換我自己配平</button>';
 demo.className='worked-example balance-example';demo.setAttribute('aria-label','係數平衡的分步示範');
 demo.innerHTML='<div class="example-heading"><h3>氫氣＋氧氣 → 水</h3></div><div class="example-tabs" role="group" aria-label="係數平衡示範步驟">'+['1 看原子','2 增加水','3 增加氫氣'].map((text,i)=>'<button type="button" data-balance-demo="'+i+'" aria-pressed="'+(i===0)+'">'+text+'</button>').join('')+'</div><div class="balance-demo-board" aria-live="polite"></div><div class="example-actions"><button type="button" class="primary balance-demo-next"></button><button type="button" class="text-button balance-demo-restart">重看示範</button></div>';
 practice.before(modes,demo);practice.classList.add('balance-practice');
 const method=root.querySelector('.balance-method');if(method)practice.append(method);
 let step=0;
 function showMode(mode,focus=false){
  practice.hidden=mode!=='practice';demo.hidden=mode!=='demo';
  root.querySelectorAll('[data-balance-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.balanceMode===mode)));
  if(focus){modes.scrollIntoView({behavior:'auto',block:'start'});root.querySelector(mode==='practice'?'.balance-select':'.balance-demo-next').focus({preventScroll:true});}
 }
 function draw(){
  const current=balanceDemonstrationSteps[step],r=reactions.water,ledger=atomLedger(r,current.coeff),formulas=[...r.left,...r.right];
  root.querySelector('.balance-demo-board').innerHTML='<h4>'+current.title+'</h4><div class="demo-equation" aria-label="'+current.coeff[0]+' H2 加 '+current.coeff[1]+' O2 生成 '+current.coeff[2]+' H2O">'+formulas.map((formula,i)=>(i?'<span class="demo-operator">'+(i===r.left.length?'→':'＋')+'</span>':'')+'<div class="demo-species"><span>'+(['氫氣','氧氣','水'][i])+'</span><b><em class="'+(current.coeff[i]!==1?'is-changed':'')+'">'+current.coeff[i]+'</em>'+formulaHTML(formula)+'</b><div class="demo-particles">'+particleGroup(formula,current.coeff[i])+'</div></div>').join('')+'</div><div class="demo-atom-ledger">'+ledger.rows.map(row=>'<div class="'+(row.left===row.right?'is-equal':'is-mismatch')+'"><b>'+elements[row.e].name+'原子</b><span>左 '+row.left+' 個</span><span>右 '+row.right+' 個</span><strong>'+(row.left===row.right?'✓ 相同':'數量不同')+'</strong></div>').join('')+'</div><p class="demo-explanation">'+current.explanation+'</p>';
  root.querySelectorAll('[data-balance-demo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.balanceDemo)===step)));
  root.querySelector('.balance-demo-next').textContent=current.next;
  root.querySelector('.balance-demo-restart').disabled=step===0;
 }
 root.querySelectorAll('[data-balance-mode]').forEach(button=>button.onclick=()=>showMode(button.dataset.balanceMode,true));
 root.querySelectorAll('[data-balance-demo]').forEach(b=>b.onclick=()=>{step=Number(b.dataset.balanceDemo);draw();});
 root.querySelector('.balance-demo-next').onclick=()=>{if(step<2){step++;draw();}else showMode('practice',true);};
 root.querySelector('.balance-demo-restart').onclick=()=>{step=0;draw();};
 draw();showMode('practice');return{reset(){step=0;draw();showMode('practice');}};
}
