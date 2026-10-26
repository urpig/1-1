import { prepareStudio } from './studio.js';
import { sameLabRun, uniqueLabRecords } from './lab-records.js';
import { labMassComparison } from './lab-mass.js';
import { reactions, react, conservation, format, equationHTML, formulaHTML } from './core.js';
import { laboratoryArt, massArt } from './art.js';
import { materialIcon } from './apparatus.js';
import { ExplorationWorkbench, numberField, bindNumber, metric, makeDraggable, reactionClock, notice, WorkflowSteps, massTrace, matchedMassPair, guideStep } from './components.js';

export function mountLab(root,ctx){
 let id='magnesium',dose=2.4,partner=3.2,added=false,second=false,p=0,running=false,heat=false,capOff=true;
 let completed=new Set(ctx.data.labDone||[]),records=uniqueLabRecords(ctx.data.labRecords||[]);
 if(records.length!==(ctx.data.labRecords||[]).length){ctx.data.labRecords=records;ctx.save();}
 const names={magnesium:['鎂帶','可參與反應的氧氣'],hydrate:['五水硫酸銅',''],precipitate:['碳酸鈉溶液中的溶質','氯化鈣溶液中的溶質'],limestone:['碳酸鈣','鹽酸中的 HCl']};
 const defaults={magnesium:[2.4,3.2],hydrate:[5,0],precipitate:[5.3,5.55],limestone:[5,7.3]};
 root.innerHTML=ExplorationWorkbench(
  '<div class="workbench-caption"><span class="bench-dot"></span><b>材料準備台</b><span>拖到器材上，也可點一下放入</span></div><div class="apparatus-viewport"><div class="lab-art"></div><div class="drop-zone lab-drop" tabindex="0" role="button" aria-label="反應區，將已選材料放入"><span>放到這裡</span></div><button class="bench-ribbon" type="button" aria-label="用坩堝鉗夾取桌上的鎂帶"><svg viewBox="0 0 120 58" aria-hidden="true"><ellipse cx="55" cy="41" rx="43" ry="5" fill="#657b6024"/><path d="M14 35l28-12 20 11 35-13" fill="none" stroke="#849b9e" stroke-width="9" stroke-linejoin="round"/><path d="M14 32l28-12 20 11 35-13" fill="none" stroke="#f5fcfa" stroke-width="3" stroke-linejoin="round"/><text x="55" y="57" text-anchor="middle" fill="#56705b" font-size="11">鎂帶</text></svg></button><button class="apparatus-action heat-action" aria-label="操作酒精燈">點燃熱源</button><div class="transfer-art" aria-hidden="true"></div></div><div class="sample-rack"><button class="sample-token sample-one" aria-label="放入第一種材料"></button><button class="sample-token sample-two" aria-label="放入第二種材料"></button></div>',
  '<div class="panel-eyebrow">實驗設計</div><h3>先選材料，再看變化</h3><label class="select-label">實驗項目<select class="lab-select"><option value="magnesium">A · 鎂的燃燒</option><option value="hydrate">B · 結晶水的消失</option><option value="precipitate">C · 神祕白色沉澱</option><option value="limestone">D · 冒泡的石頭</option></select></label>'+numberField('lab-dose','第一種材料質量',dose,0,12,.1,'g')+'<div class="partner-field">'+numberField('lab-partner','第二種材料質量',partner,0,15,.05,'g')+'</div><label class="check-line heat-line"><input type="checkbox" class="heat-check"> 提供加熱條件</label><div class="lab-workflow"></div><div class="activity-status" role="status" aria-live="polite"></div><div class="button-row"><button class="primary run" data-run>點燃熱源</button><button class="secondary pause">暫停觀察</button></div><button class="text-button reset">清空器材，保留用量</button><progress class="reaction-progress" max="1" value="0" aria-label="反應進度"></progress><div class="lab-readout"></div><a class="text-button weight-jump" href="#lab-mass-comparison">查看重量對照 ↓</a><div class="lab-done"></div>',
  '畫面把變化加快，方便觀察。溶液的用量只算溶在水裡的物質（溶質），不含水；不要用畫面上的液面高度算體積。');
 root.insertAdjacentHTML('beforeend','<div class="observation-panel"><div class="observation-heading"><h3>我的實驗紀錄</h3><span>換一組用量，讓證據可以比較</span></div><div class="lab-records"></div></div>');
 root.querySelector('.model-column').append(root.querySelector('.lab-readout'));
 const art=root.querySelector('.lab-art'),drop=root.querySelector('.lab-drop'),one=root.querySelector('.sample-one'),two=root.querySelector('.sample-two'),status=root.querySelector('.activity-status');
 const heated=()=>['magnesium','hydrate'].includes(id);
 const ready=()=>added&&(second||id==='hydrate'||id==='magnesium');
 const result=()=>react(id,id==='hydrate'?[dose]:[dose,partner],p);
 function renderSamples(){
  const types={magnesium:['ribbon','gas'],hydrate:['crystal',''],precipitate:['solution','solution'],limestone:['stone','solution']}[id];
  [one,two].forEach((button,i)=>{button.innerHTML=materialIcon(types[i],reactions[id].left[i])+'<span class="material-description"><b>'+names[id][i]+'</b><span>'+formulaHTML(reactions[id].left[i]||'')+' · <strong>'+format(i?partner:dose)+' g</strong></span><small>拿起並放入器材</small></span><span class="material-check" aria-hidden="true">✓ 已放入</span>';});
 }
 function draw(){
  const r=result(),prod=r.products.find(x=>x.formula===(id==='limestone'?'CO2':id==='precipitate'?'CaCO3':id==='hydrate'?'CuSO4':'MgO')).mass;
  art.innerHTML=laboratoryArt(id,{progress:p,amount:dose,product:prod,added,second,running,heat,capOff,conversion:dose>0?1-r.remaining[0].mass/dose:0,remaining:r.remaining[0].mass});
  root.querySelector('.reaction-progress').value=p;root.querySelector('.scene').classList.toggle('is-running',running);
  root.querySelector('.lab-readout').innerHTML='<div class="mass-observation-progress"><span>觀察進度</span><strong>'+Math.round(p*100)+'%</strong></div><div class="equation">'+equationHTML(id)+(id==='precipitate'?'↓':id==='limestone'?'↑':'')+'</div>'+labMassComparison(id,id==='hydrate'?[dose]:[dose,partner],r,p);
  one.classList.toggle('loaded',added);two.classList.toggle('loaded',second);one.disabled=added||running;two.disabled=second||running;
  const benchRibbon=root.querySelector('.bench-ribbon');benchRibbon.hidden=id!=='magnesium'||added;benchRibbon.disabled=running;
  drop.hidden=ready();root.querySelector('.pause').disabled=!running;
  root.querySelector('.run').disabled=running||!ready()||r.extent===0||!!root.querySelector('input:invalid');
  root.querySelector('.run').textContent=p===1?'以同樣用量重做':p>0?'繼續觀察':heated()&&!heat&&(id==='hydrate'||p===0)?(id==='magnesium'?'點燃酒精燈':'點燃熱源'):'開始觀察';
  root.querySelector('.heat-action').hidden=!heated()||(id==='magnesium'&&(!added||p>=1&&!heat));
  root.querySelector('.heat-action').textContent=id==='magnesium'?(heat?'以燈帽蓋熄':'點燃酒精燈'):(heat?'移開熱源':'點燃熱源');
  root.querySelector('.heat-action').disabled=id==='magnesium'&&!added;
  root.querySelector('.heat-action').setAttribute('aria-label',id==='magnesium'?(heat?'以燈帽蓋熄酒精燈':'點燃酒精燈'):'操作酒精燈');
  root.querySelector('.heat-action').setAttribute('aria-pressed',String(heat));
  root.querySelector('.lab-done').textContent='已觀察 '+completed.size+' / 4 種反應';
  root.querySelector('.lab-workflow').innerHTML=id==='magnesium'?WorkflowSteps(['夾取鎂帶','點燃加熱','收集產物','蓋熄燈火'],p>=1?heat?3:4:added?1:0):WorkflowSteps(['準備材料',heated()?'加熱觀察':'接觸反應','記錄證據'],p>=1?3:p>0?2:ready()?1:0);
  root.querySelectorAll('input[type=number],input[type=range]').forEach(x=>x.disabled=running);
  if(!added&&id==='magnesium')guideStep(root,'夾取桌上的鎂帶','點桌上的鎂帶，讓坩堝鉗夾起；也可以把鎂帶拖到上方鉗口。','.bench-ribbon');
  else if(!added)guideStep(root,'先放入'+names[id][0],'拖到器材上的虛線區，或直接點材料。','.sample-one');
  else if(!ready())guideStep(root,'再放入'+names[id][1],'兩種材料都放好，才能開始觀察。','.sample-two');
  else if(r.extent===0)guideStep(root,'先增加材料用量','有一種材料是 0 g，現在不會產生新物質。',dose<=0?'#lab-dose':'#lab-partner');
  else if(p>=1&&id==='magnesium'&&heat)guideStep(root,'反應完成，先蓋熄酒精燈','白色氧化鎂已收到瓷皿中。以燈帽蓋熄火焰，再比較下方重量。','.heat-action');
  else if(p>=1)guideStep(root,'這次反應完成了','下方已記下產物。可以換用量比較，或選另一個實驗。','.lab-select');
  else if(running)guideStep(root,'反應中：看看材料和讀數怎麼變','想看清楚某一刻，可以按「暫停觀察」。','.pause');
  else if(heated()&&!heat&&(id==='hydrate'||p===0))guideStep(root,'材料放好了，接著加熱',id==='magnesium'?'點下方「點燃酒精燈」，讓夾住的鎂帶接近外焰。':'點器材旁的「點燃熱源」。','.heat-action');
  else guideStep(root,p>0?'已暫停，慢慢看清每一步':'材料放好了，開始觀察','按「繼續觀察」，接著觀察材料與讀數的變化。','.run');
 }
 function showRecords(){root.querySelector('.lab-records').innerHTML=records.length?'<table><thead><tr><th>實驗</th><th>投入</th><th>觀察到的證據</th><th>產物</th></tr></thead><tbody>'+records.map(x=>'<tr><td>'+reactions[x.id].name+'</td><td>'+format(x.dose)+' g'+(x.id==='hydrate'?'':' / '+format(x.partner)+' g')+'</td><td>'+x.observation+'</td><td>'+x.products.map(y=>formulaHTML(y.formula)+' '+format(y.mass)+' g').join('<br>')+'</td></tr>').join('')+'</tbody></table>':'<p class="empty-record">還沒有紀錄。完成一輪反應，這裡就會留下用量、現象與產物。</p>';}
 function finish(){
  if(result().extent===0)return;
  completed.add(id);
  const observation={magnesium:'白光、放熱，瓷皿留下白色 MgO',hydrate:'藍色晶體轉白，失去結晶水',precipitate:'透明溶液變混濁，生成白色 CaCO₃',limestone:'生成無色 CO₂；檢查是否有剩餘石灰石'}[id];
  const newRecord={id,dose,partner,observation,products:result().products};
  const repeated=records.some(record=>sameLabRun(record,newRecord));
  if(!repeated)records=[...records,newRecord].slice(-8);
  ctx.data.labDone=[...completed];ctx.data.labRecords=records;ctx.save();showRecords();draw();
  notice(root,observation+(repeated?'。用量與產物相同，沿用原有紀錄。':'。已留下新紀錄，改變用量再做一次比較。'));if(completed.size===4)ctx.mark();
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
 function begin(){if(!valid())return;if(id==='magnesium'&&p>=1){heat=false;capOff=true;root.querySelector('.heat-check').checked=false;clock.reset();}if(heated()&&!heat&&(id==='hydrate'||p===0)){heat=true;if(id==='magnesium')capOff=true;root.querySelector('.heat-check').checked=true;}clock.start();notice(root,heated()?'留意材料的顏色、白光與產物；可以暫停觀察。':'兩種材料接觸後開始反應，留意杯內變化與右側讀數。');}
 function add(which){
  if(!ctx.predict()||running)return;
  if(which===1){added=true;if(id==='magnesium')second=true;}else second=true;
  draw();notice(root,ready()?(id==='magnesium'?'鎂帶已用坩堝鉗夾好；點燃下方的酒精燈開始加熱。':heated()?'材料已放好，點器材旁的「點燃熱源」。':'材料接觸，開始觀察變化。'):'已放入一種材料，再放入另一種。');
  if(ready()&&(!heated()||heat)&&result().extent>0){root.querySelector('.apparatus-viewport').classList.remove('pouring');void root.offsetWidth;root.querySelector('.apparatus-viewport').classList.add('pouring');begin();}
 }
 makeDraggable(root.querySelector('.bench-ribbon'),drop,()=>add(1),status);
 makeDraggable(one,drop,()=>add(1),status);makeDraggable(two,drop,()=>add(2),status);
 drop.onclick=()=>add(added?2:1);
 drop.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();add(added?2:1);}};
 function toggleHeat(){
  if(!ctx.predict())return;
  heat=!heat;if(id==='magnesium')capOff=heat;root.querySelector('.heat-check').checked=heat;
  if(heat&&ready()&&result().extent>0)begin();
  else if(!heat&&id==='hydrate'){clock.pause();notice(root,'移開熱源後先暫停這段受熱過程；重新加熱可繼續。');}
  else if(!heat&&id==='magnesium'&&p>0&&p<1)notice(root,'已用燈帽蓋熄酒精燈。鎂點燃後仍能與空氣中的氧氣繼續反應。');
  else notice(root,id==='magnesium'?(heat?'酒精燈已點燃，讓鎂帶在火焰上方加熱。':'酒精燈已用燈帽蓋熄。'):(heat?'加熱已準備好，接著準備材料。':'熱源已移開。'));
  draw();
 }
 root.querySelector('.heat-action').onclick=toggleHeat;
 root.querySelector('.heat-check').onchange=e=>{const desired=e.target.checked;e.target.checked=heat;if(desired!==heat)toggleHeat();};
 root.querySelector('.run').onclick=begin;root.querySelector('.pause').onclick=()=>{clock.pause();notice(root,'已暫停觀察時間。按「繼續觀察」即可接著播放。');};
 function reset(){added=second=false;heat=false;capOff=true;root.querySelector('.heat-check').checked=false;setDose(dose);setPartner(partner);clock.reset();renderSamples();draw();notice(root,id==='magnesium'?'點桌上的鎂帶，用坩堝鉗夾起後再點火。':'先準備用量，再把材料放入器材。');}
 function setup(){
  root.querySelector('.sample-rack').hidden=id==='magnesium';
  root.querySelector('.sample-rack').classList.toggle('single-material',id==='magnesium'||id==='hydrate');
  two.hidden=id==='hydrate'||id==='magnesium';root.querySelector('.partner-field').hidden=id==='hydrate';root.querySelector('.heat-line').hidden=!heated();
  root.querySelector('label[for="lab-dose"]').innerHTML=names[id][0]+' <span>g</span>';root.querySelector('label[for="lab-partner"]').innerHTML=names[id][1]+' <span>g</span>';
  root.querySelector('.heat-line').hidden=id!=='hydrate';
  root.querySelector('.model-note').textContent=id==='magnesium'?'氧氣由空氣提供；氧氣克數供化學計量使用，未模擬實際空氣流量。實際操作須戴護目鏡，勿直視強光。':'畫面把變化加快，方便觀察。溶液的用量只計溶質，不含水。';
  root.querySelector('.apparatus-viewport').dataset.experiment=id;root.querySelector('.transfer-art').innerHTML=materialIcon('solution','');
 }
 root.querySelector('.reset').onclick=reset;
 root.querySelector('.lab-select').onchange=e=>{id=e.target.value;[dose,partner]=defaults[id];setup();reset();};
 setup();reset();showRecords();
 return{reset(){completed.clear();records=[];ctx.data.labDone=[];ctx.data.labRecords=[];reset();showRecords();}};
}


