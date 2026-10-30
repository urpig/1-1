import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFormula,molecularMass,protonCount,react,reactions,conservation,atomLedger,convert,finite,CLASS_NA} from '../dist/chemistry/core.js';
import {cleanData} from '../dist/chemistry/state.js';
import {reactionClock} from '../dist/chemistry/components.js';
import {svgFrame} from '../dist/chemistry/art.js';
import {cards,lessons,supplementCards,practiceProblems} from '../dist/chemistry/data.js';
import {teachingIsotopes,nucleusParticles,countedNucleus,molePack,createPackingPlayer,mountFoundationStudio,waterPackingSVG,createMoleZoom} from '../dist/chemistry/foundation-studio.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8, a+' ≠ '+b);
test('counting nuclei preserves isotope composition, including hydrogen without a neutron',()=>{
 for(const [symbol,p,n]of [['C',6,6],['H',1,0],['O',8,8]]){
  const particles=nucleusParticles(symbol);
  assert.equal(particles.filter(x=>x.kind==='proton').length,p);
  assert.equal(particles.filter(x=>x.kind==='neutron').length,n);
  assert.equal(new Set(particles.map(x=>x.id)).size,p+n);
  assert.ok(particles.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.y)));
  assert.equal(teachingIsotopes[symbol].protons+teachingIsotopes[symbol].neutrons,p+n);
  const marked=particles.map(x=>x.id);
  assert.deepEqual(countedNucleus(symbol,marked.concat(marked,'electron-1')),{protons:p,neutrons:n,complete:true});
  assert.equal(countedNucleus(symbol,marked.slice(1)).complete,false);
 }
 assert.deepEqual(countedNucleus('H',[]),{protons:0,neutrons:0,complete:false});
});
test('water mole packs scale particle number and mass together without changing molecular mass',()=>{
 for(const amount of [.5,1,2]){const pack=molePack(amount);assert.equal(pack.amount,amount);assert.equal(pack.particles,amount*CLASS_NA);assert.equal(pack.mass,amount*18);assert.equal(pack.mass/pack.amount,molecularMass('H2O'));}
 assert.equal(molePack(2).particles,2*molePack().particles);
});
test('wheel zoom supports mouse notches, trackpads and line or page deltas without trapping boundary scroll',()=>{
 const zoom=createMoleZoom(()=>{});
 assert.equal(zoom.wheel(-100),false);assert.equal(zoom.value,0);
 for(let i=0;i<4;i++)zoom.wheel(25);assert.equal(zoom.value,1);
 assert.equal(zoom.wheel(100),false);zoom.wheel(-100);assert.equal(zoom.value,0);
 zoom.wheel(120);assert.equal(zoom.value,1);
 zoom.reset();zoom.wheel(7.5,1);assert.equal(zoom.value,1);
 zoom.reset();zoom.wheel(1,2);assert.equal(zoom.value,1);
 assert.equal(zoom.wheel(NaN),false);zoom.set(-10);assert.equal(zoom.value,0);zoom.set(4);assert.equal(zoom.value,1);
});
test('mole animation pauses, resumes, steps and resets without stray scheduled frames',()=>{
 const pending=new Map(),seen=[];let id=0;
 const player=createPackingPlayer(x=>seen.push(x),{schedule:fn=>{pending.set(++id,fn);return id;},cancel:key=>pending.delete(key)});
 const tick=()=>{const [key,fn]=pending.entries().next().value;pending.delete(key);fn();};
 player.play();assert.equal(pending.size,1);tick();assert.deepEqual(player.state,{step:1,playing:true});
 player.pause();assert.equal(pending.size,0);assert.equal(player.state.step,1);
 player.play();tick();assert.equal(player.state.step,2);tick();assert.deepEqual(player.state,{step:3,playing:false});assert.equal(pending.size,0);
 player.play();assert.equal(player.state.step,0);player.go(2);assert.equal(pending.size,0);assert.deepEqual(player.state,{step:2,playing:false});
 player.play();player.reset();assert.equal(pending.size,0);assert.deepEqual(player.state,{step:0,playing:false});assert.ok(seen.length>5);
});
test('foundation controls count, uncount, handle zero neutrons, change quantity and reset',()=>{
 const node=(dataset={})=>({dataset,attrs:{},handlers:{},style:{setProperty(){}},addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(k,v){this.attrs[k]=v;},focus(){}});
 const isotopes=Object.keys(teachingIsotopes).map(isotope=>node({isotope})),steps=[0,1,2,3].map(packStep=>node({packStep})),amounts=[1,2].map(packAmount=>node({packAmount}));
 const atomNodes=new Map(),packNodes=new Map();
 const get=(map,s)=>{if(!map.has(s))map.set(s,node());return map.get(s);};
 const host={querySelector:s=>get(atomNodes,s),querySelectorAll:()=>isotopes,addEventListener(_,fn){this.click=fn;}};
 const packing={dataset:{},querySelector:s=>get(packNodes,s),querySelectorAll:s=>s==='[data-pack-step]'?steps:amounts};
 get(atomNodes,'.nucleus-particles').querySelector=()=>node();
 const previous=globalThis.document;globalThis.document={addEventListener(){}};
 try{
  const activity=mountFoundationStudio({querySelector:s=>s==='.atom-explorer'?host:packing});
  const choose=s=>host.click({target:{closest:q=>q==='[data-isotope]'?{dataset:{isotope:s}}:null}});
  const count=id=>host.click({target:{closest:q=>q==='[data-nucleon]'?{dataset:{nucleon:id}}:null}});
  choose('H');count('proton-1');get(atomNodes,'.nucleus-check').onclick();
  assert.equal(get(atomNodes,'[data-count="neutron"]').textContent,0);
  assert.ok(get(atomNodes,'.nucleus-feedback').textContent.includes('0 個中子'));
  count('proton-1');assert.equal(get(atomNodes,'[data-count="proton"]').textContent,0);assert.equal(get(atomNodes,'.nucleus-feedback').textContent,'');
  choose('O');for(const p of nucleusParticles('O'))count(p.id);get(atomNodes,'.nucleus-check').onclick();assert.ok(get(atomNodes,'.nucleus-feedback').textContent.includes('質量數 16'));
  const slide=value=>get(packNodes,'.packing-mol-slider').oninput({target:{value:String(value)}});
  const stage=get(packNodes,'.zoom-stage');let prevented=0;
  assert.equal(packing.dataset.step,'1');assert.equal(get(packNodes,'.packing-amount').hidden,true);
  stage.handlers.wheel({deltaY:120,deltaMode:0,preventDefault(){prevented++;}});
  assert.equal(prevented,1);assert.equal(get(packNodes,'.packing-amount').hidden,false);assert.equal(packing.dataset.step,'3');
  assert.ok(get(packNodes,'.packing-caption p').innerHTML.includes('6.02'));
  slide(3);assert.equal(get(packNodes,'.packing-scale-value').textContent,'54.00 g');
  slide(2);assert.equal(get(packNodes,'.packing-scale-value').textContent,'36.00 g');assert.ok(get(packNodes,'.packing-amount output').innerHTML.includes('1.204'));
  slide(10);assert.equal(get(packNodes,'.packing-scale-value').textContent,'180.00 g');assert.ok(get(packNodes,'.packing-caption h5').textContent.includes('180 g'));
  slide(99);assert.equal(get(packNodes,'.packing-mol-slider').value,10);
  stage.handlers.wheel({deltaY:120,deltaMode:0,preventDefault(){prevented++;}});assert.equal(prevented,1,'release page scrolling at the outer limit');
  stage.handlers.wheel({deltaY:-120,deltaMode:0,preventDefault(){prevented++;}});
  assert.equal(get(packNodes,'.packing-scale-value').textContent,'180.00 g','zooming cannot change the sample amount');assert.equal(get(packNodes,'.same-mole').hidden,true);
  activity.reset();assert.equal(get(atomNodes,'[data-count="proton"]').textContent,0);assert.equal(packing.dataset.step,'1');assert.equal(isotopes[0].attrs['aria-pressed'],'true');
 }finally{globalThis.document=previous;}
});
test('dense mole drawings keep each displayed package equal to one mole for the entire slider range',()=>{
 const loose=waterPackingSVG(1,1);
 assert.equal((loose.match(/class="loose-water-molecule"/g)||[]).length,72);
 assert.ok(!loose.includes('href="#packing-water-cloud"'));
 assert.ok(!loose.includes('data-mol-pack='));
 for(let amount=1;amount<=10;amount++)for(const step of [2,3]){
  const svg=waterPackingSVG(amount,step);
  assert.equal((svg.match(/data-mol-pack=/g)||[]).length,amount);
  assert.ok((svg.match(/href="#packing-water-molecule"/g)||[]).length>=900);
  assert.ok(!svg.includes('NaN'));
  assert.equal(molePack(amount).mass,18*amount);
 }
});
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
test('five learning stations retain source lessons and seven practice types',()=>{assert.equal(cards.length,5);assert.equal(lessons.length,12);assert.equal(supplementCards.length,6);assert.deepEqual(cards.map(x=>x.id),[3,1,4,5,2]);assert.equal(cards.filter(x=>['mass','molecule','balance','stoich'].includes(x.type)).length,4);for(const c of [...cards,...supplementCards]){assert.ok(c.story&&c.task&&c.bridge&&c.explanation.length);assert.equal(c.quiz.feedback.length,c.quiz.options.length);assert.ok(c.quiz.answer<c.quiz.options.length);}assert.equal(practiceProblems.length,7);});


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
test('concepts precede phenomena and equations; conservation and conclusion come last',()=>{assert.deepEqual(cards.map(c=>c.type),['molecule','phenomena','balance','stoich','mass']);assert.deepEqual(cards.flatMap(c=>c.extras),[4,6,7,8,10,12]);assert.equal(cards.find(c=>c.id===1).prediction,lessons[0].prediction);assert.equal(cards.find(c=>c.id===5).prediction,lessons[10].prediction);assert.ok(cards.at(-1).extras.includes(12));});


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
 const endingImage=html.match(/src="data:image\/svg\+xml;base64,([^"]+)"/);
 assert.ok(endingImage,'the ending illustration must be available offline');
 assert.equal(Buffer.from(endingImage[1],'base64').toString('utf8'),fs.readFileSync(new URL('../dist/chemistry/assets/time-vortex.svg',import.meta.url),'utf8'));
 assert.ok(!html.includes('src="./assets/time-vortex.svg'));
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
 assert.notEqual(cards.find(c=>c.id===5).prediction,lessons[11].prediction);
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

