import { reactionLabMarkup, reactionRecords } from './reaction-lab.js';
import { createReactionPractice, addPracticeSolution, placePracticeDropper, addPracticeDrop, PRACTICE_DROPS, bindDropperPress, createHeatingPractice, loadHeatingSample, setHeatingFlame } from './reaction-practice.js';
import { realisticReactionScene } from './reaction-scenes.js';
import { reactionClock, makeDraggable, WorkflowSteps } from './components.js';
import { prepareStudio } from './studio.js';
export const demonstrations = [
 {id:'light',title:'發光與放熱',name:'鎂帶燃燒',before:'銀白色鎂帶放在燃燒匙內，準備在酒精燈上方加熱。',during:'燃燒匙內的鎂帶燃燒，發出白光，並放出熱量。',after:'燃燒匙內留下白色氧化鎂；這是與原來鎂帶不同的物質。',equation:'2Mg + O₂ → 2MgO',action:'點火，觀察鎂帶',product:'白色氧化鎂',note:'實作時勿直視燃燒的鎂。'},
 {id:'color',title:'顏色改變',name:'含水硫酸銅受熱',before:'蒸發皿內有藍色的含水硫酸銅晶體。',during:'持續加熱，晶體逐漸失去結晶水，藍色轉淡。',after:'留下白色的無水硫酸銅，水以水蒸氣離開。',equation:'CuSO₄·5H₂O → CuSO₄ + 5H₂O',action:'加熱，觀察顏色',product:'白色無水硫酸銅',note:'水蒸氣無色；淡色軌跡只表示去向。'},
 {id:'solid',title:'生成沉澱',name:'碳酸鈉溶液＋氯化鈣溶液',before:'兩種溶液原本都透明，還沒有接觸。',during:'兩種溶液接觸後，混合處逐漸出現白色混濁。',after:'生成不溶於水的碳酸鈣，白色固體逐漸沉降。',equation:'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl',action:'混合，觀察沉澱',product:'白色碳酸鈣沉澱',note:'CaCO₃ 沉澱；NaCl 仍溶於水。'},
 {id:'gas',title:'產生氣體',name:'石灰石＋稀鹽酸',before:'燒杯內是石灰石與少量水；滴管內是稀鹽酸。',during:'酸滴到石灰石，固體表面出現持續上升的氣泡。',after:'生成的二氧化碳離開液面；石灰石逐漸減少。',equation:'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',action:'滴入，觀察氣泡',product:'二氧化碳氣體',note:'石灰石過量；氣體身分需另行檢驗。'}
];
export function phenomenonScene(id,p=0){return realisticReactionScene(id,p);}
export function reactionComparison(d,progress=1){
 return '<div class="reaction-comparison-heading"><h4>'+d.name+'：物質變成什麼了？</h4></div><div class="reaction-comparison-pair">'+[0,progress].map((p,index)=>'<figure><div class="reaction-comparison-label"><span>0'+(index+1)+'</span><b>'+(p?(progress<1?'滴入鹽酸後 · 觀察中':'反應後'):'反應前')+'</b></div>'+realisticReactionScene(d.id,p,p?'comparison-after':'comparison-before')+'<figcaption><strong>'+(p?'生成新物質：'+d.product:'原來的材料')+'</strong><p>'+(p?d.after:d.before)+'</p></figcaption></figure>').join('')+'</div>';
}

