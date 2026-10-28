import { matchedMassPair } from './components.js';

// Completion follows student actions, never opening a page or viewing a solution.
export function activityProgress(id,data={}){
 const count=(key,allowed)=>allowed.filter(value=>(Array.isArray(data[key])?data[key]:[]).includes(value)).length;
 if(id===3)return {done:data.moleculeAssembled===true?1:0,total:1,label:'親手組好一種分子或式單位'};
 if(id===1)return {done:count('phenomenaSeen',['light','color','solid','gas']),total:4,label:'觀察四種反應的前後變化'};
 if(id===4)return {done:count('balanced',['water','magnesium','iron','peroxide']),total:4,label:'完成四題最簡整數配平'};
 if(id===5)return {done:count('stoichLevels',[1,2,3]),total:3,label:'完成三個計算小關卡'};
 const records=(data.massRecords||[]).filter(r=>r.soda>0&&r.acid>0);
 const pair=matchedMassPair(records);
 return {done:pair?2:records.length?1:0,total:2,label:'完成同用量的開放、密閉實驗'};
}
export function activityComplete(id,data){const p=activityProgress(id,data);return p.done===p.total;}
export function mainMastered(card,state){return state.predictions?.[card.id]!==undefined&&activityComplete(card.id,state.data)&&state.answers[card.id]===card.quiz.answer;}
export function quizHint(id){return ({
 3:'先把每種原子的原子量乘上個數，再把結果加起來。注意：分子量沒有單位。',
 1:'氣泡、發光或變色都是線索。想一想：前後是否真的出現不同的物質？',
 4:'把每種化學式的下標乘上前面的係數，分別數一數左右的原子。',
 5:'先把克數換成莫耳，再依反應式係數換成產物的莫耳數，最後換回克數。',
 2:'先畫出「天平秤到的範圍」。生成的氣體有沒有離開這個範圍？'
 })[id]||'回到本段圖解，對照題目問的是哪個數量或變化，再試一次。';}
