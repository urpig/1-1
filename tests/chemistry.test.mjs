import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFormula,molecularMass,protonCount,react,reactions,conservation,atomLedger,convert,finite,CLASS_NA} from '../dist/chemistry/core.js';
import {cleanData} from '../dist/chemistry/state.js';
import {reactionClock} from '../dist/chemistry/components.js';
import {svgFrame} from '../dist/chemistry/art.js';
import {cards,lessons,supplementCards,practiceProblems} from '../dist/chemistry/data.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8, a+' ≠ '+b);
for(const [formula,mass]of Object.entries({H2O:18,CO2:44,CH4:16,H2SO4:98,NaCl:58.5,Al2O3:102,'CuSO4·5H2O':250,'Ca(OH)2':74,CH3COOH:60,CH3COONa:82}))test('formula mass '+formula,()=>near(molecularMass(formula),mass));
test('nested and repeated elements',()=>{assert.deepEqual(parseFormula('CH3COOH'),{C:2,H:4,O:2});assert.deepEqual(parseFormula('Ca(OH)2'),{Ca:1,O:2,H:2});assert.equal(protonCount('H2SO4'),50);});
test('invalid inputs rejected',()=>{for(const x of ['','Xx2','H0','H-2','Ca(OH','H2)O','H2O·'])assert.throws(()=>parseFormula(x));for(const n of [-1,NaN,Infinity,'',null])assert.throws(()=>finite(n));assert.throws(()=>atomLedger('water',[1.2,1,1]));});
for(const[id,r]of Object.entries(reactions))test(id+' conserves atoms and mass at every extent',()=>{const ledger=atomLedger(id,r.coeff);assert.ok(ledger.balanced&&ledger.minimal);for(const p of [0,.25,.6,1]){const result=react(id,r.left.map((_,i)=>(i+1)*3.7),p);near(result.inputMass,result.outputMass);assert.ok(result.remaining.every(x=>x.mass>=0));}assert.ok(react(id,r.left.map(()=>0)).products.every(x=>x.mass===0));});
test('open vs sealed mass and doubled dosage',()=>{const a=conservation({soda:4.2,acid:6}),b=conservation({soda:8.4,acid:6}),c=conservation({soda:4.2,acid:6,closed:true});near(a.co2,2.2);near(a.reading,228);near(b.co2,4.4);near(c.reading,c.initial);near(c.escaped,0);near(conservation({closed:true,collect:false}).escaped,2.2);});
test('limiting reagent leaves excess soda',()=>{const x=conservation({soda:16.8,acid:6});near(x.co2,4.4);near(x.remaining[0].mass,8.4);near(x.remaining[1].mass,0);near(x.reading+x.escaped,x.initial);});
test('balanced multiples distinguished from simplest coefficients',()=>{assert.ok(!atomLedger('water',[1,1,1]).balanced);assert.ok(atomLedger('water',[4,2,4]).balanced);assert.ok(!atomLedger('water',[4,2,4]).minimal);assert.ok(!atomLedger('water',[0,0,0]).balanced);});
test('unit conversions, particle amount, single molecule mass',()=>{for(const [n,u]of [[36,'g'],[36000,'mg'],[.036,'kg'],[2,'mol'],[2*CLASS_NA,'particles']]){const x=convert(n,u,'H2O');near(x.mol,2);near(x.mass,36);}near(convert(1,'mol','H2O').oneMass*CLASS_NA,18);});
test('peroxide and original combined challenge',()=>{const x=react('peroxide',[68]);near(x.products[0].mass,36);near(x.products[1].mass,32);near(react('peroxide',[20]).products[1].mass,160/17);});
test('step clock completes once at ten frames and resets',()=>{let p=0,done=0;const c=reactionClock(x=>p=x,()=>done++);for(let i=0;i<15;i++)c.step();assert.equal(p,1);assert.equal(done,1);c.reset();assert.equal(p,0);for(let i=0;i<10;i++)c.step();assert.equal(done,2);});
test('saved data is validated and recorded numbers recalculated',()=>{const x=cleanData({labDone:['magnesium','evil'],labRecords:[{id:'evil',dose:2,partner:1},{id:'magnesium',dose:2.4,partner:3.2,observation:'<script>',products:[]}],massRecords:[{soda:4.2,acid:6,closed:true,reading:0}],step4:-5,practiceSolved:'bad'});assert.equal(x.labRecords.length,1);near(x.labRecords[0].products[0].mass,4);near(x.massRecords[0].reading,230.2);assert.equal(x.step4,0);assert.deepEqual(x.practiceSolved,[]);});
test('SVG gradient IDs never collide',()=>{const a=svgFrame('<path fill="url(#glass)"/>','a'),b=svgFrame('<path fill="url(#glass)"/>','b');assert.notEqual(a.match(/id="([^"]+)/)[1],b.match(/id="([^"]+)/)[1]);assert.ok(!a.includes('url(#glass)'));});
test('5 interactive cards retain all 12 source topics and seven practice types',()=>{assert.equal(cards.length,5);assert.equal(lessons.length,12);assert.equal(supplementCards.length,7);assert.deepEqual(cards.map(x=>x.id),Array.from({length:5},(_,i)=>i+1));assert.equal(cards.filter(x=>['lab','mass','molecule','balance','stoich'].includes(x.type)).length,5);for(const c of [...cards,...supplementCards]){assert.ok(c.story&&c.task&&c.bridge&&c.explanation.length);assert.equal(c.quiz.feedback.length,c.quiz.options.length);assert.ok(c.quiz.answer<c.quiz.options.length);}assert.equal(practiceProblems.length,7);});


