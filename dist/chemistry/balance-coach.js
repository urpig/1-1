import { atomLedger, reactions, parseFormula, elements } from './core.js';

export const balanceOrder=['water','magnesium','iron','peroxide'];
export const balanceSpeciesNames={H2:'氫氣',O2:'氧氣',H2O:'水',Mg:'鎂',MgO:'氧化鎂',Fe:'鐵',Fe2O3:'氧化鐵',H2O2:'過氧化氫'};

export function balanceCoach(id,coeff){
 const reaction=reactions[id],ledger=atomLedger(id,coeff);
 if(ledger.balanced)return ledger.minimal
  ?{tone:'success',index:-1,title:'配平成功！',detail:'係數比 '+coeff.join('：'),hint:'每種原子左右相同，係數也已是最簡整數比。'}
  :{tone:'reduce',index:-1,title:'原子對上了，再把係數約小',detail:'所有係數一起除以相同的數。',hint:'最簡整數係數是 '+reaction.coeff.join('：')+'。'};
 const order=id==='peroxide'?['H','O']:['O','H','Mg','Fe'];
 const row=order.map(e=>ledger.rows.find(x=>x.e===e&&x.left!==x.right)).find(Boolean)||ledger.rows.find(x=>x.left!==x.right);
 const leftNeedsMore=row.left<row.right,side=leftNeedsMore?'左邊':'右邊',formulas=leftNeedsMore?reaction.left:reaction.right;
 const local=formulas.findIndex(f=>parseFormula(f)[row.e]);
 let formula=formulas[local],index=local+(leftNeedsMore?0:reaction.left.length),delta=1;
 if(coeff[index]>=12){
  const opposite=leftNeedsMore?reaction.right:reaction.left,offset=leftNeedsMore?reaction.left.length:0;
  const other=opposite.findIndex((f,i)=>parseFormula(f)[row.e]&&coeff[offset+i]>1);
  if(other>=0){formula=opposite[other];index=offset+other;delta=-1;}
 }
 const name=balanceSpeciesNames[formula]||formula;
 return {tone:'working',index,delta,title:side+'少 '+Math.abs(row.left-row.right)+' 個'+elements[row.e].name+'原子',detail:'試著調整「'+name+'」前面的係數。',hint:'按「'+name+'」的'+(delta===1?'＋增加':'−減少')+'份數，再看下方原子數；化學式的下標保持不動。'};
}
