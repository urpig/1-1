import { mountFoundationStudio } from './foundation-studio.js';
import { mountPhenomena } from './phenomena.js';
import { foundationLesson, equationLesson, mountFoundationCheck, mountFoundationSteps } from './lesson-intro.js';
import { mountPolish } from './polish.js';
import { handoutPractice } from './handout-practice-data.js';
import { TermPrimer, mountTerminology } from './terminology.js';
import { alchemySeal } from './art.js';
import { cards, lessons, supplementCards, supplementTitles } from './data.js';
import { mountMass } from './labs.js';
import { mountMolecule, mountBalancer, mountStoich } from './models.js';
import { mountStory } from './story.js';
import { returnJourney } from './story-journey.js';
import { escapeHTML } from './components.js';
import { cleanData } from './state.js';
import { activityProgress, activityComplete, mainMastered, quizHint } from './learning-progress.js';
const KEY='k12-chemistry-adventure-v2';
function fresh(){return{version:2,storyRevision:3,observed:[],answers:{},attempts:{},data:{},reduced:false};}
let state=fresh(),storageOK=true;
try{
 const loaded=JSON.parse(localStorage.getItem(KEY)||'null');
 if(loaded&&loaded.version===2){
  for(const c of [...cards,...supplementCards]){
   const a=loaded.answers?.[c.id];
   if(Number.isInteger(a)&&a>=0&&a<c.quiz.options.length)state.answers[c.id]=a;
   if(Array.isArray(loaded.observed)&&loaded.observed.includes(c.id))state.observed.push(c.id);
   if(Array.isArray(loaded.attempts?.[c.id]))state.attempts[c.id]=loaded.attempts[c.id].filter(x=>x&&Number.isInteger(x.answer)&&x.answer>=0&&x.answer<c.quiz.options.length).slice(-20);
  }
  state.data=cleanData(loaded.data);state.reduced=loaded.reduced===true;
  if(loaded.storyRevision!==3&&Number.isInteger(loaded.predictions?.[5])&&loaded.predictions[5]>=0&&loaded.predictions[5]<=2)state.data.finalPrediction=loaded.predictions[5];
 }
}catch{storageOK=false;}
// Reconcile older completion flags with evidence that can actually be verified.
state.observed=state.observed.filter(id=>!cards.some(c=>c.id===id));
for(const c of cards)if(activityComplete(c.id,state.data))state.observed.push(c.id);
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
 document.querySelector('#storage-status').textContent=storageOK?'':'瀏覽器暫時無法儲存；本次仍可操作，關閉後進度可能遺失。';
}
const activities=new Map(),extraActivities=new Map();
function baseMastered(c){return state.observed.includes(c.id)&&state.answers[c.id]===c.quiz.answer&&(c.sourceId!==7||handoutPractice.every(q=>state.data.handoutSolved?.includes(q.id)));}
function mastered(c){return typeof c.id==='number'?mainMastered(c,state):baseMastered(c);}
export function ChapterProgress(){
 const n=cards.filter(mastered).length;
 document.querySelector('#chapter-progress').value=n;
 document.querySelector('#progress-count').textContent=n+' / 5';
 document.querySelector('#top-progress').textContent=n+' / 5';
 cards.forEach(c=>{const a=document.querySelector('[data-nav="'+c.id+'"]');a.querySelector('.nav-state').textContent=mastered(c)?'✓':state.observed.includes(c.id)?'◐':'○';a.classList.toggle('mastered',mastered(c));});
 supplementCards.forEach(c=>{const badge=document.querySelector('[data-extra-status="'+c.id+'"]');if(badge)badge.textContent=mastered(c)?'已完成 ✓':state.observed.includes(c.id)?'已觀察 · 再試一題':'';});
 document.querySelector('#completion-banner').hidden=n!==5;
 cards.forEach(c=>{
  const el=document.querySelector('#chem-'+c.id),p=activityProgress(c.id,state.data),observed=activityComplete(c.id,state.data),complete=mastered(c);
  const next=complete?'next':observed?'quiz':'activity';
  const nextLabel=complete?'前往下一站 →':observed?'回答一題，完成本站 →':'繼續操作（'+p.done+' / '+p.total+'） →';
  el.querySelector('.lesson-checkpoints').innerHTML='<div><b>'+(complete?'✓ 本站完成':observed?'操作完成，還差一道題':'本站進度')+'</b><span>'+(complete?'':p.label+'：'+p.done+' / '+p.total)+'</span></div><button type="button" class="primary" data-student-go="'+next+'">'+(complete&&c===cards.at(-1)?(n===5?'查看本章成果 →':'回到未完成的站點 →'):nextLabel)+'</button>';
  const outcome=el.querySelector('.studio-outcome');if(outcome){outcome.hidden=!observed;outcome.innerHTML='<div><b>✓ 本站操作已完成</b><p>'+escapeHTML(c.evidence)+'</p></div><button type="button" class="primary" data-student-go="'+(complete?'next':'quiz')+'">'+(complete?(c===cards.at(-1)?(n===5?'查看本章成果 →':'回到未完成的站點 →'):'前往下一站 →'):'回答一題，完成本站 →')+'</button>';}
 });
}
export function StoryDialogue(dialogue){
 const expressions={wonder:'好奇',curious:'思考',excited:'興奮',mentor:'引導',surprised:'驚訝',idea:'靈機一動',thoughtful:'沉思',thinking:'思考',gentle:'溫和',determined:'堅定',encourage:'鼓勵'};
 return '<div class="story-dialogue">'+dialogue.map(([who,expression,text])=>'<div class="story-speech story-speech--'+who+'"><span class="story-portrait story-portrait--'+who+'" data-expression="'+expression+'" role="img" aria-label="'+({kui:'小葵',grandpa:'阿公',leon:'里昂'}[who])+'的'+(expressions[expression]||'說話')+'表情"></span><p><b>'+({kui:'小葵',grandpa:'阿公',leon:'里昂'}[who])+'</b>'+text+'</p></div>').join('')+'</div>';
}
export function ScienceExplanation(c,cls='science-explanation'){return '<div class="'+cls+'" '+(state.observed.includes(c.id)?'':'hidden')+'><span class="eyebrow">記住這幾點</span><ul class="lesson-key-points">'+c.keyPoints.map(p=>'<li>'+p+'</li>').join('')+'</ul><details class="explanation-depth"><summary>深入了解</summary>'+c.explanation.map(p=>'<p>'+p+'</p>').join('')+'</details></div>';}
function quizMarkup(c){
 const unlocked=state.observed.includes(c.id);
 return '<section class="quiz" aria-labelledby="quiz-title-'+c.id+'"><span class="eyebrow">小試身手</span><h3 id="quiz-title-'+c.id+'">'+c.quiz.q+'</h3><div class="quiz-lock" '+(unlocked?'hidden':'')+'>先完成上面的操作，再來試這一題。</div><fieldset '+(unlocked?'':'disabled')+'><legend class="sr-only">'+c.quiz.q+'</legend>'+c.quiz.options.map((o,i)=>'<label class="quiz-option"><input type="radio" name="quiz-'+c.id+'" value="'+i+'" '+(state.answers[c.id]===i?'checked':'')+'><span>'+String.fromCharCode(65+i)+'</span>'+o+'</label>').join('')+'<button class="primary submit-quiz">檢查答案</button></fieldset><div class="quiz-feedback" role="status"></div></section>';
}
function extrasMarkup(c){if(!c.extras.length)return '';const ending=c.extras.length===1&&c.extras[0]===12;return '<section class="supporting-section" aria-label="融入本卡的圖解與練習"><div class="supporting-heading"><h3>'+(ending?'冒險的最後一個問題':'把剛剛的發現，再想深一點')+'</h3><p>'+(ending?'選修結局：檢查點金傳說。':'選修，不影響本站完成。')+'</p></div>'+c.extras.map(id=>{const e=supplementCards.find(x=>x.sourceId===id),content='<div class="supporting-body"><p class="supporting-question">'+e.question+'</p><p>'+e.story+'</p><div class="supporting-activity"></div>'+ScienceExplanation(e,'supporting-explanation')+quizMarkup(e)+'</div>';return id===12?'<section class="supporting-detail ending-open" data-extra="12"><header class="ending-heading"><h3>'+supplementTitles[id]+'</h3><small data-extra-status="'+e.id+'"></small></header>'+content+'</section>':'<details class="supporting-detail" data-extra="'+id+'"><summary><span>'+supplementTitles[id]+'</span><small data-extra-status="'+e.id+'"></small></summary>'+content+'</details>';}).join('')+'</section>';}
function render(){
 document.querySelector('#story-ending').innerHTML='<h2 id="story-ending-title">'+escapeHTML(returnJourney.title)+'</h2><p>'+escapeHTML(returnJourney.opening)+'</p><figure class="ending-art"><img src="./assets/time-vortex.svg?v=d434d339e527" alt="古代煉金工坊裡，左側里昂握住右側小葵的手；中間的阿公一手握著時空裝置，另一手抓住小葵的前臂，合力抵抗身後的藍綠色亂流。" width="1536" height="1024" loading="lazy" decoding="async"></figure>'+StoryDialogue(returnJourney.dialogue)+'<p>'+escapeHTML(returnJourney.ending)+'</p><p class="epilogue-question"><b>'+escapeHTML(returnJourney.question)+'</b><span>未完待續</span></p>';

 document.querySelector('#chapter-route').innerHTML=cards.map((c,index)=>'<a href="#chem-'+c.id+'" data-nav="'+c.id+'"><span>'+String(index+1).padStart(2,'0')+'</span><span>'+c.title+'</span><b class="nav-state">○</b></a>').join('');
 document.querySelector('#lesson').innerHTML=cards.map((c,index)=>'<article class="learning-card" id="chem-'+c.id+'" aria-labelledby="title-'+c.id+'"><header class="card-header"><div class="card-kicker"><span>第'+['一','二','三','四','五'][index]+'站</span></div><h2 id="title-'+c.id+'">'+c.title+'</h2><p class="core-question">'+c.question+'</p></header><div class="card-body"><p class="story-opening">'+c.story+'</p>'+StoryDialogue(c.dialogue)+(c.id===3?foundationLesson():TermPrimer(c.id))+(c.id===4?equationLesson():'')+'<div class="activity" data-activity="'+c.id+'"></div>'+ScienceExplanation(c)+quizMarkup(c)+'<div class="lesson-checkpoints" aria-label="本站學習清單"></div>'+extrasMarkup(c)+'<div class="chapter-bridge"><p>'+c.bridge+'</p></div></div><footer class="card-footer">'+(index>0?'<a href="#chem-'+cards[index-1].id+'">← 上一站</a>':'<span></span>')+'<button class="text-button reset-card">重設本卡</button>'+(index<cards.length-1?'<a class="next-link" href="#chem-'+cards[index+1].id+'">下一站 →</a>':'<a class="next-link" href="#story-ending">閱讀故事結尾 →</a>')+'</footer></article>').join('');
}
function reveal(c,el,cls='.science-explanation'){
 el.querySelector(cls).hidden=false;el.querySelector('.quiz-lock').hidden=true;el.querySelector('.quiz fieldset').disabled=false;ChapterProgress();
}
export function QuizFeedback(c,el,index,activitySelector='.activity'){
 const ok=index===c.quiz.answer,feedback=el.querySelector('.quiz-feedback');
 feedback.className='quiz-feedback '+(ok?'correct':'incorrect');
 feedback.innerHTML='<strong>'+(ok?'✓ 你抓到關鍵了':'再想一步，你可以修正答案')+'</strong><p>'+(ok?c.quiz.reason:quizHint(c.id))+'</p>'+(ok?'':'<details class="solution-reveal"><summary>需要幫忙？看完整解析</summary><p><b>正確答案：'+c.quiz.options[c.quiz.answer]+'</b></p><p>'+c.quiz.reason+'</p></details>')+'<button class="secondary retry-quiz">再試一次</button><button class="text-button revisit-model">回到本段觀察</button>';
 feedback.querySelector('.retry-quiz').onclick=()=>{el.querySelector('.quiz').querySelectorAll('input').forEach(x=>x.checked=false);delete state.answers[c.id];save();ChapterProgress();feedback.innerHTML='';el.querySelector('.quiz input')?.focus({preventScroll:true});};
 feedback.querySelector('.revisit-model').onclick=()=>{if(activitySelector==='.activity')el.querySelector('.foundation-lesson')?.dispatchEvent(new Event('foundation:activity'));el.querySelector(activitySelector).scrollIntoView({behavior:state.reduced?'auto':'smooth',block:'start'});};
}
function bindQuiz(c,el,activitySelector='.activity'){
 el.querySelector('.submit-quiz').onclick=()=>{
  const checked=el.querySelector('.quiz').querySelector('input:checked');
  if(!checked){el.querySelector('.quiz-feedback').textContent='先選一個答案，再查看解析。';return;}
  const index=Number(checked.value);state.answers[c.id]=index;
  (state.attempts[c.id]??=[]).push({answer:index,correct:index===c.quiz.answer,at:Date.now()});
  state.attempts[c.id]=state.attempts[c.id].slice(-20);save();QuizFeedback(c,el,index,activitySelector);ChapterProgress();
 };
 if(state.answers[c.id]!==undefined&&state.observed.includes(c.id))QuizFeedback(c,el,state.answers[c.id],activitySelector);
}
render();
const foundationRoot=document.querySelector('.foundation-lesson');
const foundationCheck=mountFoundationCheck(foundationRoot),foundationStudio=mountFoundationStudio(foundationRoot);
const foundationSteps=mountFoundationSteps(foundationRoot,{
 onChange(step){if(step!==2)foundationStudio.pause();},
 finish(){if(!activityComplete(3,state.data)){foundationSteps.show(1);return;}const quiz=document.querySelector('#chem-3 .quiz');quiz.scrollIntoView({behavior:'auto',block:'start'});quiz.querySelector('input')?.focus({preventScroll:true});}
});
foundationRoot.addEventListener('foundation:activity',()=>foundationSteps.show(1,false));
for(const c of cards){
 const el=document.querySelector('#chem-'+c.id);
 const ctx={get data(){return state.data;},save,mark(){if(activityComplete(c.id,state.data)){if(!state.observed.includes(c.id))state.observed.push(c.id);reveal(c,el);}save();ChapterProgress();}};
 const mount={phenomena:mountPhenomena,mass:mountMass,molecule:mountMolecule,balance:mountBalancer,stoich:mountStoich}[c.type];
 activities.set(c.id,mount(el.querySelector('.activity'),ctx));
 const outcome=document.createElement('section');outcome.className='studio-outcome';outcome.hidden=true;el.querySelector('.activity').append(outcome);
 bindQuiz(c,el);
 for(const sourceId of c.extras){
  const e=supplementCards.find(x=>x.sourceId===sourceId),source=lessons.find(x=>x.id===sourceId),host=el.querySelector('[data-extra="'+sourceId+'"]');
  const extraCtx={renderDialogue:StoryDialogue,get data(){return state.data;},save,mark(){if(!state.observed.includes(e.id)){state.observed.push(e.id);save();}reveal(e,host,'.supporting-explanation');}};
  extraActivities.set(sourceId,mountStory(host.querySelector('.supporting-activity'),source,extraCtx));
  bindQuiz(e,host,'.supporting-activity');
 }
 el.querySelector('.reset-card').onclick=()=>{
  const ids=[c.id,...c.extras.map(id=>'extra-'+id)];state.observed=state.observed.filter(id=>!ids.includes(id));
  ids.forEach(id=>{delete state.answers[id];delete state.attempts[id];});
  activities.get(c.id)?.reset();if(c.id===3){foundationCheck.reset();foundationStudio.reset();foundationSteps.reset();}c.extras.forEach(id=>extraActivities.get(id)?.reset());
  el.querySelectorAll('.science-explanation,.supporting-explanation').forEach(x=>x.hidden=true);
  el.querySelectorAll('.quiz-lock').forEach(x=>x.hidden=false);
  el.querySelectorAll('.quiz fieldset').forEach(x=>x.disabled=true);
  el.querySelectorAll('.quiz input').forEach(x=>x.checked=false);
  el.querySelectorAll('.quiz-feedback').forEach(x=>x.innerHTML='');
  save();ChapterProgress();
 };
}
// Keep the original assembly nodes and event handlers inside the molecule panel.
foundationRoot.querySelector('.foundation-assembly-slot').append(document.querySelector('#chem-3 .activity'));
const media=matchMedia('(prefers-reduced-motion: reduce)');
function motion(){document.documentElement.classList.toggle('reduce-motion',state.reduced||media.matches);}
media.addEventListener('change',motion);motion();
save();ChapterProgress();
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(/^(chem-[1-5]|story-ending)$/.test(id))document.getElementById(id)?.scrollIntoView();});
if(/^#(chem-[1-5]|story-ending)$/.test(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView());
document.querySelector('#clear-chapter-progress').onclick=()=>{state=fresh();save();location.reload();};




mountTerminology(cards);

document.addEventListener('click',e=>{const b=e.target.closest('[data-open-extra]');if(!b)return;const target=document.querySelector('[data-extra="'+b.dataset.openExtra+'"]');if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({behavior:'instant',block:'start'});});

document.addEventListener('click',e=>{
 const button=e.target.closest('[data-student-go]');if(!button)return;
 const card=button.closest('.learning-card'),action=button.dataset.studentGo,index=cards.findIndex(c=>'chem-'+c.id===card.id);
 const dialog=card.querySelector('dialog[open]');if(dialog)dialog.close();
 requestAnimationFrame(()=>{
  const target=action==='next'?(index<cards.length-1?document.querySelector('#chem-'+cards[index+1].id):(cards.every(mastered)?document.querySelector('#completion-banner'):document.querySelector('#chem-'+cards.find(c=>!mastered(c)).id))):card.querySelector('.'+action);
  if(!target||target.hidden)return;if(action==='activity')card.querySelector('.foundation-lesson')?.dispatchEvent(new Event('foundation:activity'));target.scrollIntoView({behavior:state.reduced?'auto':'smooth',block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 });
});
mountPolish(cards);