import {sameLabRun,uniqueLabRecords} from '../dist/chemistry/lab-records.js';
import {labMassComparison} from '../dist/chemistry/lab-mass.js';
test('repeated experiment inputs and products retain one record, while changed quantities stay distinct',()=>{
 const record={id:'magnesium',dose:2.4,partner:3.2,products:[{formula:'MgO',mass:4}]};
 const repeat={...record,observation:'a different description',products:[{formula:'MgO',mass:4}]};
 assert.ok(sameLabRun(record,repeat));assert.equal(uniqueLabRecords([record,repeat]).length,1);
 const changedInput={...record,partner:4};assert.ok(!sameLabRun(record,changedInput));
 const changedProduct={...record,products:[{formula:'MgO',mass:3}]};assert.ok(!sameLabRun(record,changedProduct));
 assert.equal(uniqueLabRecords([record,repeat,changedInput,changedProduct]).length,3);
});
test('mass display includes unused material in the final total, including oxygen-limited runs',()=>{
 for(const masses of [[2.4,3.2],[2.4,.8],[0,0]]){
  const r=react('magnesium',masses,1),markup=labMassComparison('magnesium',masses,r,1);
  assert.ok(markup.includes('反應前 · 材料總重'));assert.ok(markup.includes('反應後 · 全部物質總重'));
  assert.ok(markup.includes('剩餘材料'));assert.ok(!markup.includes('NaN'));assert.ok(!markup.includes('Infinity'));
  near(r.inputMass,r.outputMass);
 }
 const html=labMassComparison('magnesium',[2.4,3.2],react('magnesium',[2.4,3.2],1),1);
 assert.ok(html.includes('產物 4 g ＋ 剩餘材料 1.6 g'));assert.ok(html.includes('2.4 g ＋ 結合的氧氣 1.6 g'));
});