test('hydrate multiplier stays on baseline in rendered chemistry formula',async()=>{const {formulaHTML}=await import('../dist/chemistry/core.js');assert.equal(formulaHTML('CuSO4·5H2O'),'CuSO<sub>4</sub>·5H<sub>2</sub>O');});
test('drag has hit testing, cancellation and keyboard fallback',async()=>{
 const {makeDraggable}=await import('../dist/chemistry/components.js');
 const fake=()=>({handlers:{},style:{},classList:{add(){},remove(){}},addEventListener(k,f){this.handlers[k]=f;},setPointerCapture(){},disabled:false});
 const b=fake(),target=fake(),status={textContent:''};target.getBoundingClientRect=()=>({left:100,right:200,top:100,bottom:200});let drops=0;makeDraggable(b,target,()=>drops++,status);
 const event=(x,y)=>({button:0,clientX:x,clientY:y,pointerId:1,preventDefault(){}});
 b.handlers.pointerdown(event(0,0));b.handlers.pointermove(event(150,150));b.handlers.pointerup(event(150,150));b.handlers.click(event(150,150));assert.equal(drops,1);assert.equal(b.style.transform,'');
 b.handlers.pointerdown(event(0,0));b.handlers.pointermove(event(80,80));b.handlers.pointerup(event(80,80));b.handlers.click(event(80,80));assert.equal(drops,1);assert.ok(status.textContent.length>0);
 b.handlers.pointerdown(event(0,0));b.handlers.pointermove(event(140,140));b.handlers.keydown({key:'Escape'});b.handlers.pointerup(event(140,140));assert.equal(drops,1);
 b.handlers.keydown({key:'Enter'});b.handlers.click(event(0,0));assert.equal(drops,2);
});
test('five-card consolidation covers all original lesson identities exactly once',()=>{assert.deepEqual(cards.map(c=>c.type),['lab','mass','molecule','balance','stoich']);assert.deepEqual(cards.flatMap(c=>c.extras),[1,4,6,7,8,10,12]);assert.equal(cards[0].prediction,lessons[0].prediction);assert.equal(cards[4].prediction,lessons[10].prediction);});


test('residual solid drawings agree with the limiting reagent result',async()=>{
 const {massArt,laboratoryArt}=await import('../dist/chemistry/art.js');
 assert.ok(massArt(conservation({soda:16.8,acid:6}),{added:true,progress:1}).includes('data-solid="remaining-soda"'));
 assert.ok(!massArt(conservation({soda:4.2,acid:6}),{added:true,progress:1}).includes('data-solid="remaining-soda"'));
 assert.ok(laboratoryArt('limestone',{progress:1,remaining:4,added:true}).includes('data-solid="limestone"'));
 assert.ok(!laboratoryArt('limestone',{progress:1,remaining:0,added:true}).includes('data-solid="limestone"'));
 assert.ok(laboratoryArt('magnesium',{progress:1,remaining:.5,added:true}).includes('data-solid="magnesium"'));
});
test('offline package embeds its assets and preserves the shared calculation core',async()=>{
 const fs=await import('node:fs'),vm=await import('node:vm');
 const html=fs.readFileSync(new URL('../release/chemistry.html',import.meta.url),'utf8');
 assert.ok(!html.includes('src="./app.js"'));assert.ok(!html.includes('href="./styles.css"'));
 assert.equal((html.match(/data:image\/png;base64,/g)||[]).length,4);
 const script=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(script);
 const prefix=script.split('__modules["app.js"]')[0];
 const result=vm.runInNewContext(prefix+';__modules["core.js"].convert(36,"g","H2O");');
 assert.equal(result.mol,2);assert.equal(result.particles,2*CLASS_NA);
});


