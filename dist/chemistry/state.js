import { handoutPractice } from './handout-practice-data.js';
import { react, conservation } from './core.js';
export function cleanData(raw){
 const x=raw&&typeof raw==='object'?raw:{},out={};
 const pick=(key,allowed)=>{out[key]=Array.isArray(x[key])?[...new Set(x[key].filter(v=>allowed.includes(v)))]:[];};
 pick('labDone',['magnesium','hydrate','precipitate','limestone']);pick('balanced',['water','magnesium','iron','peroxide']);
 pick('finalEvidence',[0,1,2,3]);pick('comparisons',['ice','rust','stone']);pick('practiceSolved',[0,1,2,3,4,5,6]);pick('stoichLevels',[1,2,3]);pick('handoutSolved',handoutPractice.map(q=>q.id));
 const safe=(n,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
 out.labRecords=(Array.isArray(x.labRecords)?x.labRecords:[]).filter(r=>r&&out.labDone.includes(r.id)&&safe(r.dose,12)&&safe(r.partner,15)).slice(-8).map(r=>({id:r.id,dose:r.dose,partner:r.partner,observation:{magnesium:'發光、放熱，形成白色 MgO',hydrate:'藍色轉白，失去結晶水',precipitate:'生成白色 CaCO₃ 沉澱',limestone:'生成無色 CO₂ 氣體'}[r.id],products:react(r.id,r.id==='hydrate'?[r.dose]:[r.dose,r.partner]).products}));
 out.massRecords=(Array.isArray(x.massRecords)?x.massRecords:[]).filter(r=>r&&safe(r.soda,16.8)&&safe(r.acid,12)).slice(-10).map(r=>{const v=conservation({soda:r.soda,acid:r.acid,closed:r.closed===true});return{soda:r.soda,acid:r.acid,closed:r.closed===true,initial:v.initial,reading:v.reading,escaped:v.escaped};});
 for(const[id,max]of [[4,2],[6,4],[8,3],[10,2]])out['step'+id]=Number.isInteger(x['step'+id])&&x['step'+id]>=0&&x['step'+id]<=max?x['step'+id]:0;
 out.finalReason=typeof x.finalReason==='string'?x.finalReason.slice(0,600):'';
 if(Number.isInteger(x.finalPrediction)&&x.finalPrediction>=0&&x.finalPrediction<=2)out.finalPrediction=x.finalPrediction;
 out.finalGuideStep=Number.isInteger(x.finalGuideStep)&&x.finalGuideStep>=0&&x.finalGuideStep<=2?x.finalGuideStep:0;
 return out;
}