test('foundation question distinguishes oxygen atoms from molecules and resets the answer', async()=>{
 const {mountFoundationCheck}=await import('../dist/chemistry/lesson-intro.js');
 const buttons=[1,16,32].map(value=>({dataset:{atomicMass:String(value)},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(type,fn){this.click=fn;}}));
 const feedback={dataset:{},textContent:''};
 const root={querySelectorAll(){return buttons;},querySelector(){return feedback;}};
 const check=mountFoundationCheck(root);
 buttons[2].click();assert.equal(feedback.dataset.correct,'false');assert.ok(feedback.textContent.includes('O₂'));
 buttons[1].click();assert.equal(feedback.dataset.correct,'true');assert.ok(feedback.textContent.includes('16 g'));assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
 buttons[0].click();assert.equal(feedback.dataset.correct,'false');assert.ok(feedback.textContent.includes('氫原子'));
 check.reset();assert.equal(feedback.dataset.correct,undefined);assert.ok(buttons.every(b=>b.attrs['aria-pressed']==='false'));
});
import {balanceDemonstrationSteps} from '../dist/chemistry/balance-demo.js';
import {realisticReactionScene} from '../dist/chemistry/reaction-scenes.js';
test('worked balancing example fixes oxygen first, then hydrogen without changing the molecules',()=>{
 const ledgers=balanceDemonstrationSteps.map(s=>atomLedger('water',s.coeff));
 assert.deepEqual(ledgers[0].rows,[{e:'H',left:2,right:2},{e:'O',left:2,right:1}]);
 assert.deepEqual(ledgers[1].rows,[{e:'H',left:2,right:4},{e:'O',left:2,right:2}]);
 assert.ok(ledgers[2].balanced&&ledgers[2].minimal);
});
test('all reaction drawings retain resolvable materials and instrument references throughout playback',()=>{
 for(const id of ['light','color','solid','gas']){
  for(const p of [0,.1,.3,.5,.8,1]){
   const svg=realisticReactionScene(id,p),ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
   assert.equal(new Set(ids).size,ids.length,id+' has duplicate SVG ids');
   for(const ref of svg.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(ref[1]),ref[1]);
   assert.ok(!/NaN|Infinity|undefined/.test(svg),id+' has invalid geometry');
  }
  assert.notEqual(realisticReactionScene(id,0),realisticReactionScene(id,1));
  assert.equal(realisticReactionScene(id,-1),realisticReactionScene(id,0));
  assert.equal(realisticReactionScene(id,2),realisticReactionScene(id,1));
 }
});