export function mountPhenomena(root,ctx){
 let selected=0,p=0,running=false,practice=createReactionPractice(),heat=createHeatingPractice(),busy=false,frame=0,animationEpoch=0;
 let pour=null,drag=null,dropper={x:583,y:221},gasPulse=0,suppressClick=false,holding=false,recordsKey=null;
 const seen=new Set(ctx.data.phenomenaSeen||[]),q=s=>root.querySelector(s),qa=s=>root.querySelectorAll(s);
 root.classList.add('phenomena-studio');root.setAttribute('data-glossary-skip','');
 root.innerHTML=reactionLabMarkup(demonstrations);
 prepareStudio(root,{number:'02',title:'化學反應觀察室'},ctx);
 const compareButton=q('.view-comparison'),nextReaction=q('.next-reaction');
 function setText(selector,text){const node=q(selector);if(node.textContent!==text)node.textContent=text;}
 function draw(){
  const d=demonstrations[selected],thermal=['light','color'].includes(d.id),manual=!thermal;
  const canCompare=p===1||(d.id==='gas'&&p>=1/PRACTICE_DROPS);
  root.dataset.reaction=d.id;root.dataset.phase=p===1?'complete':busy||running?'running':'ready';
  root.dataset.loaded=String(heat.loaded);root.dataset.heating=String(heat.lit);
  compareButton.hidden=!canCompare;
  const next=demonstrations.find(d=>!seen.has(d.id));nextReaction.hidden=!canCompare||!seen.has(d.id)||!next;nextReaction.textContent=next?'下一個：'+next.title+' →':'四種觀察已完成';
  const phase=p===1?'反應後':busy&&d.id==='solid'?'倒入中':busy||running?'反應中':p>0?(d.id==='gas'?'觀察氣泡':'已熄火'):thermal&&!heat.loaded?'等待取樣':'已備妥';
  setText('.reaction-phase',phase);setText('.reaction-name',d.name);
  const step=canCompare?3:thermal?(heat.loaded?1:0):d.id==='solid'?practice.solutions.length:practice.dropperReady?1:0;
  const steps=thermal?['取用樣本','點燃酒精燈','觀察變化']:d.id==='solid'?['加入第一種溶液','加入另一種','觀察沉澱']:['移動滴管','按住滴加','觀察氣泡'];
  const workflow=WorkflowSteps(steps,step);if(q('.reaction-workflow').innerHTML!==workflow)q('.reaction-workflow').innerHTML=workflow;
  const comparison=q('.reaction-comparison'),comparisonKey=d.id+(p===1?'-full':'-observed');
  if(canCompare&&comparison.dataset.reaction!==comparisonKey){comparison.innerHTML=reactionComparison(d,p);comparison.dataset.reaction=comparisonKey;}
  comparison.hidden=!canCompare;
  q('.reaction-art').innerHTML=realisticReactionScene(d.id,p,'stage',{...practice,heat,pour,drag,dropper,gasPulse});
  q('progress').value=p;q('progress').hidden=!thermal;
  q('progress').setAttribute('aria-label','反應進度');q('progress').setAttribute('aria-valuetext',Math.round(p*100)+'%');
  let hint='',description='';
  if(thermal){
   hint=p===1?'完成！比較材料反應前後的變化。':!heat.loaded?'從樣本架取用'+(d.id==='light'?'鎂帶，放入燃燒匙。':'含水硫酸銅，放入蒸發皿。'):running?'加熱中；再點酒精燈可熄火。':p>0?'點選酒精燈，繼續加熱。':'點選酒精燈，開始加熱。';
   description=p===1?(d.id==='light'?'銀白色鎂帶 → 白色氧化鎂':'藍色含水硫酸銅 → 白色無水硫酸銅'):p>0?d.during:'';
  }else if(d.id==='solid'){
   hint=p===1?'完成！兩種透明溶液混合後，出現白色固體。':busy?'正在倒入溶液…':running?'觀察白色沉澱，逐漸沉到杯底。':practice.solutions.length===0?'點選或拖曳兩杯溶液，加入中央燒杯。':'再加入另一種溶液。';
   description=p>0?(p===1?'生成白色碳酸鈣沉澱。':'兩種溶液接觸，出現白色混濁。'):practice.solutions.length?'只有一種溶液，仍然透明。':'';
  }else{
   hint=p===1?'滴管已空；比較反應前後，或重新實驗。':practice.dropperReady?'按住滴管膠頭，持續滴加；放開停止。':'將滴管拖到燒杯上方，也可以直接點選滴管。';
   description=p>0?'鹽酸滴到石灰石，產生二氧化碳氣泡。':'';
  }
  setText('.hands-on-hint',hint);setText('.reaction-observation',description);q('.reaction-observation').hidden=!description;
  setText('.reaction-equation',d.equation);setText('.reaction-note',d.note+(d.id==='gas'?' 12 滴僅為模擬滴管容量。':''));
  q('.reaction-science').hidden=!canCompare;
  const play=q('.demonstrate');play.hidden=manual||!heat.loaded||p===1;play.disabled=busy;play.textContent=running?'熄火，暫停加熱':p>0?'繼續加熱':'點燃酒精燈';
  const lamp=q('.lamp-grab');lamp.hidden=!thermal;lamp.disabled=!heat.loaded||p===1;lamp.style.left=(d.id==='light'?31:35)+'%';lamp.style.top=(d.id==='light'?42:51)+'%';lamp.setAttribute('aria-pressed',String(heat.lit));lamp.setAttribute('aria-label',heat.lit?'熄滅酒精燈，暫停加熱':'點燃酒精燈，開始加熱');lamp.querySelector('span').textContent=heat.lit?'點選熄火':'點選加熱';lamp.classList.toggle('next-tool',heat.loaded&&!heat.lit&&p<1);
  q('.sample-load-zone').hidden=!thermal||heat.loaded;
  q('.sample-load-zone').style.left=(d.id==='light'?32:34)+'%';q('.sample-load-zone').style.top=(d.id==='light'?27:39)+'%';
  q('.practice-controls').hidden=d.id!=='gas';
  setText('.drop-count','已滴入 '+practice.drops+' 滴');q('.squeeze-dropper').disabled=!practice.dropperReady||practice.drops>=PRACTICE_DROPS;
  q('.reaction-notes').hidden=!description&&d.id!=='gas';
  qa('[data-practice-tool]').forEach(b=>{
   const tool=b.dataset.practiceTool,isDrop=tool==='dropper';b.hidden=isDrop?d.id!=='gas':d.id!=='solid';
   b.disabled=isDrop?practice.drops>=PRACTICE_DROPS:busy||practice.solutions.includes(tool);
   if(isDrop){b.style.left=((dropper.x-19)/760*100)+'%';b.style.top=((dropper.y-179)/440*100)+'%';b.setAttribute('aria-label',practice.dropperReady?'按住滴管膠頭，連續滴加鹽酸':'拿起滴管，拖到燒杯上方，或點選定位');b.querySelector('span').textContent=practice.dropperReady?'按住連續滴加':'移到燒杯上方';}
   else {b.querySelector('span').textContent=(practice.solutions.includes(tool)?'✓ 已加入 ':'')+(tool==='sodium'?'碳酸鈉':'氯化鈣');}
  });
  q('.reaction-drop-target').hidden=!drag;
  qa('[data-demo]').forEach(b=>{const id=demonstrations[+b.dataset.demo].id;b.setAttribute('aria-pressed',String(+b.dataset.demo===selected));b.classList.toggle('has-observed',seen.has(id));b.querySelector('.sample-observed').hidden=!seen.has(id);});
  const key=[...seen].sort().join(',');if(key!==recordsKey){q('.reaction-records').innerHTML=reactionRecords(demonstrations,seen);recordsKey=key;}
 }
 function finish(){heat.lit=false;const id=demonstrations[selected].id;if(!seen.has(id)){seen.add(id);ctx.data.phenomenaSeen=[...seen];ctx.mark();}draw();}
 const clock=reactionClock((value,run)=>{p=value;running=run;if(!run)heat.lit=false;draw();},finish);
 function cancelMotion(){releaseAll();animationEpoch++;cancelAnimationFrame(frame);busy=false;pour=null;drag=null;gasPulse=0;}
 function reset(){cancelMotion();practice=createReactionPractice();heat=createHeatingPractice();dropper={x:583,y:221};q('.reaction-science').open=false;clock.reset();}
 function selectSample(index){
  if(!Number.isInteger(index)||index<0||index>=demonstrations.length)return;
  if(index!==selected){clock.pause();selected=index;reset();}
  if(['light','color'].includes(demonstrations[selected].id)&&!heat.loaded)loadHeatingSample(heat);
  draw();
 }
 function toggleHeat(){if(!['light','color'].includes(demonstrations[selected].id)||!heat.loaded||p===1)return;if(running){setHeatingFlame(heat,false);clock.pause();}else{setHeatingFlame(heat,true);running=true;clock.start();draw();}}
 function animate(duration,update,done){const epoch=++animationEpoch,start=performance.now();busy=true;function tick(now){if(epoch!==animationEpoch)return;const t=Math.min(1,(now-start)/duration);update(t);draw();if(t<1)frame=requestAnimationFrame(tick);else{busy=false;done();draw();}}frame=requestAnimationFrame(tick);}
 function addSolution(id){
  if(demonstrations[selected].id!=='solid'||busy||practice.solutions.includes(id))return;
  pour={id,t:0};animate(1000,t=>pour={id,t},()=>{pour=null;addPracticeSolution(practice,id);if(practice.solutions.length===2)clock.start();});
 }
 function positionDropper(){if(busy||practice.drops>=PRACTICE_DROPS)return;dropper={x:368,y:221};placePracticeDropper(practice,true);draw();}
 function squeeze(){
  if(demonstrations[selected].id!=='gas'||busy||!addPracticeDrop(practice))return;
  const before=p,target=practice.drops/PRACTICE_DROPS;
  animate(700,t=>{gasPulse=t;p=before+(target-before)*Math.max(0,(t-.22)/.78);},()=>{gasPulse=0;p=target;finish();if(p===1)stopHolding();else if(holding)squeeze();});
 }
 function stopHolding(){holding=false;qa('.squeeze-dropper,.dropper-grab').forEach(b=>b.setAttribute('aria-pressed','false'));}
 const releasePresses=[q('.squeeze-dropper'),q('[data-practice-tool="dropper"]')].map(button=>bindDropperPress(button,{
  enabled:()=>demonstrations[selected].id==='gas'&&practice.dropperReady,
  start:()=>{holding=true;button.setAttribute('aria-pressed','true');squeeze();},stop:stopHolding,tap:squeeze
 }));
 const releaseAll=()=>{releasePresses.forEach(release=>release());stopHolding();};
 const pauseWorkspace=()=>{releaseAll();if(running)clock.pause();};
 window.addEventListener('blur',pauseWorkspace);root.addEventListener('workspaceclose',pauseWorkspace);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseWorkspace();});
 q('.demonstrate').onclick=toggleHeat;q('.lamp-grab').onclick=toggleHeat;q('.reaction-rewind').onclick=reset;
 compareButton.onclick=()=>q('.reaction-comparison').scrollIntoView({behavior:'auto',block:'start'});
 nextReaction.onclick=()=>{const index=demonstrations.findIndex(d=>!seen.has(d.id));if(index>=0){selectSample(index);q('.observation-lab').scrollIntoView({behavior:'auto',block:'start'});q('[data-demo="'+index+'"]').focus({preventScroll:true});}};
 qa('[data-demo]').forEach(b=>makeDraggable(b,q('.reaction-interactive-scene'),()=>selectSample(+b.dataset.demo),q('.hands-on-hint')));
 function scenePoint(e){const r=q('.reaction-interactive-scene').getBoundingClientRect();return {x:(e.clientX-r.left)*760/r.width,y:(e.clientY-r.top)*440/r.height};}
 qa('[data-practice-tool]').forEach(b=>{
  const tool=b.dataset.practiceTool;
  b.onclick=()=>{if(suppressClick){suppressClick=false;return;}if(tool==='dropper'){if(!practice.dropperReady)positionDropper();}else addSolution(tool);};
  b.onpointerdown=e=>{if(e.button!==0||b.disabled||(tool==='dropper'&&practice.dropperReady))return;suppressClick=false;const at=scenePoint(e);drag={id:tool,start:at,x:at.x,y:at.y,origin:{...dropper},moved:false};b.setPointerCapture(e.pointerId);};
  b.onpointermove=e=>{if(!drag||drag.id!==tool||!b.hasPointerCapture(e.pointerId))return;const at=scenePoint(e);drag.x=at.x;drag.y=at.y;drag.moved=drag.moved||Math.hypot(at.x-drag.start.x,at.y-drag.start.y)>5;if(!drag.moved)return;if(tool==='dropper')dropper={x:Math.max(25,Math.min(735,drag.origin.x+at.x-drag.start.x)),y:Math.max(180,Math.min(380,drag.origin.y+at.y-drag.start.y))};draw();};
  b.onpointerup=e=>{if(!drag||drag.id!==tool)return;const at=scenePoint(e),moved=drag.moved;drag=null;if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId);if(!moved)return;suppressClick=true;if(tool==='dropper'){const inside=dropper.x>=292&&dropper.x<=442&&dropper.y>=175&&dropper.y<=260;placePracticeDropper(practice,inside);dropper=inside?{x:368,y:221}:{x:583,y:221};draw();}else{draw();if(at.x>=270&&at.x<=460&&at.y>=145&&at.y<=355)addSolution(tool);}setTimeout(()=>{suppressClick=false;},0);};
  b.onpointercancel=()=>{suppressClick=true;drag=null;if(tool==='dropper')dropper=practice.dropperReady?{x:368,y:221}:{x:583,y:221};draw();};
  b.onlostpointercapture=()=>{if(drag?.id===tool){suppressClick=true;drag=null;if(tool==='dropper')dropper=practice.dropperReady?{x:368,y:221}:{x:583,y:221};draw();}};
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape')releaseAll();if(e.key==='Escape'&&drag){suppressClick=true;drag=null;dropper=practice.dropperReady?{x:368,y:221}:{x:583,y:221};draw();}});
 draw();return{reset(){seen.clear();ctx.data.phenomenaSeen=[];selected=0;reset();}};
}
