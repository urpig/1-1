import { reactions, react, conservation, format, equationHTML, formulaHTML } from './core.js';
import { laboratoryArt, massArt } from './art.js';
import { materialIcon } from './apparatus.js';
import { ExplorationWorkbench, numberField, bindNumber, metric, makeDraggable, reactionClock, notice, WorkflowSteps, massTrace, matchedMassPair, guideStep } from './components.js';

export function mountLab(root,ctx){
 let id='magnesium',dose=2.4,partner=3.2,added=false,second=false,p=0,running=false,heat=false;
 let completed=new Set(ctx.data.labDone||[]),records=ctx.data.labRecords||[];
 const names={magnesium:['鎂帶','氧氣'],hydrate:['五水硫酸銅',''],precipitate:['碳酸鈉溶液中的溶質','氯化鈣溶液中的溶質'],limestone:['碳酸鈣','鹽酸中的 HCl']};
 const defaults={magnesium:[2.4,3.2],hydrate:[5,0],precipitate:[5.3,5.55],limestone:[5,7.3]};
 root.innerHTML=ExplorationWorkbench(
  '<div class="workbench-caption"><span class="bench-dot"></span><b>材料準備台</b><span>拖到器材上，也可點一下放入</span></div><div class="apparatus-viewport"><div class="lab-art"></div><div class="drop-zone lab-drop" tabindex="0" role="button" aria-label="反應區，將已選材料放入"><span>放到這裡</span></div><button class="apparatus-action heat-action" aria-label="操作酒精燈">點燃熱源</button><div class="transfer-art" aria-hidden="true"></div></div><div class="sample-rack"><button class="sample-token sample-one" aria-label="放入第一種材料"></button><button class="sample-token sample-two" aria-label="放入第二種材料"></button></div>',
  '<div class="panel-eyebrow">實驗設計</div><h3>先選材料，再看變化</h3><label class="select-label">實驗項目<select class="lab-select"><option value="magnesium">A · 鎂的燃燒</option><option value="hydrate">B · 結晶水的消失</option><option value="precipitate">C · 神祕白色沉澱</option><option value="limestone">D · 冒泡的石頭</option></select></label>'+numberField('lab-dose','第一種材料質量',dose,0,12,.1,'g')+'<div class="partner-field">'+numberField('lab-partner','第二種材料質量',partner,0,15,.05,'g')+'</div><label class="check-line heat-line"><input type="checkbox" class="heat-check"> 提供加熱條件</label><div class="lab-workflow"></div><div class="activity-status" role="status" aria-live="polite"></div><div class="button-row"><button class="primary run" data-run>點燃熱源</button><button class="secondary pause">暫停觀察</button><button class="secondary step">前進一格</button></div><button class="text-button reset">清空器材，保留用量</button><progress class="reaction-progress" max="1" value="0" aria-label="反應進度"></progress><div class="lab-readout"></div><div class="lab-done"></div>',
  '畫面把變化加快，方便觀察。溶液的用量只算溶在水裡的物質（溶質），不含水；不要用畫面上的液面高度算體積。');
 root.insertAdjacentHTML('beforeend','<div class="observation-panel"><div class="observation-heading"><h3>我的實驗紀錄</h3><span>換一組用量，讓證據可以比較</span></div><div class="lab-records"></div></div>');
 root.querySelector('.model-column').append(root.querySelector('.lab-readout'));
 const art=root.querySelector('.lab-art'),drop=root.querySelector('.lab-drop'),one=root.querySelector('.sample-one'),two=root.querySelector('.sample-two'),status=root.querySelector('.activity-status');
 const heated=()=>['magnesium','hydrate'].includes(id);
 const ready=()=>added&&(second||id==='hydrate');
 const result=()=>react(id,id==='hydrate'?[dose]:[dose,partner],p);
 function renderSamples(){
  const types={magnesium:['ribbon','gas'],hydrate:['crystal',''],precipitate:['solution','solution'],limestone:['stone','solution']}[id];
  [one,two].forEach((button,i)=>{button.innerHTML=materialIcon(types[i],reactions[id].left[i])+'<span class="material-description"><b>'+names[id][i]+'</b><span>'+formulaHTML(reactions[id].left[i]||'')+' · <strong>'+format(i?partner:dose)+' g</strong></span><small>拿起並放入器材</small></span><span class="material-check" aria-hidden="true">✓ 已放入</span>';});
 }
 function draw(){
  const r=result(),prod=r.products.find(x=>x.formula===(id==='limestone'?'CO2':id==='precipitate'?'CaCO3':id==='hydrate'?'CuSO4':'MgO')).mass;
  art.innerHTML=laboratoryArt(id,{progress:p,amount:dose,product:prod,added,second,running,heat,conversion:dose>0?1-r.remaining[0].mass/dose:0,remaining:r.remaining[0].mass});
  root.querySelector('.reaction-progress').value=p;root.querySelector('.scene').classList.toggle('is-running',running);
  root.querySelector('.lab-readout').innerHTML=metric('觀察進度',Math.round(p*100),'%')+(p>0?'<div class="equation">'+equationHTML(id)+(id==='precipitate'?'↓':id==='limestone'?'↑':'')+'</div>'+r.products.map(x=>metric(formulaHTML(x.formula),format(x.mass),'g')).join('')+'<p class="small">剩餘：'+r.remaining.map(x=>formulaHTML(x.formula)+' '+format(x.mass)+' g').join('、')+'</p>':'<p class="small">讓材料接觸或提供熱源，畫面與產物讀數會一起改變。</p>');
  one.classList.toggle('loaded',added);two.classList.toggle('loaded',second);one.disabled=added||running;two.disabled=second||running;
  drop.hidden=ready();root.querySelector('.pause').disabled=!running;
  root.querySelector('.run').disabled=running||!ready()||r.extent===0||!!root.querySelector('input:invalid');root.querySelector('.step').disabled=!ready()||r.extent===0||running||!!root.querySelector('input:invalid');
  root.querySelector('.run').textContent=p===1?'以同樣用量重做':p>0?'繼續觀察':heated()&&!heat&&(id==='hydrate'||p===0)?'點燃熱源':'開始觀察';
  root.querySelector('.heat-action').hidden=!heated();
  root.querySelector('.heat-action').textContent=heat?'移開熱源':'點燃熱源';
  root.querySelector('.heat-action').setAttribute('aria-pressed',String(heat));
  root.querySelector('.lab-done').textContent='已觀察 '+completed.size+' / 4 種反應';
  root.querySelector('.lab-workflow').innerHTML=WorkflowSteps(['準備材料',heated()?'加熱觀察':'接觸反應','記錄證據'],p>=1?3:p>0?2:ready()?1:0);
  root.querySelectorAll('input[type=number],input[type=range]').forEach(x=>x.disabled=running);
  if(!added)guideStep(root,'先放入'+names[id][0],'拖到器材上的虛線區，或直接點材料。','.sample-one');
  else if(!ready())guideStep(root,'再放入'+names[id][1],'兩種材料都放好，才能開始觀察。','.sample-two');
  else if(r.extent===0)guideStep(root,'先增加材料用量','有一種材料是 0 g，現在不會產生新物質。',dose<=0?'#lab-dose':'#lab-partner');
  else if(p>=1)guideStep(root,'這次反應完成了','下方已記下產物。可以換用量比較，或選另一個實驗。','.lab-select');
  else if(running)guideStep(root,'反應中：看看材料和讀數怎麼變','想看清楚某一刻，可以按「暫停觀察」。','.pause');
  else if(heated()&&!heat&&(id==='hydrate'||p===0))guideStep(root,'材料放好了，接著加熱','點器材旁的「點燃熱源」。','.heat-action');
  else guideStep(root,p>0?'已暫停，慢慢看清每一步':'材料放好了，開始觀察','可以繼續播放，或按「前進一格」看下一個變化。','.run');
 }
 function showRecords(){root.querySelector('.lab-records').innerHTML=records.length?'<table><thead><tr><th>實驗</th><th>投入</th><th>觀察到的證據</th><th>產物</th></tr></thead><tbody>'+records.map(x=>'<tr><td>'+reactions[x.id].name+'</td><td>'+format(x.dose)+' g'+(x.id==='hydrate'?'':' / '+format(x.partner)+' g')+'</td><td>'+x.observation+'</td><td>'+x.products.map(y=>formulaHTML(y.formula)+' '+format(y.mass)+' g').join('<br>')+'</td></tr>').join('')+'</tbody></table>':'<p class="empty-record">還沒有紀錄。完成一輪反應，這裡就會留下用量、現象與產物。</p>';}
 function finish(){
  if(result().extent===0)return;
  completed.add(id);
  const observation={magnesium:'白光、放熱，瓷皿留下白色 MgO',hydrate:'藍色晶體轉白，失去結晶水',precipitate:'透明溶液變混濁，生成白色 CaCO₃',limestone:'生成無色 CO₂；檢查是否有剩餘石灰石'}[id];
  records.push({id,dose,partner,observation,products:result().products});records=records.slice(-8);
  ctx.data.labDone=[...completed];ctx.data.labRecords=records;ctx.save();showRecords();draw();
  notice(root,observation+'。改變用量，再做一次比較。');if(completed.size===4)ctx.mark();
 }
 const clock=reactionClock((v,run)=>{p=v;running=run;draw();},finish);
 const invalidate=()=>{clock.reset();renderSamples();notice(root,'用量已更新；開始新一輪觀察，原紀錄仍保留。');};
 const setDose=bindNumber(root,'lab-dose',v=>{dose=v;invalidate();}),setPartner=bindNumber(root,'lab-partner',v=>{partner=v;invalidate();});
 function valid(){
  if(!ctx.predict())return false;
  if(root.querySelector('input:invalid'))return false;
  if(!ready()){notice(root,'先拿取下方材料，放到器材的虛線區；點材料也可以。');return false;}
  if(result().extent<=0){notice(root,'用量為 0 時不會有產物，請先調整材料。');return false;}
  return true;
 }
 function begin(){if(!valid())return;if(heated()&&!heat&&(id==='hydrate'||p===0)){heat=true;root.querySelector('.heat-check').checked=true;}clock.start();notice(root,heated()?'留意材料的顏色、白光與產物；可以暫停或逐格觀察。':'兩種材料接觸後開始反應，留意杯內變化與右側讀數。');}
 function add(which){
  if(!ctx.predict()||running)return;
  if(which===1)added=true;else second=true;
  draw();notice(root,ready()?(heated()?'材料已放好，點器材旁的「點燃熱源」。':'材料接觸，開始觀察變化。'):'已放入一種材料，再放入另一種。');
  if(ready()&&(!heated()||heat)&&result().extent>0){root.querySelector('.apparatus-viewport').classList.remove('pouring');void root.offsetWidth;root.querySelector('.apparatus-viewport').classList.add('pouring');begin();}
 }
 makeDraggable(one,drop,()=>add(1),status);makeDraggable(two,drop,()=>add(2),status);
 drop.onclick=()=>add(added?2:1);
 drop.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();add(added?2:1);}};
 function toggleHeat(){
  if(!ctx.predict())return;
  heat=!heat;root.querySelector('.heat-check').checked=heat;
  if(heat&&ready()&&result().extent>0)begin();
  else if(!heat&&id==='hydrate'){clock.pause();notice(root,'移開熱源後先暫停這段受熱過程；重新加熱可繼續。');}
  else if(!heat&&id==='magnesium'&&p>0&&p<1)notice(root,'已點燃的鎂仍可與氧氣繼續反應，移開酒精燈不會立刻停止燃燒。');
  else notice(root,heat?'加熱已準備好，接著準備材料。':'熱源已移開。');
  draw();
 }
 root.querySelector('.heat-action').onclick=toggleHeat;
 root.querySelector('.heat-check').onchange=e=>{const desired=e.target.checked;e.target.checked=heat;if(desired!==heat)toggleHeat();};
 root.querySelector('.run').onclick=begin;root.querySelector('.pause').onclick=()=>{clock.pause();notice(root,'已暫停觀察時間。可以逐格檢查，或繼續播放。');};
 root.querySelector('.step').onclick=()=>{if(valid()){if(heated()&&!heat&&(id==='hydrate'||p===0)){notice(root,'先點燃熱源，再開始受熱觀察。');return;}clock.step();}};
 function reset(){added=second=false;heat=false;root.querySelector('.heat-check').checked=false;setDose(dose);setPartner(partner);clock.reset();renderSamples();draw();notice(root,'先準備用量，再把材料放入器材。');}
 function setup(){
  two.hidden=id==='hydrate';root.querySelector('.partner-field').hidden=id==='hydrate';root.querySelector('.heat-line').hidden=!heated();
  root.querySelector('label[for="lab-dose"]').innerHTML=names[id][0]+' <span>g</span>';root.querySelector('label[for="lab-partner"]').innerHTML=names[id][1]+' <span>g</span>';
  root.querySelector('.apparatus-viewport').dataset.experiment=id;root.querySelector('.transfer-art').innerHTML=materialIcon('solution','');
 }
 root.querySelector('.reset').onclick=reset;
 root.querySelector('.lab-select').onchange=e=>{id=e.target.value;[dose,partner]=defaults[id];setup();reset();};
 setup();reset();showRecords();
 return{reset(){completed.clear();records=[];ctx.data.labDone=[];ctx.data.labRecords=[];reset();showRecords();}};
}