export function mountMass(root,ctx){
 root.classList.add('mass-studio');
 let soda=4.2,acid=6,p=0,closed=false,collect=false,added=false,running=false,baseline=false,records=ctx.data.massRecords||[];
 root.innerHTML=ExplorationWorkbench(
 '<div class="workbench-caption"><span class="bench-dot"></span><b>質量守恆 · 實驗操作台</b><span>準備 → 秤量 → 混合 → 比較</span></div><div class="apparatus-viewport mass-viewport"><div class="mass-art"></div><div class="drop-zone mass-drop" tabindex="0" role="button" aria-label="把小蘇打小杯放入反應瓶"><span>放入瓶內</span></div><button class="sample-token soda-token" aria-label="拿取秤盤上的小蘇打小杯">'+materialIcon('cup','NaHCO3')+'<span class="soda-dose">4.2 g</span></button><button class="mass-tool seal-action" aria-pressed="false">裝上瓶塞</button><button class="mass-tool connect-action">接上集氣管</button><button class="mass-tool baseline-action" data-run>記錄反應前讀數</button><button class="mass-tool mix-action" data-run>傾斜反應瓶，混合</button></div><p class="bench-instruction">直接點選台上的小杯與器材；小杯也可以拖入反應瓶。先秤量，後混合。</p>',
 '<div class="mass-settings"><span class="panel-eyebrow">01 / 準備相同的材料</span><h3>只改變封口方式</h3><div class="segmented" role="group" aria-label="實驗裝置"><button data-system="open" aria-pressed="true">開放裝置</button><button data-system="closed" aria-pressed="false">密閉裝置</button></div>'+numberField('mass-soda','小蘇打',soda,0,16.8,.1,'g')+numberField('mass-acid','醋酸（不含水）',acid,0,12,.1,'g')+'<p class="small">水固定 100 g，空器材合計 120 g。未使用的瓶塞與集氣裝置也留在秤盤上。</p></div><div class="mass-procedure"><span class="panel-eyebrow">02 / 依序完成操作</span><div class="mass-workflow"></div><div class="activity-status" role="status"></div><div class="mass-action-list"><button class="secondary load-cup">① 放入小蘇打小杯</button><button class="secondary prepare-connection">② 接妥密閉集氣管</button><button class="secondary weigh" data-run>③ 記錄反應前質量</button><button class="primary run" data-run>④ 傾斜混合，放回秤盤</button></div><div class="button-row"><button class="secondary pause">暫停觀察</button><button class="text-button reset">重新準備這組材料</button></div><progress max="1" value="0" aria-label="質量守恆實驗進度"></progress></div>',
 '教學模擬：傾斜混合時先不讀值，放回秤盤後再觀察。忽略蒸發、氣體溶解、浮力與測量誤差；集氣袋大小與反應速度不按實際比例。');
 root.querySelector('.workbench').classList.add('mass-workbench');
 root.querySelector('.model-column').insertAdjacentHTML('beforeend','<div class="mass-readout" aria-label="反應前後的質量對照"></div>');
 root.insertAdjacentHTML('beforeend','<div class="observation-panel"><div class="observation-heading"><div><span class="eyebrow">實驗紀錄 / 只改變一個條件</span><h3>氣體的去向，解釋了天平的變化</h3></div><button class="secondary paired-trial">用量不變，換封口方式重做</button></div><div class="pair-comparison"></div><details class="mass-chart-details"><summary>查看這一輪的質量變化圖</summary><div class="mass-graph"></div></details><div class="pair-feedback" role="status"></div><div class="mass-records"></div><details><summary>沒有氣體的沉澱反應，也守恆嗎？</summary><p>5.30 g Na₂CO₃、5.55 g CaCl₂ 與合計 100 g 水。</p><button class="secondary precip-demo">比較沉澱反應前後</button><div class="precip-result" role="status"></div></details></div>');
 prepareStudio(root,{number:'05',title:'質量守恆實驗室',description:'先秤量，再混合。追蹤氣體，解開天平的變化。'},ctx);
 const scene=root.querySelector('.scene'),modeBar=document.createElement('div');modeBar.className='lab-mode-bar';modeBar.innerHTML='<div><span class="studio-eyebrow">這一輪的裝置</span><b>氣體會去哪裡？</b></div>';modeBar.append(root.querySelector('.segmented'));scene.querySelector('.workbench-caption').replaceWith(modeBar);modeBar.after(root.querySelector('.mass-workflow'));
 scene.querySelector('.bench-instruction').outerHTML='<div class="lab-command"><div class="lab-command-copy" aria-live="polite"><span class="studio-eyebrow lab-phase"></span><b class="lab-next-title"></b><p class="lab-next-detail"></p></div><button class="primary lab-next" data-run></button></div>';
 const settings=root.querySelector('.mass-settings'),settingsPanel=document.createElement('details');settingsPanel.className='material-settings';settingsPanel.innerHTML='<summary><span>調整材料用量</span><small class="material-dose-summary"></small></summary>';settings.before(settingsPanel);settingsPanel.append(settings);
 const manual=root.querySelector('.mass-action-list'),manualPanel=document.createElement('details');manualPanel.className='manual-actions';manualPanel.innerHTML='<summary>查看完整操作清單</summary>';manual.before(manualPanel);manualPanel.append(manual);root.querySelector('.mass-procedure>.panel-eyebrow').textContent='操作記錄與重設';
 const state=()=>conservation({soda,acid,water:100,closed,collect,progress:p});
 const valid=()=>!root.querySelector('input:invalid');
 function draw(){
  const r=state(),ready=added&&(!closed||collect)&&valid(),finished=p>=1,mixing=p>0&&p<.18;
  root.querySelector('.mass-art').innerHTML=massArt(r,{closed:closed&&added,collect,progress:p,added,baseline});
  root.querySelector('progress').value=p;root.querySelector('.scene').classList.toggle('is-running',running);
  root.querySelector('.soda-token').hidden=added;root.querySelector('.soda-token').disabled=running;root.querySelector('.soda-dose').textContent=format(soda)+' g';root.querySelector('.mass-drop').hidden=added;
  root.querySelector('.seal-action').textContent=closed?'取下瓶塞':'裝上瓶塞';root.querySelector('.seal-action').setAttribute('aria-pressed',String(closed));root.querySelector('.seal-action').disabled=running||p>0;
  root.querySelector('.connect-action').hidden=!closed||collect;root.querySelector('.connect-action').disabled=running||!added;
  root.querySelector('.baseline-action').hidden=baseline;root.querySelector('.baseline-action').disabled=!ready||p>0;
  root.querySelector('.mix-action').hidden=!baseline||finished;root.querySelector('.mix-action').disabled=running||r.extent===0;root.querySelector('.mix-action').textContent=p>0?'繼續觀察':'傾斜反應瓶，混合';
  root.querySelector('.load-cup').disabled=added||running;root.querySelector('.load-cup').textContent=added?'✓ 小杯已放入':'① 放入小蘇打小杯';
  root.querySelector('.prepare-connection').hidden=!closed;root.querySelector('.prepare-connection').disabled=!added||collect||running;root.querySelector('.prepare-connection').textContent=collect?'✓ 集氣管已接妥':'② 接妥密閉集氣管';
  root.querySelector('.weigh').disabled=!ready||baseline||p>0;root.querySelector('.weigh').textContent=baseline?'✓ 已記錄 '+format(r.initial)+' g':'③ 記錄反應前質量';
  root.querySelector('.run').disabled=running||!baseline||!ready||r.extent===0||finished;root.querySelector('.run').textContent=finished?'✓ 本輪實驗完成':p>0?'繼續觀察':'④ 傾斜混合，放回秤盤';
  root.querySelector('.pause').disabled=!running;
  root.querySelectorAll('input,[data-system],.paired-trial').forEach(x=>x.disabled=running);
  root.querySelectorAll('[data-system]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.system==='closed')===closed)));
  root.querySelector('.mass-workflow').innerHTML=WorkflowSteps(['準備裝置','記錄初重','混合觀察','讀取結果'],finished?3:baseline?2:ready?1:0);
  root.querySelector('.mass-readout').innerHTML='<div class="mass-notebook-heading"><b>本輪秤量紀錄</b><span>'+(closed?(collect?'密閉 · 氣體保留':'密閉 · 待接管'):'開放 · 氣體可離開')+'</span></div><div class="mass-reading-grid">'+metric('反應前整組質量',baseline?format(r.initial):'待記錄',baseline?'g':'')+metric(finished?'反應後整組質量':'目前整組質量',mixing?'量測中':format(r.reading),'g')+metric('離開秤盤的 CO₂',format(r.escaped),'g')+'</div><p class="mass-ledger-equation">'+(finished?'反應後 '+format(r.reading)+' g ＋ 離開的氣體 '+format(r.escaped)+' g ＝ 反應前 '+format(r.initial)+' g':baseline?'已記錄反應前質量；接著讓兩種材料接觸，觀察讀數。':'瓶子、材料、小杯、瓶塞、支架與集氣袋，都在這個秤盤內。')+'</p>'+(p>0?'<p class="mass-material-summary">已生成 CO₂ '+format(r.co2)+' g · 剩餘小蘇打 '+format(r.remaining[0].mass)+' g · 剩餘醋酸 '+format(r.remaining[1].mass)+' g</p>':'');
  root.querySelector('.mass-graph').innerHTML=massTrace(r.initial,r.reading,p);
  if(!added)guideStep(root,'拿取秤盤上的小蘇打小杯','點小杯或拖入反應瓶；小杯內的固體先與醋酸隔開。','.soda-token');
  else if(closed&&!collect)guideStep(root,'把集氣管接到瓶塞','點「接上集氣管」，讓生成的氣體能進入集氣袋。','.connect-action');
  else if(r.extent===0)guideStep(root,'先確認兩種材料都有加入','任一反應物為 0 g 就不會反應；調整用量後重新準備。',soda<=0?'#mass-soda':'#mass-acid');
  else if(finished)guideStep(root,'讀取結果，再做一組對照','保留相同用量，只改變封口方式，比較兩次質量。','.paired-trial');
  else if(!baseline)guideStep(root,'先記錄反應前的天平讀數','裝置準備好後，按「記錄反應前讀數」。','.baseline-action');
  else if(running)guideStep(root,mixing?'傾斜反應瓶，讓材料接觸':'反應瓶已放回，觀察天平與氣體',closed?'氣體進入集氣袋，仍然在秤盤上。':'氣體從瓶口逸出，觀察天平減少多少。','.pause');
  else guideStep(root,p>0?'觀察已暫停':'讓兩種材料接觸，開始反應',p>0?'按「繼續觀察」，反應與讀數會接續。':'傾斜瓶子倒出小杯中的粉末，再把瓶子放穩讀值。','.mix-action');
  const phase=finished?4:baseline?3:ready?2:1,next=root.querySelector('.lab-next');
  root.querySelector('.lab-phase').textContent='STEP '+String(phase).padStart(2,'0')+' / 04';
  const title=root.querySelector('.guide-title').textContent,detail=root.querySelector('.guide-detail').textContent;
  if(root.querySelector('.lab-next-title').textContent!==title)root.querySelector('.lab-next-title').textContent=title;
  if(root.querySelector('.lab-next-detail').textContent!==detail)root.querySelector('.lab-next-detail').textContent=detail;
  next.textContent=running?'Ⅱ 暫停觀察':finished?'換成'+(closed?'開放':'密閉')+'裝置再試 →':!added?'放入小蘇打小杯 →':closed&&!collect?'接妥集氣管 →':!baseline?'記錄初重 '+format(r.initial)+' g →':p>0?'繼續觀察 →':'傾斜混合，開始觀察 →';
  next.disabled=!valid()||r.extent===0;next.classList.toggle('is-observing',running);
  root.querySelector('.material-dose-summary').textContent='小蘇打 '+format(soda)+' g · 醋酸 '+format(acid)+' g';
  root.querySelector('.mass-workbench').dataset.phase=finished?'complete':running?'running':baseline?'weighed':'preparing';
 }
 function record(){
  root.querySelector('.mass-records').innerHTML=records.length?'<div class="table-scroll"><table><thead><tr><th>條件</th><th>小蘇打／醋酸</th><th>反應前</th><th>反應後</th><th>離開的氣體</th></tr></thead><tbody>'+records.map(r=>'<tr><td>'+(r.closed?'完整密閉':'開放')+'</td><td>'+format(r.soda)+' / '+format(r.acid)+' g</td><td>'+format(r.initial)+' g</td><td>'+format(r.reading)+' g</td><td>'+format(r.escaped)+' g</td></tr>').join('')+'</tbody></table></div>':'<p class="empty-record">先完成一輪實驗。相同條件與用量的結果只記錄一次。</p>';
  const pair=matchedMassPair(records);root.querySelector('.pair-comparison').innerHTML=pair?'<div class="pair-card pair-open"><span>開放裝置</span><b>'+format(pair.open.initial)+' <i>→</i> '+format(pair.open.reading)+' <small>g</small></b><p>'+format(pair.open.escaped)+' g 氣體離開秤盤</p></div><div class="pair-card pair-closed"><span>密閉裝置</span><b>'+format(pair.closed.initial)+' <i>→</i> '+format(pair.closed.reading)+' <small>g</small></b><p>氣體留在裝置內，總質量相同</p></div>':'';root.querySelector('.pair-feedback').textContent=pair?'✓ 對照完成：開放時離開的 '+format(pair.open.escaped)+' g 氣體，在密閉時仍留在裝置裡。把氣體一起算入，總質量相同。':'保持小蘇打與醋酸用量相同，比較一次開放與一次密閉結果。';
 }
 function finish(){
  const r=state();if(r.extent<=0)return;const same=records.some(x=>x.closed===closed&&Math.abs(x.soda-soda)<1e-8&&Math.abs(x.acid-acid)<1e-8);
  if(!same){records.push({soda,acid,closed,initial:r.initial,reading:r.reading,escaped:r.escaped});records=records.slice(-10);ctx.data.massRecords=records;ctx.save();}record();
  notice(root,(closed?'氣體留在裝置內，反應前後讀數相同。':'天平減少的質量等於離開的 CO₂ 質量。')+(same?'相同結果已記錄，不重複新增。':'本輪已加入實驗紀錄。'));if(matchedMassPair(records))ctx.mark();
 }
 const clock=reactionClock((value,run)=>{p=value;running=run;draw();},finish);
 const changeDose=()=>{added=false;baseline=false;clock.reset();notice(root,'用量已改變，請重新放入小杯並記錄反應前質量。');};
 const setSoda=bindNumber(root,'mass-soda',v=>{soda=v;changeDose();}),setAcid=bindNumber(root,'mass-acid',v=>{acid=v;changeDose();});
 function add(){if(!ctx.predict()||running||added||!valid())return;added=true;draw();notice(root,'小杯已放入瓶內，粉末還沒接觸醋酸。準備裝置後先秤量。');}
 makeDraggable(root.querySelector('.soda-token'),root.querySelector('.mass-drop'),add,root.querySelector('.activity-status'));root.querySelector('.load-cup').onclick=add;root.querySelector('.mass-drop').onclick=add;root.querySelector('.mass-drop').onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();add();}};
 function weigh(){if(!ctx.predict()||running||!added||!valid()||(closed&&!collect)||p>0)return;baseline=true;draw();notice(root,'已記錄反應前整組質量 '+format(state().initial)+' g。現在可以傾斜混合。');}
 function begin(){if(!ctx.predict()||!baseline||!valid()||!added||(closed&&!collect)||state().extent<=0||p>=1)return;clock.start();}
 function reset(){baseline=false;added=false;setSoda(soda);setAcid(acid);clock.reset();notice(root,'器材與用量已保留。重新放入小杯，記錄新的反應前讀數。');}
 function system(value){if(running)return;if(p>0)reset();closed=value;collect=false;baseline=false;draw();notice(root,closed?'已裝上瓶塞。放入小杯後，還要接妥集氣管。':'瓶口開放；瓶塞、管線與集氣袋仍放在秤盤上一起秤。');}
 function connect(){if(!closed||!added||running||p>0)return;collect=true;baseline=false;draw();notice(root,'集氣管已接妥，生成的氣體會留在集氣袋中。先記錄反應前質量。');}
 root.querySelector('.lab-next').onclick=()=>{if(running){clock.pause();return;}if(p>=1){root.querySelector('.paired-trial').click();return;}if(!added){add();return;}if(closed&&!collect){connect();return;}if(!baseline){weigh();return;}begin();};
 root.querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>system(b.dataset.system==='closed'));root.querySelector('.seal-action').onclick=()=>system(!closed);
 root.querySelector('.connect-action').onclick=connect;root.querySelector('.prepare-connection').onclick=connect;
 root.querySelector('.weigh').onclick=weigh;root.querySelector('.baseline-action').onclick=weigh;root.querySelector('.run').onclick=begin;root.querySelector('.mix-action').onclick=begin;
 root.querySelector('.paired-trial').onclick=()=>{const next=!closed;reset();system(next);notice(root,'保留相同用量，已換成'+(next?'密閉':'開放')+'裝置。請重新準備並秤量。');};
 root.querySelector('.pause').onclick=()=>{clock.pause();notice(root,'觀察已暫停；按「繼續觀察」接續實驗。');};root.querySelector('.reset').onclick=reset;
 root.querySelector('.precip-demo').onclick=()=>{const r=react('precipitate',[5.3,5.55]);root.querySelector('.precip-result').innerHTML='<p>生成 '+format(r.products[1].mass)+' g CaCO₃ 與 '+format(r.products[0].mass)+' g NaCl，水仍為 100 g。</p><p class="formula-line">反應前 110.85 g ＝ 反應後 '+format(100+r.outputMass)+' g</p>';};
 reset();record();return{reset(){records=[];ctx.data.massRecords=[];soda=4.2;acid=6;closed=false;collect=false;reset();record();}};
}