import {createReactionPractice,addPracticeSolution,placePracticeDropper,addPracticeDrop,practiceReady,PRACTICE_DROPS,bindDropperPress} from '../dist/chemistry/reaction-practice.js';
test('precipitation requires both different solutions in either order; repeats never add a second dose',()=>{
 for(const order of [['sodium','calcium'],['calcium','sodium']]){
  const s=createReactionPractice();assert.ok(!practiceReady(s,'solid'));
  assert.ok(!addPracticeSolution(s,'unknown'));assert.ok(addPracticeSolution(s,order[0]));assert.ok(!practiceReady(s,'solid'));
  assert.ok(!addPracticeSolution(s,order[0]));assert.equal(s.solutions.length,1);
  assert.ok(addPracticeSolution(s,order[1]));assert.ok(practiceReady(s,'solid'));assert.equal(s.solutions.length,2);
 }
});
test('acid is added one drop at a time only over the beaker and stops when the dropper is empty',()=>{
 const s=createReactionPractice();assert.ok(!addPracticeDrop(s));assert.equal(s.drops,0);
 placePracticeDropper(s,true);assert.ok(addPracticeDrop(s));assert.equal(s.drops,1);assert.ok(!practiceReady(s,'gas'));
 placePracticeDropper(s,false);assert.ok(!addPracticeDrop(s));assert.equal(s.drops,1);
 placePracticeDropper(s,true);for(let i=1;i<PRACTICE_DROPS;i++)assert.ok(addPracticeDrop(s));assert.ok(practiceReady(s,'gas'));assert.ok(!addPracticeDrop(s));assert.equal(s.drops,PRACTICE_DROPS);
 assert.deepEqual(createReactionPractice(),{solutions:[],dropperReady:false,drops:0});
});
test('manual apparatus states retain valid SVG references during additions and dropper movement',()=>{
 const s=createReactionPractice();
 for(const id of ['solid','gas'])for(const t of [0,.25,.5,.9,1]){
  const svg=realisticReactionScene(id,t,'manual-test',{...s,pour:{id:'sodium',t},dropper:{x:368,y:221},gasPulse:t});
  assert.ok(!/NaN|undefined|Infinity/.test(svg));const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const m of svg.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(m[1]));
 }
 assert.ok(!realisticReactionScene('color',1).includes('未加熱樣品'));
 assert.ok(realisticReactionScene('color',1).includes('無水硫酸銅'));
});

