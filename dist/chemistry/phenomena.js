import { createReactionPractice, addPracticeSolution, placePracticeDropper, addPracticeDrop, PRACTICE_DROPS, bindDropperPress } from './reaction-practice.js';
import { realisticReactionScene } from './reaction-scenes.js';
import { reactionClock } from './components.js';
import { prepareStudio } from './studio.js';
export const demonstrations = [
 {id:'light',title:'發光與放熱',name:'鎂帶燃燒',before:'銀白色鎂帶放在燃燒匙內，準備在酒精燈上方加熱。',during:'燃燒匙內的鎂帶燃燒，發出白光，並放出熱量。',after:'燃燒匙內留下白色氧化鎂；這是與原來鎂帶不同的物質。',equation:'2Mg + O₂ → 2MgO',action:'點火，觀察鎂帶',product:'白色氧化鎂',note:'以柔和光暈代替實際強光；真實實驗勿直視燃燒的鎂。'},
 {id:'color',title:'顏色改變',name:'含水硫酸銅受熱',before:'蒸發皿內有藍色的含水硫酸銅晶體。',during:'持續加熱，晶體逐漸失去結晶水，藍色轉淡。',after:'留下白色的無水硫酸銅，水以水蒸氣離開。',equation:'CuSO₄·5H₂O → CuSO₄ + 5H₂O',action:'加熱，觀察顏色',product:'白色無水硫酸銅',note:'反應條件：加熱。以淡色軌跡標示水蒸氣去向；水蒸氣本身無色。'},
 {id:'solid',title:'生成沉澱',name:'碳酸鈉溶液＋氯化鈣溶液',before:'兩種溶液原本都透明，還沒有接觸。',during:'兩種溶液接觸後，混合處逐漸出現白色混濁。',after:'生成不溶於水的碳酸鈣，白色固體逐漸沉降。',equation:'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl',action:'混合，觀察沉澱',product:'白色碳酸鈣沉澱',note:'沉降過程經過加速。CaCO₃ 是固體，NaCl 仍溶在水中。'},
 {id:'gas',title:'產生氣體',name:'石灰石＋稀鹽酸',before:'燒杯內是石灰石與少量水；滴管內是稀鹽酸。',during:'酸滴到石灰石，固體表面出現持續上升的氣泡。',after:'生成的二氧化碳離開液面；石灰石逐漸減少。',equation:'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',action:'滴入，觀察氣泡',product:'二氧化碳氣體',note:'石灰石示意為過量，反應後仍有剩餘；氣體身分需另行檢驗。'}
];
export function phenomenonScene(id,p=0){return realisticReactionScene(id,p);}
export function reactionComparison(d){
 return '<div class="reaction-comparison-heading"><span class="studio-eyebrow">觀察完成 / 前後對照</span><h4>'+d.name+'：物質變成什麼了？</h4><p>比較材料的顏色、形態，以及新出現的物質。</p></div><div class="reaction-comparison-pair">'+[0,1].map(p=>'<figure><div class="reaction-comparison-label"><span>0'+(p+1)+'</span><b>'+(p?'反應後':'反應前')+'</b></div>'+realisticReactionScene(d.id,p,p?'comparison-after':'comparison-before')+'<figcaption><strong>'+(p?'生成新物質：'+d.product:'原來的材料')+'</strong><p>'+(p?d.after:d.before)+'</p></figcaption></figure>').join('')+'</div>';
}
export function mountPhenomena(root,ctx){
 let selected=0,p=0,running=false,practice=createReactionPractice(),busy=false,frame=0,animationEpoch=0;
 let pour=null,drag=null,dropper={x:583,y:221},gasPulse=0,suppressClick=false,holding=false;
 const seen=new Set();
 root.classList.add('phenomena-studio');root.setAttribute('data-glossary-skip','');
 root.innerHTML='<div class="phenomena-tabs" role="group" aria-label="選擇反應示範">'+demonstrations.map((d,i)=>'<button data-demo="'+i+'" aria-pressed="'+(i===0)+'"><span>0'+(i+1)+'</span><b>'+d.title+'</b><small>'+d.name+'</small></button>').join('')+'</div><div class="reaction-theater"><div class="reaction-stage"><div class="reaction-stage-head"><span>親手操作 / 觀察物質變化</span><b class="reaction-phase"></b></div><div class="reaction-interactive-scene"><div class="reaction-art"></div><div class="reaction-instruments"><div class="reaction-drop-target" aria-hidden="true">移到燒杯這裡</div><button type="button" class="reagent-grab sodium-grab" data-practice-tool="sodium" aria-label="拿取碳酸鈉溶液，點選加入或拖到燒杯"><span>碳酸鈉</span><small>點選或拖曳加入</small></button><button type="button" class="reagent-grab calcium-grab" data-practice-tool="calcium" aria-label="拿取氯化鈣溶液，點選加入或拖到燒杯"><span>氯化鈣</span><small>點選或拖曳加入</small></button><button type="button" class="dropper-grab" data-practice-tool="dropper"><span>拖曳滴管</span></button></div></div><progress max="1" value="0" aria-label="反應示範進度"></progress><p class="hands-on-hint"></p></div><aside class="reaction-notes"><span class="studio-eyebrow">觀察一個真實反應的過程</span><h3 class="reaction-name"></h3><div class="reaction-observation" role="status" aria-live="polite"></div><div class="practice-controls"><div class="solution-actions"><button type="button" data-add-solution="sodium">加入碳酸鈉溶液</button><button type="button" data-add-solution="calcium">加入氯化鈣溶液</button></div><div class="dropper-actions"><p class="drop-count"></p><button type="button" class="position-dropper">將滴管移到燒杯上方</button><button type="button" class="primary squeeze-dropper">按住連續滴加</button></div></div><div class="reaction-equation"></div><button class="primary demonstrate"></button><button class="text-button reaction-rewind">重新準備材料</button></aside></div><section class="reaction-comparison" aria-label="反應前後的物質變化對照" hidden></section><p class="reaction-note"></p><div class="evidence-caution"><b>看到變化，還要確認是否生成新物質。</b><p>水沸騰也會冒泡，卻仍是 H₂O。這些動畫重現實驗現象，並非實拍；速度與外觀經過簡化。真實實驗需由教師指導。</p></div>';
 prepareStudio(root,{number:'02',title:'化學反應觀察室',description:'加熱、加入溶液或擠壓滴管，親手觀察反應前後。'}, {predict:()=>true});
 const q=s=>root.querySelector(s),qa=s=>root.querySelectorAll(s);
 function draw(){
  const d=demonstrations[selected],manual=d.id==='solid'||d.id==='gas';
  const phase=p===1?'反應後':busy&&d.id==='solid'?'加入溶液中':busy||running?'反應中':p>0?(d.id==='gas'?'等待下一滴':'已暫停'):manual?'準備材料':'反應前';
  const comparison=q('.reaction-comparison');
  if(p===1&&comparison.dataset.reaction!==d.id){comparison.innerHTML=reactionComparison(d);comparison.dataset.reaction=d.id;}
  comparison.hidden=p!==1;
  q('.reaction-art').innerHTML=realisticReactionScene(d.id,p,'stage',manual?{...practice,pour,drag,dropper,gasPulse}:null);
  q('.reaction-phase').textContent=phase;q('progress').value=p;q('.reaction-name').textContent=d.name;
  let description=p===0?d.before:p===1?d.after:d.during;
  if(d.id==='solid'&&!running&&p===0)description=busy?'正在把溶液倒入燒杯。':practice.solutions.length===0?'先加入一種溶液，再加入另一種。兩種都加入後，觀察有沒有新物質。':'已加入'+(practice.solutions[0]==='sodium'?'碳酸鈉':'氯化鈣')+'溶液；仍是透明液體。再加入另一種，看看會發生什麼。';
  if(d.id==='gas'&&p<1)description=busy?'一滴鹽酸落到石灰石，觀察表面的氣泡。':practice.dropperReady?'按住滴管膠頭或「按住連續滴加」，放開就停止；單點可滴一滴。滴管用完後比較反應前後。':'把滴管拖到燒杯上方；也可點「將滴管移到燒杯上方」。';
  const observation='<span>'+phase+'</span><p>'+description+'</p>'+(p===1?'<b>新物質：'+d.product+'</b>':'');
  if(q('.reaction-observation').innerHTML!==observation)q('.reaction-observation').innerHTML=observation;
  q('.reaction-equation').textContent=d.equation;
  q('.reaction-note').textContent=d.note+(d.id==='solid'?' 兩種溶液都是無色，以上方標示辨認。':d.id==='gas'?' 滴數只用於分步觀察，不代表精確用量或化學計量。':'');
  const play=q('.demonstrate');play.hidden=d.id==='gas'||(d.id==='solid'&&practice.solutions.length<2);play.disabled=busy;
  play.textContent=running?'Ⅱ 暫停觀察':p===1?'↻ 再反應一次':p>0?'▶ 繼續觀察':'▶ 反應 · '+d.action;
  q('.practice-controls').hidden=!manual;q('.solution-actions').hidden=d.id!=='solid';q('.dropper-actions').hidden=d.id!=='gas';
  qa('[data-add-solution]').forEach(b=>{const added=practice.solutions.includes(b.dataset.addSolution);b.disabled=busy||added;b.textContent=(added?'✓ 已加入':'加入')+(b.dataset.addSolution==='sodium'?'碳酸鈉':'氯化鈣')+'溶液';});
  q('.drop-count').textContent='已加入 '+practice.drops+' / '+PRACTICE_DROPS+' 滴';
  q('.position-dropper').hidden=practice.dropperReady;q('.position-dropper').disabled=busy||p===1;
  q('.squeeze-dropper').disabled=!practice.dropperReady||practice.drops>=PRACTICE_DROPS;
  q('.hands-on-hint').hidden=!manual;q('.hands-on-hint').textContent=d.id==='solid'?'拖曳或點選有標籤的試劑瓶 → 加入燒杯；兩種溶液皆無色。':'拖曳滴管 → 對準燒杯 → 按住滴加，放開停止。也可按住空白鍵或 Enter。';
  qa('[data-practice-tool]').forEach(b=>{
   const tool=b.dataset.practiceTool,isDrop=tool==='dropper';b.hidden=isDrop?d.id!=='gas':d.id!=='solid';
   b.disabled=isDrop?practice.drops>=PRACTICE_DROPS:busy||practice.solutions.includes(tool);
   if(isDrop){b.style.left=((dropper.x-19)/760*100)+'%';b.style.top=((dropper.y-179)/440*100)+'%';b.setAttribute('aria-label',practice.dropperReady?'按住滴管膠頭，連續滴加鹽酸':'拿起滴管，拖到燒杯上方，或點選定位');b.querySelector('span').textContent=practice.dropperReady?'按住連續滴加':'拖到燒杯上方';}
  });
  q('.reaction-drop-target').hidden=!drag;
  qa('[data-demo]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.demo===selected));b.classList.toggle('has-observed',seen.has(+b.dataset.demo));});
 }
 function finish(){seen.add(selected);ctx.mark();draw();}
 const clock=reactionClock((value,run)=>{p=value;running=run;draw();},finish);
 function cancelMotion(){releaseAll();animationEpoch++;cancelAnimationFrame(frame);busy=false;pour=null;drag=null;gasPulse=0;}
 function reset(){cancelMotion();practice=createReactionPractice();dropper={x:583,y:221};clock.reset();}
 function animate(duration,update,done){const epoch=++animationEpoch,start=performance.now();busy=true;function tick(now){if(epoch!==animationEpoch)return;const t=Math.min(1,(now-start)/duration);update(t);draw();if(t<1)frame=requestAnimationFrame(tick);else{busy=false;done();draw();}}frame=requestAnimationFrame(tick);}
 function addSolution(id){
  if(demonstrations[selected].id!=='solid'||busy||practice.solutions.includes(id))return;
  pour={id,t:0};animate(1000,t=>pour={id,t},()=>{pour=null;addPracticeSolution(practice,id);if(practice.solutions.length===2)clock.start();});
 }
 function positionDropper(){if(busy||practice.drops>=PRACTICE_DROPS)return;dropper={x:368,y:221};placePracticeDropper(practice,true);draw();}
 function squeeze(){
  if(demonstrations[selected].id!=='gas'||busy||!addPracticeDrop(practice))return;
  const before=p,target=practice.drops/PRACTICE_DROPS;
  animate(700,t=>{gasPulse=t;p=before+(target-before)*Math.max(0,(t-.22)/.78);},()=>{gasPulse=0;p=target;if(p===1){stopHolding();finish();}else if(holding)squeeze();});
 }
 qa('[data-add-solution]').forEach(b=>b.onclick=()=>addSolution(b.dataset.addSolution));
 q('.position-dropper').onclick=positionDropper;
 function stopHolding(){holding=false;}
 const releasePresses=[q('.squeeze-dropper'),q('[data-practice-tool="dropper"]')].map(button=>bindDropperPress(button,{
  enabled:()=>demonstrations[selected].id==='gas'&&practice.dropperReady,
  start:()=>{holding=true;squeeze();},stop:stopHolding,tap:squeeze
 }));
 const releaseAll=()=>{releasePresses.forEach(release=>release());stopHolding();};
 window.addEventListener('blur',releaseAll);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
 q('.demonstrate').onclick=()=>{if(running)clock.pause();else if(p===1){if(demonstrations[selected].id==='solid')reset();else{clock.reset();clock.start();}}else clock.start();};
 q('.reaction-rewind').onclick=reset;
 qa('[data-demo]').forEach(b=>b.onclick=()=>{clock.pause();selected=+b.dataset.demo;reset();});
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
 draw();return{reset(){seen.clear();selected=0;reset();}};
}
