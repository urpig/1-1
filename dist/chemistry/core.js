// Single source of truth for chemistry. Rounded school atomic weights; N_A classroom approximation is explicit.
export const NA=6.02214076e23;
export const CLASS_NA=6.02e23;
export const elements={
H:{name:'氫',z:1,ar:1,color:'#edf2f0'},C:{name:'碳',z:6,ar:12,color:'#48545b'},N:{name:'氮',z:7,ar:14,color:'#527fc0'},
O:{name:'氧',z:8,ar:16,color:'#d76658'},Na:{name:'鈉',z:11,ar:23,color:'#a28ac8'},Mg:{name:'鎂',z:12,ar:24,color:'#76a68a'},
Al:{name:'鋁',z:13,ar:27,color:'#8da1b3'},S:{name:'硫',z:16,ar:32,color:'#ddbd51'},Cl:{name:'氯',z:17,ar:35.5,color:'#85ad69'},
Ca:{name:'鈣',z:20,ar:40,color:'#88a5b6'},Fe:{name:'鐵',z:26,ar:56,color:'#aa856b'},Cu:{name:'銅',z:29,ar:64,color:'#c4865d'},Au:{name:'金',z:79,ar:197,color:'#d5b750'}};
export function finite(value,min=0,max=1e9){const n=Number(value);if(value===''||value===null||!Number.isFinite(n)||n<min||n>max)throw new Error('請輸入 '+min+'～'+max+' 的有效數值。');return n;}
export function parseFormula(formula){
 if(typeof formula!=='string'||!formula.length)throw new Error('化學式不可空白');
 const total={};
 for(const part of formula.split('·')){
 let f=part,mult=1;const lead=f.match(/^(\d+)(?=[A-Z(])/);if(lead){mult=Number(lead[1]);f=f.slice(lead[1].length);}if(!mult)throw new Error('無效係數');
 let pos=0;
 function number(){const m=f.slice(pos).match(/^\d+/);if(!m)return 1;pos+=m[0].length;const n=Number(m[0]);if(n<1||n>1000)throw new Error('無效下標');return n;}
 function group(nested=false){const result={};while(pos<f.length){if(f[pos]===')'){if(!nested)throw new Error('括號不成對');pos++;return result;}let atoms;
 if(f[pos]==='('){pos++;atoms=group(true);}else{const m=f.slice(pos).match(/^[A-Z][a-z]?/);if(!m||!elements[m[0]])throw new Error('未知元素或化學式格式');pos+=m[0].length;atoms={[m[0]]:1};}
 const n=number();for(const[e,c]of Object.entries(atoms))result[e]=(result[e]||0)+c*n;
 }if(nested)throw new Error('括號不成對');return result;}
 const parsed=group();if(!Object.keys(parsed).length)throw new Error('無效化學式');for(const[e,n]of Object.entries(parsed))total[e]=(total[e]||0)+n*mult;
 }return total;
}
export function molecularMass(f){return Object.entries(parseFormula(f)).reduce((s,[e,n])=>s+elements[e].ar*n,0);}
export function protonCount(f){return Object.entries(parseFormula(f)).reduce((s,[e,n])=>s+elements[e].z*n,0);}
export function toMoles(value,unit,f){const n=finite(value,0,1e30);if(unit==='mol')return n;if(unit==='particles')return n/CLASS_NA;const scale={g:1,mg:.001,kg:1000}[unit];if(!scale)throw new Error('未知單位');return n*scale/molecularMass(f);}
export function convert(value,unit,f){const mol=toMoles(value,unit,f),M=molecularMass(f);return{mol,mass:mol*M,particles:mol*CLASS_NA,M,oneMass:M/CLASS_NA};}
export const reactions={
water:{name:'氫氣與氧氣',left:['H2','O2'],right:['H2O'],coeff:[2,1,2],states:['g','g','l']},
magnesium:{name:'鎂的燃燒',left:['Mg','O2'],right:['MgO'],coeff:[2,1,2],states:['s','g','s']},
iron:{name:'鐵與氧氣（氧化鐵模型）',left:['Fe','O2'],right:['Fe2O3'],coeff:[4,3,2],states:['s','g','s']},
peroxide:{name:'過氧化氫分解',left:['H2O2'],right:['H2O','O2'],coeff:[2,2,1],states:['aq','l','g']},
hydrate:{name:'五水硫酸銅受熱',left:['CuSO4·5H2O'],right:['CuSO4','H2O'],coeff:[1,1,5],states:['s','s','g']},
precipitate:{name:'碳酸鈣沉澱',left:['Na2CO3','CaCl2'],right:['NaCl','CaCO3'],coeff:[1,1,2,1],states:['aq','aq','aq','s']},
limestone:{name:'石灰石與鹽酸',left:['CaCO3','HCl'],right:['CaCl2','H2O','CO2'],coeff:[1,2,1,1,1],states:['s','aq','aq','l','g']},
vinegar:{name:'小蘇打與醋酸',left:['NaHCO3','CH3COOH'],right:['CH3COONa','H2O','CO2'],coeff:[1,1,1,1,1],states:['s','aq','aq','l','g']}};
function gcd(a,b){return b?gcd(b,a%b):a;}
export function atomLedger(reaction,coeff){const r=typeof reaction==='string'?reactions[reaction]:reaction;if(!r||coeff.length!==r.left.length+r.right.length)throw new Error('反應資料不完整');const left={},right={};[...r.left,...r.right].forEach((f,i)=>{const c=finite(coeff[i],0,20);if(!Number.isInteger(c))throw new Error('係數必須是整數');const side=i<r.left.length?left:right;for(const[e,n]of Object.entries(parseFormula(f)))side[e]=(side[e]||0)+n*c;});const rows=[...new Set([...Object.keys(left),...Object.keys(right)])].map(e=>({e,left:left[e]||0,right:right[e]||0}));return{rows,balanced:coeff.every(c=>c>0)&&rows.every(x=>x.left===x.right),minimal:coeff.reduce((a,b)=>gcd(a,b))===1};}
export function react(id,masses,progress=1){const r=reactions[id];if(!r||masses.length!==r.left.length)throw new Error('反應物用量不完整');const p=finite(progress,0,1),amounts=masses.map((m,i)=>finite(m,0,1e9)/molecularMass(r.left[i])),ratios=amounts.map((n,i)=>n/r.coeff[i]),extent=Math.min(...ratios),limiting=ratios.map((x,i)=>Math.abs(x-extent)<1e-12?i:-1).filter(i=>i>=0),products=r.right.map((f,j)=>{const mol=extent*p*r.coeff[r.left.length+j];return{formula:f,mol,mass:mol*molecularMass(f)};}),remaining=r.left.map((f,i)=>{const mol=Math.max(0,amounts[i]-extent*p*r.coeff[i]);return{formula:f,mol,mass:mol*molecularMass(f)};});return{extent,limiting,products,remaining,inputMass:masses.reduce((a,b)=>a+Number(b),0),outputMass:[...products,...remaining].reduce((s,x)=>s+x.mass,0)};}
export function conservation({soda=4.2,acid=6,water=100,closed=false,collect=true,progress=1}){const r=react('vinegar',[soda,acid],progress),co2=r.products.find(x=>x.formula==='CO2').mass,escaped=closed&&collect?0:co2,initial=120+finite(water)+Number(soda)+Number(acid);return{...r,co2,escaped,initial,reading:initial-escaped,contained:co2-escaped};}
export function superscript(n){return String(n).split('').map(c=>({'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c]||c)).join('');}
export function format(n,d=3){if(!Number.isFinite(n))return '—';if(n!==0&&(Math.abs(n)>=1e7||Math.abs(n)<.001)){const[a,e]=n.toExponential(3).split('e');return Number(a)+' × 10'+superscript(Number(e));}return Number(n.toFixed(d)).toLocaleString('en-US',{maximumFractionDigits:d});}
export function formulaHTML(f){return f.replace(/\d+/g,(n,index)=>index===0||f[index-1]==='·'?n:'<sub>'+n+'</sub>');}
export function equationHTML(id,coeff=reactions[id].coeff){const r=reactions[id];return[...r.left,...r.right].map((f,i)=>(i===r.left.length?' → ':i?' + ':'')+(coeff[i]===1?'':coeff[i])+formulaHTML(f)).join('');}
export const molecules={
H2O:{name:'水',kind:'分子',atoms:[['O',0,0,0],['H',-.76,.59,0],['H',.76,.59,0]],bonds:[[0,1],[0,2]]},
CO2:{name:'二氧化碳',kind:'分子',atoms:[['C',0,0,0],['O',-1.16,0,0],['O',1.16,0,0]],bonds:[[0,1],[0,2]]},
CH4:{name:'甲烷',kind:'分子',atoms:[['C',0,0,0],['H',.63,.63,.63],['H',-.63,-.63,.63],['H',-.63,.63,-.63],['H',.63,-.63,-.63]],bonds:[[0,1],[0,2],[0,3],[0,4]]},
H2SO4:{name:'硫酸',kind:'分子',atoms:[['S',0,0,0],['O',.9,.9,.9],['O',-.9,-.9,.9],['O',-.9,.9,-.9],['O',.9,-.9,-.9],['H',-1.7,1.2,-.9],['H',1.7,-1.2,-.9]],bonds:[[0,1],[0,2],[0,3],[0,4],[3,5],[4,6]]},
NaCl:{name:'氯化鈉',kind:'式單位',atoms:[['Na',-.6,0,0],['Cl',.6,0,0]],bonds:[]},
Al2O3:{name:'氧化鋁',kind:'式單位',atoms:[['Al',-.6,-.5,0],['Al',.6,-.5,0],['O',-1,.5,0],['O',0,.5,0],['O',1,.5,0]],bonds:[]}};

