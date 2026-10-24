import { practiceProblems } from './data.js';
import { molecularMass, protonCount, convert, CLASS_NA, format } from './core.js';
export const practiceGroups=['質量與莫耳','莫耳與粒子','質子與原子核','未知元素與式量','比較標準與單位'];
export const handoutPractice=[...practiceProblems.map((q,i)=>({...q,id:'core-'+i,group:[0,0,1,1,2,3,2][i],page:i===6?107:106,type:'number'}))];
const add=(id,group,q,answer,unit,hints,mistake,extra={})=>handoutPractice.push({id,group,q,answer,unit,hints,mistake,type:'number',page:107,...extra});
for(const [id,f,mass,name]of [['h2','H2',20,'氫氣'],['co2','CO2',88,'二氧化碳'],['water','H2O',90,'水']]){const M=molecularMass(f),n=convert(mass,'g',f).mol;add('book-mass-'+id,0,mass+' g '+name+'（'+f+'）有幾 mol？',n,'mol',['先看給的是質量 '+mass+' g，要求的是莫耳數。','由化學式得到莫耳質量 '+M+' g/mol。','n＝m/M＝'+mass+'÷'+M+'；單位 g÷(g/mol)＝mol。','答案：'+format(n)+' mol。'],'克數換成莫耳數要除以莫耳質量；不能直接除以單一元素的原子量。');}
add('single-carbon',1,'已知碳的莫耳質量約 12 g/mol，1 mol 約有 6.02×10²³ 個碳原子。一個碳原子平均約有幾克？可用 e 表示 10 的次方，例如 2e-20 表示 2×10⁻²⁰。',12/CLASS_NA,'g',['題目問一個原子，不是 1 mol 原子。','單個原子的平均質量＝莫耳質量÷亞佛加厥常數。','12÷(6.02×10²³)；(g/mol)÷(mol⁻¹)＝g。','答案：約 1.99×10⁻²³ g。'],'原子量 12 是比值；一顆原子遠小於 12 g。',{page:106});
add('unknown-element',3,'X₂O₃ 中 X：O 質量比為 9：8，已算出 X 原子量是 27。查表：O 16、Al 27、S 32、Fe 56、I 127，X 是哪個元素？',1,'',['先使用前一題算出的 X 原子量 27。','在題目提供的元素表中找相同的數值。','Al 的原子量為 27。','答案：鋁 Al。'],'用原子量對照表，不要把化學式下標 2 或 3 當成原子序。',{type:'choice',options:['氧 O','鋁 Al','鐵 Fe']});
add('unknown-formula',3,'X＝Al，原子量 27；O 原子量 16。X₂O₃ 的式量是多少？',molecularMass('Al2O3'),'（無單位）',['一份 Al₂O₃ 的組成是 2 個 Al、3 個 O。','式量＝各元素的原子量×該元素個數，再相加。','2×27＋3×16＝54＋48。','答案：102（無單位）。'],'鋁氧化物用式量表示；不能只做 27＋16，也不能把原子序相加。');
add('unknown-half-mol',3,'Al₂O₃ 的莫耳質量是 102 g/mol，0.5 mol 的質量是多少？',convert(.5,'mol','Al2O3').mass,'g',['題目給莫耳數，要算質量。','m＝nM。','0.5 mol×102 g/mol＝51 g。','答案：51 g。'],'半莫耳就是一莫耳質量的一半，要乘莫耳質量。');
add('hypochlorite-protons',2,'NaClO 是離子化合物。一份式單位中，所有原子核合計有幾個質子？Na、Cl、O 的原子序分別為 11、17、8。',protonCount('NaClO'),'個',['一份 NaClO 各有 1 個 Na、1 個 Cl、1 個 O。','原子序就是質子數；形成離子不會改變原子核的質子數。','11＋17＋8＝36。','答案：36 個質子。'],'要加原子序，不是加 23、35.5、16 這些原子量。');
add('hypochlorite-mass',0,'Na、Cl、O 的原子量分別為 23、35.5、16。2 mol 次氯酸鈉 NaClO 有幾克？',convert(2,'mol','NaClO').mass,'g',['先算式量：23＋35.5＋16＝74.5。','莫耳質量約為 74.5 g/mol。','m＝nM＝2×74.5。','答案：149 g。'],'算質量用原子量；算質子個數才用原子序。');
const comparisons=[
 ['one-atom','各取一個甲原子與乙原子，質量比 甲：乙 約為？',0,'12：16＝3：4。'],
 ['two-atoms','取兩個甲原子與一個乙原子，總質量比 甲：乙 約為？',1,'2×12：1×16＝24：16＝3：2。'],
 ['one-mol','各取 1 mol 甲原子與乙原子，質量比 甲：乙 約為？',0,'兩邊的原子數相同，同乘亞佛加厥常數後，比例仍是 12：16＝3：4。'],
 ['atomic-ratio','使用同一個比較標準，甲、乙原子的相對原子質量比約為？',0,'兩邊都除以相同的比較標準，因此比值仍是 12：16＝3：4。']
];
for(const[id,q,answer,last]of comparisons)add('nucleus-'+id,2,q,answer,'',['先數圖中的質子與中子：甲 6＋6＝12，乙 8＋8＝16。','本題近似質子、中子一樣重，忽略電子質量。','看清楚題目是幾個原子，或幾莫耳；總質量要乘上個數。',last],'先把每顆原子的質量乘上顆數；不能只比較質子數。',{type:'choice',options:['3：4','3：2','4：3'],diagram:'nuclei'});
add('reference-change',4,'假想把碳-12 的相對質量數值由 12 改訂成 24，一顆碳-12 原子的實際質量會怎樣？',0,'',['相對質量是「原子實際質量÷比較標準」。','讓相對數值加倍，相當於把比較用的單位縮小一半。','換了比較的尺，原子本身不會改變。','答案：實際質量不變；現行莫耳所含粒子數也不會因此改變。'],'不要把「比較得到的數字變大」誤認成原子真的變重。',{type:'choice',options:['不變','變成 2 倍','變成一半']});
add('alumina-unit',4,'Al₂O₃ 中，Al 的原子序 13、質量數 27；O 的原子序 8、質量數 16。採 Al＝27、O＝16 的常用原子量，莫耳質量應為？',1,'',['13 與 8 是原子序，用來數質子。','本題算質量，採常用原子量 27 與 16。','2×27＋3×16＝102。','答案：約 102 g/mol。50＝2×13＋3×8，是一份式單位的總質子數。'],'原子序、質量數、原子量是三種不同概念。此處原子量與指定同位素質量數的數值接近，不代表定義相同。',{type:'choice',options:['50 g/mol','102 g/mol','102（無單位）']});
handoutPractice.sort((a,b)=>a.group-b.group);
export function checkPracticeAnswer(question,raw){if((typeof raw==='string'&&raw.trim()==='')||raw===null||!Number.isFinite(Number(raw))||Number(raw)<0)return{valid:false,correct:false};const n=Number(raw);if(question.type==='choice')return{valid:Number.isInteger(n)&&n<question.options.length,correct:n===question.answer};return{valid:true,correct:question.answer===0?n===0:Math.abs(n-question.answer)<=Math.abs(question.answer)*.005};}
