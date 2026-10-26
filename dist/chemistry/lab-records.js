const near=(a,b)=>Number.isFinite(Number(a))&&Number.isFinite(Number(b))&&Math.abs(Number(a)-Number(b))<1e-8;
export function sameLabRun(a,b){
 if(a.id!==b.id||!near(a.dose,b.dose)||!near(a.partner??0,b.partner??0))return false;
 if(!Array.isArray(a.products)||!Array.isArray(b.products)||a.products.length!==b.products.length)return false;
 return a.products.every(x=>b.products.some(y=>x.formula===y.formula&&near(x.mass,y.mass)));
}
export function uniqueLabRecords(records){return records.filter((record,index)=>!records.slice(index+1).some(other=>sameLabRun(record,other)));}