export function mountMass(root,ctx){
 let soda=4.2,acid=6,p=0,closed=false,collect=true,added=false,running=false,records=ctx.data.massRecords||[];
 root.innerHTML=ExplorationWorkbench(
 '<div class="workbench-caption"><span class="bench-dot"></span><b>質量守恆實驗台</b><span>小杯、瓶子與集氣裝置都算在秤盤內</span></div><div class="apparatus-viewport mass-viewport"><div class="mass-art"></div><div class="drop-zone mass-drop" tabindex="0" role="button" aria-label="小蘇打投入區"><span>把小杯放進瓶內</span></div><button class="sample-token soda-token" aria-label="拿取秤盤上的小蘇打小杯">'+materialIcon('cup','NaHCO3')+'<span class="soda-label">小蘇打小杯<br><b class="soda-dose">4.2 g</b></span></button><button class="apparatus-action mix-action" data-run>傾倒小杯，開始混合</button><button class="apparatus-action seal-action" aria-pressed="false">裝上密閉裝置</button></div><p class="bench-instruction">① 拿起秤盤上的小杯 → ② 放入瓶內，選擇是否封口 → ③ 傾倒混合</p>',
 '<div class="panel-eyebrow">只改一個條件來比較</div><h3>氣體會離開秤盤嗎？</h3><div class="segmented" role="group" aria-label="瓶口和收氣方式"><button data-system="open" aria-pressed="true">開放：不封口</button><button data-system="closed" aria-pressed="false">密閉：封口收氣</button></div><label class="check-line"><input class="collect" type="checkbox" checked> 接好裝置，把氣體全部收住</label>'+numberField('mass-soda','小蘇打',soda,0,16.8,.1,'g')+numberField('mass-acid','醋酸（不含水）',acid,0,12,.1,'g')+'<p class="small">醋酸的克數不包含水。水固定 100 g，空器材共 120 g；小杯還沒倒入時，也在秤盤上。</p><div class="mass-workflow"></div><div class="activity-status" role="status"></div><div class="button-row"><button class="primary run" data-run>傾倒小杯，混合反應</button><button class="secondary pause">暫停觀察</button><button class="secondary step">前進一格</button></div><button class="text-button reset">清空器材，保留用量</button><progress max="1" value="0" aria-label="質量守恆實驗進度"></progress><div class="mass-readout"></div>',
 '為了看清規律，模擬先不計蒸發、氣體溶入水裡和測量誤差。氣袋的大小只用來表示有氣體。');
 root.insertAdjacentHTML('beforeend','<div class="observation-panel"><div class="observation-heading"><h3>追蹤每一克的去向</h3><button class="secondary paired-trial">用量不變，換封口方式重做</button></div><div class="mass-graph"></div><div class="pair-feedback" role="status"></div><div class="mass-records"></div><details><summary>沒有氣體的沉澱反應，也守恆嗎？</summary><p>5.30 g Na₂CO₃、5.55 g CaCl₂ 與合計 100 g 水。</p><button class="secondary precip-demo">比較沉澱反應前後</button><div class="precip-result" role="status"></div></details></div>');
 root.querySelector('.model-column').append(root.querySelector('.mass-readout'));
 const state=()=>conservation({soda,acid,water:100,closed,collect,progress:p});
 function draw(){
  const r=state();root.querySelector('.mass-art').innerHTML=massArt(r,{closed,collect,progress:p,added});
  root.querySelector('progress').value=p;root.querySelector('.scene').classList.toggle('is-running',running);
  root.querySelector('.soda-token').disabled=added||running;root.querySelector('.soda-token').classList.toggle('loaded',added);root.querySelector('.soda-dose').textContent=format(soda)+' g';
  root.querySelector('.mass-drop').hidden=added;root.querySelector('.mix-action').hidden=!added||p===1;root.querySelector('.mix-action').disabled=running;
  root.querySelector('.seal-action').textContent=closed?'移開瓶塞，改為開放':'裝上密閉裝置';root.querySelector('.seal-action').setAttribute('aria-pressed',String(closed));root.querySelector('.seal-action').disabled=running;
  root.querySelector('.pause').disabled=!running;root.querySelector('.run').disabled=running||!added||r.extent===0||!!root.querySelector('input:invalid');root.querySelector('.step').disabled=!added||r.extent===0||running||!!root.querySelector('input:invalid');
  root.querySelector('.run').textContent=p===1?'重看同樣條件':p>0?'繼續觀察':'傾倒小杯，混合反應';
  root.querySelector('.mass-workflow').innerHTML=WorkflowSteps(['放入小杯','封口或開放','傾倒並量測'],p>=1?3:p>0?2:added?1:0);
  root.querySelector('.mass-readout').innerHTML=metric('反應前',format(r.initial),'g')+metric('現在的天平',format(r.reading),'g')+metric('跑掉的氣體',format(r.escaped),'g')+(p>0?'<p class="small">生成 CO₂ '+format(r.co2)+' g<br>剩餘小蘇打 '+format(r.remaining[0].mass)+' g ／ 醋酸 '+format(r.remaining[1].mass)+' g</p>':'');
  root.querySelector('.mass-graph').innerHTML=massTrace(r.initial,r.reading,p);
  root.querySelectorAll('input,[data-system],.paired-trial').forEach(x=>x.disabled=running);root.querySelector('.collect').disabled=running||!closed;
  if(!added)guideStep(root,'先把小蘇打小杯放進瓶子','拖動秤盤上的小杯，放到瓶內虛線區；點小杯也可以。','.soda-token');
  else if(r.extent===0)guideStep(root,'先確認兩種材料都有放','小蘇打或醋酸是 0 g 時，不會產生二氧化碳。',soda<=0?'#mass-soda':'#mass-acid');
  else if(p>=1)guideStep(root,'反應完成，換封口方式比較','按下方「用量不變，換封口方式重做」，保留同樣材料再試一次。','.paired-trial');
  else if(running)guideStep(root,'注意天平：氣體跑掉了嗎？','看下方的三個讀數；想慢慢看，可以暫停。','.pause');
  else if(p>0)guideStep(root,'觀察已暫停','按「繼續觀察」或「前進一格」，讀數會接著改變。','.run');
  else guideStep(root,closed&&collect?'已封口收氣，接著傾倒小杯':closed?'收氣裝置沒接好，氣體仍會跑掉':'現在不封口，接著傾倒小杯',closed&&!collect?'勾選「接好裝置」，或保持漏氣，觀察會有什麼差別。':'倒出小蘇打後才會開始反應。也可以先換封口方式。',closed&&!collect?'.collect':'.mix-action');
 }
 function record(){
  root.querySelector('.mass-records').innerHTML=records.length?'<table><thead><tr><th>條件</th><th>小蘇打／醋酸</th><th>反應前</th><th>反應後</th><th>跑掉的氣體</th></tr></thead><tbody>'+records.map(r=>'<tr><td>'+(r.closed?'完整密閉':'開放')+'</td><td>'+format(r.soda)+' / '+format(r.acid)+' g</td><td>'+format(r.initial)+' g</td><td>'+format(r.reading)+' g</td><td>'+format(r.escaped)+' g</td></tr>').join('')+'</tbody></table>':'<p class="empty-record">先做一輪，再按「用量不變，換封口方式重做」，只改變封口條件。</p>';
  const pair=matchedMassPair(records);root.querySelector('.pair-feedback').textContent=pair?'✓ 相同材料用量的對照完成：開放時跑掉的 '+format(pair.open.escaped)+' g 氣體，在密閉時沒有跑掉，仍然一起被秤到。':'用相同小蘇打與醋酸用量，完成一次開放與一次完整密閉，才是公平的比較。';
 }
 function finish(){
  const r=state();if(r.extent<=0)return;
  records.push({soda,acid,closed:closed&&collect,initial:r.initial,reading:r.reading,escaped:r.escaped});records=records.slice(-10);ctx.data.massRecords=records;ctx.save();record();
  notice(root,(closed&&collect?'氣體沒有跑掉，還在裝置裡一起被秤到。':'天平少掉的質量，正好是離開秤盤的 CO₂。')+'保持用量，換一種封口條件驗證。');
  if(matchedMassPair(records))ctx.mark();
 }
 const clock=reactionClock((v,run)=>{p=v;running=run;draw();},finish);
 const setSoda=bindNumber(root,'mass-soda',v=>{soda=v;clock.reset();notice(root,'用量已改好；原有紀錄保留，可開始新一輪。');}),setAcid=bindNumber(root,'mass-acid',v=>{acid=v;clock.reset();notice(root,'醋酸用量已改變，這是新的一輪實驗。');});
 function add(){if(!ctx.predict()||running)return;added=true;draw();notice(root,closed?'小杯已放入；封口與收集裝置依設定就緒。傾倒小杯，讓材料接觸。':'小杯暫時隔開兩種材料；可先封口，再傾倒開始反應。');}
 makeDraggable(root.querySelector('.soda-token'),root.querySelector('.mass-drop'),add,root.querySelector('.activity-status'));
 root.querySelector('.mass-drop').onclick=add;
 root.querySelector('.mass-drop').onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();add();}};
 function begin(step=false){
  if(!ctx.predict()||root.querySelector('input:invalid'))return;
  if(!added){notice(root,'先把秤盤上的小蘇打小杯放進反應瓶。');return;}
  if(state().extent<=0){notice(root,'用量為 0 時沒有反應產物，請先調整材料。');return;}
  if(step)clock.step();else clock.start();
 }
 function reset(){added=false;setSoda(soda);setAcid(acid);clock.reset();draw();notice(root,'先把小杯放進瓶內，再比較開放與完整密閉。');}
 function system(value){
  if(running)return;
  if(p>0)reset();
  closed=value;root.querySelectorAll('[data-system]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.system==='closed')===closed)));draw();
  notice(root,closed?'密閉：封好瓶口、接好收氣裝置，氣體就能留下來一起秤。':'開放：瓶口沒有封住，氣體可以跑出去。');
 }
 root.querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>system(b.dataset.system==='closed'));
 root.querySelector('.seal-action').onclick=()=>system(!closed);
 root.querySelector('.paired-trial').onclick=()=>{const next=!closed;reset();system(next);notice(root,'已保留相同用量。重新放入小杯，換一種封口方式再做一次。');};
 root.querySelector('.collect').onchange=e=>{collect=e.target.checked;clock.reset();notice(root,closed&&!collect?'接頭未接妥，氣體仍可離開；此時不是完整密閉。':'收集條件已更新，可以重新反應。');};
 root.querySelector('.run').onclick=()=>begin();root.querySelector('.mix-action').onclick=()=>begin();root.querySelector('.step').onclick=()=>begin(true);
 root.querySelector('.pause').onclick=()=>{clock.pause();notice(root,'觀察時間已暫停，天平讀數與反應進度一起停住。');};root.querySelector('.reset').onclick=reset;
 root.querySelector('.precip-demo').onclick=()=>{const r=react('precipitate',[5.3,5.55]);root.querySelector('.precip-result').innerHTML='<p>本例兩種溶質恰好完全反應。消耗的反應物質量相加＝形成的生成物質量相加。</p><p>生成 '+format(r.products[1].mass)+' g CaCO₃ 與 '+format(r.products[0].mass)+' g NaCl；原有水仍是 100 g。</p><p class="formula-line">反應前 110.85 g ＝ 反應後 '+format(100+r.outputMass)+' g</p>';};
 reset();record();return{reset(){records=[];ctx.data.massRecords=[];soda=4.2;acid=6;closed=false;collect=true;root.querySelector('.collect').checked=true;reset();system(false);record();}};
}