test('comparison only accepts equal reagent quantities',async()=>{
 const{matchedMassPair}=await import('../dist/chemistry/components.js');
 const a={closed:false,soda:4.2,acid:6},b={closed:true,soda:8.4,acid:6};
 assert.equal(matchedMassPair([a,b]),null);assert.equal(matchedMassPair([a,{...b,soda:4.2,acid:12}]),null);
 const c={...b,soda:4.2};assert.deepEqual(matchedMassPair([a,b,c]),{open:a,closed:c});
});
test('particle models show chemically consistent connections',async()=>{
 const{particleGroup}=await import('../dist/chemistry/art.js');
 const water=particleGroup('H2O',2),peroxide=particleGroup('H2O2',1);
 assert.equal((water.match(/data-bond="H-O"/g)||[]).length,4);assert.ok(!water.includes('data-bond="H-H"'));
 assert.equal((peroxide.match(/data-bond="O-O"/g)||[]).length,1);assert.equal((peroxide.match(/data-bond=/g)||[]).length,3);
 assert.ok(!particleGroup('MgO',2).includes('data-bond='));
});
test('product apparatus distinguishes gases from liquids and solids',async()=>{
 const{stoichBody}=await import('../dist/chemistry/apparatus.js');
 const a=stoichBody('H2O2',34,react('peroxide',[34]).products);
 assert.equal((a.match(/data-phase="gas"/g)||[]).length,1);assert.equal((a.match(/data-phase="liquid"/g)||[]).length,1);
 assert.ok(stoichBody('Mg',6,react('magnesium',[6,100]).products).includes('data-phase="solid"'));
});
test('three characters carry a causal story through all five workbenches',()=>{
 for(const c of cards){assert.deepEqual(c.dialogue.map(d=>d[0]),['leon','kui','grandpa']);assert.ok(c.evidence&&c.bridge);}
 assert.notEqual(cards[4].prediction,lessons[11].prediction);
 assert.equal(cleanData({finalPrediction:1}).finalPrediction,1);assert.equal(cleanData({finalPrediction:99}).finalPrediction,undefined);
});

test('Escape and pointer cancellation never deposit the dragged material',async()=>{
 const{makeDraggable}=await import('../dist/chemistry/components.js');
 for(const cancellation of ['Escape','pointercancel']){
  const fake=()=>({handlers:{},style:{},classList:{add(){},remove(){}},addEventListener(k,f){this.handlers[k]=f;},setPointerCapture(){},disabled:false});
  const b=fake(),target=fake(),status={textContent:''};target.getBoundingClientRect=()=>({left:100,right:200,top:100,bottom:200});let drops=0;makeDraggable(b,target,()=>drops++,status);
  const e=(x,y)=>({button:0,clientX:x,clientY:y,pointerId:1,preventDefault(){}});
  b.handlers.pointerdown(e(0,0));b.handlers.pointermove(e(150,150));
  if(cancellation==='Escape')b.handlers.keydown({key:'Escape',preventDefault(){}});else b.handlers.pointercancel(e(150,150));
  b.handlers.pointerup(e(150,150));b.handlers.click(e(150,150));assert.equal(drops,0);assert.equal(b.style.transform,'');
  b.handlers.pointerdown(e(0,0));b.handlers.pointerup(e(0,0));b.handlers.click(e(0,0));assert.equal(drops,1);
 }
});
test('drag acceptance follows the material center when grabbed near an edge',async()=>{
 const{makeDraggable}=await import('../dist/chemistry/components.js');
 const fake=()=>({handlers:{},style:{},classList:{add(){},remove(){}},addEventListener(k,f){this.handlers[k]=f;},setPointerCapture(){},disabled:false});
 const b=fake(),target=fake();b.getBoundingClientRect=()=>({left:0,right:60,top:0,bottom:60});target.getBoundingClientRect=()=>({left:100,right:200,top:100,bottom:200});let drops=0;makeDraggable(b,target,()=>drops++,{textContent:''});
 const e=(x,y)=>({button:0,clientX:x,clientY:y,pointerId:1,preventDefault(){}});
 b.handlers.pointerdown(e(10,30));b.handlers.pointermove(e(85,150));b.handlers.pointerup(e(85,150));b.handlers.click(e(85,150));assert.equal(drops,1);
 b.handlers.pointerdown(e(10,30));b.handlers.pointermove(e(60,150));b.handlers.pointerup(e(60,150));b.handlers.click(e(60,150));assert.equal(drops,1);
});

