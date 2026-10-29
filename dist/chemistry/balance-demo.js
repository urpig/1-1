import { reactions, atomLedger, formulaHTML, elements } from './core.js';
export const balanceDemonstrationSteps=[
 {title:'先數一數：哪一種原子還沒對上？',coeff:[1,1,1],explanation:'左邊 O₂ 有 2 個氧原子，右邊 H₂O 只有 1 個氧原子。先讓右邊的氧變成 2 個。',next:'下一步：把水的係數改成 2 →'},
 {title:'在 H₂O 前面加上 2',coeff:[1,1,2],explanation:'2H₂O 表示兩份水：共有 4 個氫、2 個氧。氧對上了，但左邊只有 2 個氫，還差 2 個。',next:'下一步：把氫氣的係數也改成 2 →'},
 {title:'在 H₂ 前面加上 2，完成！',coeff:[2,1,2],explanation:'左右現在都有 4 個氫、2 個氧。係數是最簡整數比 2：1：2；係數 1 通常省略。整個過程都沒有改動化學式的下標。',next:'看懂了，換我自己操作 →'}
];
export function mountBalanceDemonstration(root){
 const practice=root.querySelector('.equation-workbench'),drawer=document.createElement('details');drawer.className='balance-practice';
 drawer.innerHTML='<summary><b>換你操作：自己調整係數</b></summary>';
 practice.before(drawer);drawer.append(practice);
 const demo=document.createElement('section');demo.className='worked-example balance-example';demo.setAttribute('aria-label','係數平衡的分步示範');
 demo.innerHTML='<div class="example-heading"><h3>只改前面的係數，讓原子數一樣多</h3></div><div class="example-tabs" role="group" aria-label="係數平衡示範步驟">'+['1 數原子','2 先配氧','3 再配氫'].map((text,i)=>'<button type="button" data-balance-demo="'+i+'" aria-pressed="'+(i===0)+'">'+text+'</button>').join('')+'</div><div class="balance-demo-board" aria-live="polite"></div><div class="example-actions"><button type="button" class="primary balance-demo-next"></button><button type="button" class="text-button balance-demo-restart">從頭看示範</button></div>';
 drawer.before(demo);let step=0;
 function draw(){
  const current=balanceDemonstrationSteps[step],r=reactions.water,ledger=atomLedger(r,current.coeff),formulas=[...r.left,...r.right];
  root.querySelector('.balance-demo-board').innerHTML='<h4>'+current.title+'</h4><div class="demo-equation" aria-label="'+current.coeff[0]+' H2 加 '+current.coeff[1]+' O2 生成 '+current.coeff[2]+' H2O">'+formulas.map((formula,i)=>(i?'<span class="demo-operator">'+(i===r.left.length?'→':'＋')+'</span>':'')+'<div class="demo-species"><span>'+(i<r.left.length?'反應物':'生成物')+'</span><b><em class="'+(current.coeff[i]!==1?'is-changed':'')+'">'+(current.coeff[i]===1?'':current.coeff[i])+'</em>'+formulaHTML(formula)+'</b><small>'+current.coeff[i]+' 份'+(['氫氣','氧氣','水'][i])+'</small></div>').join('')+'</div><div class="demo-atom-ledger">'+ledger.rows.map(row=>'<div class="'+(row.left===row.right?'is-equal':'is-mismatch')+'"><b>'+elements[row.e].name+'原子</b><span>左 '+row.left+' 個</span><span>右 '+row.right+' 個</span><strong>'+(row.left===row.right?'✓ 相等':'還不相等')+'</strong></div>').join('')+'</div><p class="demo-explanation">'+current.explanation+'</p>';
  root.querySelectorAll('[data-balance-demo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.balanceDemo)===step)));
  root.querySelector('.balance-demo-next').textContent=current.next;
 }
 root.querySelectorAll('[data-balance-demo]').forEach(b=>b.onclick=()=>{step=Number(b.dataset.balanceDemo);draw();});
 root.querySelector('.balance-demo-next').onclick=()=>{if(step<2){step++;draw();}else{drawer.open=true;drawer.scrollIntoView({behavior:'auto',block:'start'});root.querySelector('.balance-select').focus({preventScroll:true});}};
 root.querySelector('.balance-demo-restart').onclick=()=>{step=0;draw();};
 draw();return{reset(){step=0;drawer.open=false;draw();}};
}