test('holding the dropper pairs presses with release, cancellation and keyboard controls',()=>{
 const handlers={},button={disabled:false,addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){}};
 let ready=false,held=false,starts=0,taps=0;
 const release=bindDropperPress(button,{enabled:()=>ready,start:()=>{held=true;starts++;},stop:()=>held=false,tap:()=>taps++});
 const e={button:0,pointerId:7,preventDefault(){}};
 handlers.pointerdown(e);assert.equal(starts,0);ready=true;
 handlers.pointerdown(e);assert.ok(held);assert.equal(starts,1);
 handlers.pointerup({...e,pointerId:8});assert.ok(held);
 handlers.pointerup(e);assert.ok(!held);handlers.click({detail:1});assert.equal(taps,0);
 for(const name of ['pointercancel','lostpointercapture','blur']){handlers.pointerdown(e);handlers[name](e);assert.ok(!held);}
 handlers.keydown({...e,key:' ',repeat:false});assert.ok(held);const n=starts;
 handlers.keydown({...e,key:' ',repeat:true});assert.equal(starts,n);handlers.keyup({...e,key:' '});assert.ok(!held);
 handlers.pointerdown(e);release();assert.ok(!held);handlers.click({detail:0});assert.equal(taps,1);
});


import {activityProgress,activityComplete,mainMastered} from '../dist/chemistry/learning-progress.js';
import {reactionComparison,demonstrations} from '../dist/chemistry/phenomena.js';
import {prepareStudio} from '../dist/chemistry/studio.js';
test('main stations need actual activity evidence and a correct answer without any prediction',()=>{
 const data={moleculeAssembled:true,phenomenaSeen:['light','color','solid','gas'],balanced:['water','magnesium','iron','peroxide'],stoichLevels:[1,2,3],massRecords:[{soda:4.2,acid:6,closed:false},{soda:4.2,acid:6,closed:true}]};
 const state={data,observed:[],answers:{}};
 for(const card of cards){
  assert.ok(activityComplete(card.id,data));assert.ok(!mainMastered(card,state));
  state.answers[card.id]=card.quiz.answer;assert.ok(mainMastered(card,state));
 }
 assert.ok(cards.every(card=>mainMastered(card,state)));
 assert.equal(data.handoutSolved,undefined);assert.equal(data.finalReason,undefined);
 const old={data:{},observed:cards.map(c=>c.id),predictions:{},answers:state.answers};
 assert.ok(cards.every(card=>!mainMastered(card,old)),'legacy page-open flags must not unlock stations');
});
test('activity counters ignore duplicate observations and only accept matching positive mass trials',()=>{
 assert.equal(activityProgress(1,{phenomenaSeen:['gas','gas','unknown']}).done,1);
 assert.ok(!activityComplete(1,{phenomenaSeen:['light','color','solid']}));
 assert.equal(activityProgress(4,{balanced:['water','water']}).done,1);
 assert.ok(!activityComplete(5,{stoichLevels:[1,2]}));
 assert.ok(!activityComplete(3,{moleculeAssembled:'true'}));
 assert.ok(!activityComplete(2,{massRecords:[{soda:0,acid:6,closed:false},{soda:0,acid:6,closed:true}]}));
 assert.equal(activityProgress(2,{massRecords:[{soda:4.2,acid:6,closed:false},{soda:8.4,acid:6,closed:true}]}).done,1);
});
test('student evidence survives reload and removes malformed saved values',()=>{
 const saved=cleanData({moleculeAssembled:true,phenomenaSeen:['gas','gas','bad','solid'],stoichLevels:[1,2],balanced:['water']});
 const restored=cleanData(JSON.parse(JSON.stringify(saved)));
 assert.equal(restored.moleculeAssembled,true);assert.deepEqual(restored.phenomenaSeen,['gas','solid']);
 assert.equal(activityProgress(1,restored).done,2);assert.equal(activityProgress(5,restored).done,2);
 assert.equal(cleanData({moleculeAssembled:'true',phenomenaSeen:'gas'}).moleculeAssembled,false);
 assert.deepEqual(cleanData({phenomenaSeen:'gas'}).phenomenaSeen,[]);
});
test('one acid drop can show an honest in-progress comparison with two numbered panels',()=>{
 const markup=reactionComparison(demonstrations.find(d=>d.id==='gas'),1/PRACTICE_DROPS);
 assert.ok(markup.includes('滴入鹽酸後 · 觀察中'));assert.ok(markup.includes('<span>01</span>'));assert.ok(markup.includes('<span>02</span>'));
 assert.equal((markup.match(/<figure>/g)||[]).length,2);assert.ok(!markup.includes('NaN'));
});
test('enlarging a workspace keeps the original activity controls inside the modal and restores them on close',()=>{
 // Minimal DOM fixture tests node ownership and restoration, not visual layout.
 class Node {
  constructor(name){this.name=name;this.children=[];this.style={};this.attrs={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
  setAttribute(k,v){this.attrs[k]=v;}
  append(...nodes){for(const node of nodes){node.detach();node.parent=this;this.children.push(node);}}
  prepend(node){node.detach();node.parent=this;this.children.unshift(node);}
  detach(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null;}}
  before(node){const parent=this.parent;node.detach();node.parent=parent;parent.children.splice(parent.children.indexOf(this),0,node);}
  replaceWith(node){const parent=this.parent;node.detach();parent.children.splice(parent.children.indexOf(this),1,node);node.parent=parent;this.parent=null;}
  remove(){this.detach();}
  focus(){focused=this;}
  dispatchEvent(event){events.push(event.type);}
  closest(){return card;}
  set innerHTML(value){this.markup=value;if(this.name==='header'){this.append(new Node('button'));}if(this.name==='dialog'){const close=new Node('button');close.className='studio-close';const body=new Node('div');body.className='studio-dialog-body';this.append(close,body);}}
  querySelector(selector){if(selector==='[aria-pressed="true"]')return null;return this.children.find(n=>selector==='button'?n.name==='button':n.className===selector.slice(1))||null;}
  showModal(){this.open=true;}
  close(){this.open=false;this.onclose();}
 }
 const previous=globalThis.document;let focused=null;const events=[];
 const card=new Node('card'),choice=new Node('button'),root=new Node('root'),activity=new Node('activity');
 activity.append(choice);root.append(activity);card.append(root);
 globalThis.document={createElement:name=>new Node(name),createComment:()=>new Node('comment'),body:{style:{overflow:'auto'}}};
 try{
  prepareStudio(root,{number:'01',title:'分子組裝室',description:'組裝'},{});
  const heading=root.children[0],open=heading.querySelector('button');
  for(let cycle=0;cycle<2;cycle++){
   open.onclick();const dialog=root.children.find(n=>n.name==='dialog'),body=dialog.querySelector('.studio-dialog-body');
   assert.equal(activity.parent,body);assert.equal(activity.children[0],choice);assert.equal(globalThis.document.body.style.overflow,'hidden');
   dialog.close();assert.deepEqual(card.children,[root]);assert.deepEqual(root.children,[heading,activity]);assert.equal(focused,open);assert.equal(globalThis.document.body.style.overflow,'auto');
  }
  assert.deepEqual(events,['workspaceclose','workspaceclose']);
 }finally{globalThis.document=previous;}
});

test('foundation presents one concept at a time and leads into assembly without losing the embedded question',async()=>{
 const {mountFoundationSteps}=await import('../dist/chemistry/lesson-intro.js');
 const previous=globalThis.document;let focused=null,scrolled=null;
 const make=()=>({children:[],attrs:{},classList:{add(){}},setAttribute(k,v){this.attrs[k]=v;},append(...nodes){this.children.push(...nodes);},before(node){this.beforeNode=node;},after(node){this.afterNode=node;},focus(){focused=this;},scrollIntoView(){scrolled=this;}});
 const panels=[make(),make(),make()],grid=make(),bridge=make(),footnote=make(),choice=make();
 const back=make(),next=make(),count=make(),buttons=[0,1,2].map(i=>({...make(),dataset:{concept:String(i)}}));
 const assembly={...make(),querySelector:()=>choice};
 const root={classList:{add(){}},querySelectorAll:()=>panels,querySelector:s=>({'.foundation-grid':grid,'.atomic-mole-bridge':bridge,'.foundation-footnote':footnote}[s]),closest:()=>({querySelector:()=>assembly})};
 globalThis.document={createElement:name=>({...make(),querySelectorAll:()=>buttons,querySelector:s=>({'.concept-back':back,'.concept-next':next,'.concept-count':count}[s])})};
 try{
  const flow=mountFoundationSteps(root);assert.deepEqual(panels.map(p=>p.hidden),[false,true,true]);assert.ok(back.disabled);assert.ok(panels[2].children.includes(bridge));
  next.onclick();assert.deepEqual(panels.map(p=>p.hidden),[true,false,true]);assert.equal(focused,panels[1]);
  buttons[2].onclick();assert.deepEqual(panels.map(p=>p.hidden),[true,true,false]);assert.equal(count.textContent,'觀念 3 / 3');
  next.onclick();assert.equal(scrolled,assembly);assert.equal(focused,choice);
  assert.deepEqual(panels.map(p=>p.hidden),[true,false,true]);back.onclick();assert.deepEqual(panels.map(p=>p.hidden),[false,true,true]);
  flow.reset();assert.deepEqual(panels.map(p=>p.hidden),[false,true,true]);assert.ok(back.disabled);
  let finished=0;const changes=[];
  const embedded=mountFoundationSteps(root,{finish:()=>finished++,onChange:n=>changes.push(n)});
  embedded.show(2,false);next.onclick();assert.equal(finished,1);
  embedded.show(1,false);assert.deepEqual(panels.map(p=>p.hidden),[true,false,true]);
  embedded.reset();assert.deepEqual(changes,[0,2,1,0]);
 }finally{globalThis.document=previous;}
});