import {scienceTerms,primerTerms} from '../dist/chemistry/terminology-data.js';
import {matchScienceTerms} from '../dist/chemistry/terminology.js';
import {handoutPractice,checkPracticeAnswer} from '../dist/chemistry/handout-practice-data.js';
test('glossary concepts and their references remain unambiguous',()=>{
 const ids=scienceTerms.map(t=>t.id),seen=new Map();assert.equal(new Set(ids).size,ids.length);
 for(const t of scienceTerms){assert.ok(t.definition&&t.example);for(const r of t.related||[])assert.ok(ids.includes(r),r);for(const alias of [t.label,...t.aliases]){assert.ok(!seen.has(alias),'ambiguous term '+alias);seen.set(alias,t.id);}}
 for(const group of Object.values(primerTerms))for(const id of group)assert.ok(ids.includes(id));
 const matches=matchScienceTerms('相對原子量、原子量、分子式、化學式、亞佛加厥常數、亞佛加厥數、鍵長、化學鍵、係數比、莫耳數比、水溶液、溶液');
 assert.deepEqual(matches.map(x=>x.term),['atomicweight','atomicweight','molecularformula','formula','avogadro','avogadronumber','bondlength','bond','coefficientratio','moleratio','aqueous','solution']);
});
test('handout answers follow formula masses, particle counts and proportions',()=>{
 const q=id=>handoutPractice.find(q=>q.id===id);
 assert.equal(q('book-mass-h2').answer,10);assert.equal(q('book-mass-co2').answer,2);assert.equal(q('book-mass-water').answer,5);
 assert.equal(q('core-5').answer,3*16*9/8/2);assert.equal(q('unknown-formula').answer,102);assert.equal(q('unknown-half-mol').answer,51);
 assert.equal(q('hypochlorite-protons').answer,36);assert.equal(q('hypochlorite-mass').answer,149);
 for(const id of ['one-atom','one-mol','atomic-ratio'])assert.equal(q('nucleus-'+id).options[q('nucleus-'+id).answer],'3：4');
 assert.equal(q('nucleus-two-atoms').options[q('nucleus-two-atoms').answer],'3：2');
 assert.equal(q('reference-change').options[q('reference-change').answer],'不變');
 assert.equal(new Set(handoutPractice.map(q=>q.id)).size,handoutPractice.length);
 assert.deepEqual([...new Set(handoutPractice.map(q=>q.group))],[0,1,2,3,4]);
});
test('answer validation preserves tiny particle masses and rejects bad input',()=>{
 const tiny=handoutPractice.find(q=>q.id==='single-carbon');
 assert.ok(checkPracticeAnswer(tiny,'1.99e-23').correct);
 for(const n of [0,1,1.99e-22,1.99e-24])assert.ok(!checkPracticeAnswer(tiny,n).correct);
 for(const n of ['', ' ', null,undefined,NaN,Infinity,-1])assert.ok(!checkPracticeAnswer(tiny,n).valid);
 const choice=handoutPractice.find(q=>q.type==='choice');
 for(const n of [-1,.5,choice.options.length])assert.ok(!checkPracticeAnswer(choice,n).valid);
 for(const q of handoutPractice)assert.ok(checkPracticeAnswer(q,q.answer).correct,q.id);
});
test('handout progress drops unknown and duplicate ids while retaining completed questions',()=>{
 const x=cleanData({handoutSolved:['core-0','core-0','invalid','single-carbon',3]});assert.deepEqual(x.handoutSolved,['core-0','single-carbon']);
});
