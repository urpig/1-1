import { labBody, massBody, stoichBody } from './apparatus.js';
import { elements, format, parseFormula } from './core.js';
let svgSerial=0;
export function svgFrame(body,label,viewBox='0 0 760 440'){const prefix='chem-svg-'+(++svgSerial)+'-';return ('<svg viewBox="'+viewBox+'" role="img" aria-label="'+label+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="glass" x1="0" x2="1"><stop stop-color="#d9ecea" stop-opacity=".6"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".35"/><stop offset="1" stop-color="#9cbfbe" stop-opacity=".55"/></linearGradient><linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e8efeb"/><stop offset=".4" stop-color="#a5b4b0"/><stop offset="1" stop-color="#cbd5d0"/></linearGradient><linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b9dbd9" stop-opacity=".45"/><stop offset="1" stop-color="#77afa7" stop-opacity=".7"/></linearGradient><radialGradient id="shine"><stop stop-color="#fff"/><stop offset=".3" stop-color="#fffbd5" stop-opacity=".8"/><stop offset="1" stop-color="#f6d987" stop-opacity="0"/></radialGradient></defs>'+body+'</svg>').replace(/ id="([^"]+)"/g,(_,id)=>' id="'+prefix+id+'"').replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');}
function label(x,y,text,size=15,color='#536e65'){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="'+color+'">'+text+'</text>';}
export function laboratoryArt(id,state){return svgFrame(labBody(id,state),'實體器材式化學探索工作台');}
export function massArt(result,state){return svgFrame(massBody(result,state),'電子天平、反應瓶與集氣裝置；讀數 '+format(result.reading)+' 公克');}
export function stoichiometryArt(formula,mass,products,options={}){return svgFrame(stoichBody(formula,mass,products,options),'反應物與生成物的理論質量展示');}
export function molecularSVG(model,{angle=0,tilt=.3,zoom=1,counts=null}={}){
const atoms=model.atoms.map(([e,x,y,z],i)=>{const x1=x*Math.cos(angle)+z*Math.sin(angle),z1=-x*Math.sin(angle)+z*Math.cos(angle),y1=y*Math.cos(tilt)-z1*Math.sin(tilt),depth=y*Math.sin(tilt)+z1*Math.cos(tilt);return{e,x:380+x1*87*zoom,y:207+y1*87*zoom,z:depth,i};});
let visible=atoms;
if(counts){const used={};visible=atoms.filter(a=>(used[a.e]=(used[a.e]||0)+1)<= (counts[a.e]||0));}
const visibleIds=new Set(visible.map(a=>a.i));
let s='<rect width="760" height="440" rx="14" fill="#f3f7f3"/><ellipse cx="380" cy="354" rx="200" ry="25" fill="#becbb5" opacity=".23"/>';
s+='<g color="#bda774" opacity=".55">'+alchemyRing(380,207,168,visible.length/model.atoms.length)+'</g>'+label(380,38,'拖曳旋轉 · 方向鍵也能操作',12);for(const a of atoms.filter(a=>!visibleIds.has(a.i)))s+='<circle class="atom-socket" cx="'+a.x+'" cy="'+a.y+'" r="'+(a.e==='H'?22:36)*zoom+'" fill="#ffffff55" stroke="#a6bbb0" stroke-width="1.5" stroke-dasharray="4 5"/>'+label(a.x,a.y+5,a.e,14,'#8da598');
for(const [a,b]of model.bonds)if(visibleIds.has(a)&&visibleIds.has(b))s+='<line x1="'+atoms[a].x+'" y1="'+atoms[a].y+'" x2="'+atoms[b].x+'" y2="'+atoms[b].y+'" stroke="#aebeb5" stroke-width="'+(15*zoom)+'" stroke-linecap="round"/>';
for(const a of visible.sort((a,b)=>a.z-b.z)){const radius=(a.e==='H'?22:36)*zoom*(1+a.z*.06),col=elements[a.e].color;
s+='<defs><radialGradient id="atom-'+a.i+'" cx="30%" cy="25%"><stop stop-color="#fff"/><stop offset=".32" stop-color="'+col+'"/><stop offset="1" stop-color="'+col+'" stop-opacity=".8"/></radialGradient></defs><circle cx="'+a.x+'" cy="'+a.y+'" r="'+radius+'" fill="url(#atom-'+a.i+')" stroke="#536e65" stroke-opacity=".4" stroke-width="1.5"/>'+label(a.x,a.y+6,a.e,18*zoom,a.e==='C'?'#fff':'#233e36');
}
s+=label(380,400,model.kind==='式單位'?'組成比例示意 · 不是獨立分子或實際晶格':'球棍模型 · 原子大小與鍵長為教學示意',14);
return svgFrame(s,'可旋轉的'+model.name+model.kind+'模型');
}
export function particleGroup(formula,count){
 const list=Object.entries(parseFormula(formula)).flatMap(([e,n])=>Array(n).fill(e));
 const geometries={H2:[[24,30],[48,30]],O2:[[24,30],[48,30]],H2O:[[18,38],[54,38],[36,23]],H2O2:[[12,41],[60,20],[27,25],[45,36]],Mg:[[36,30]],MgO:[[24,30],[48,30]],Fe:[[36,30]],Fe2O3:[[24,17],[49,17],[15,40],[36,40],[58,40]]};
 const points=geometries[formula]||list.map((_,i)=>[13+i*13,30]);
 const bonds={H2:[[0,1]],O2:[[0,1]],H2O:[[0,2],[1,2]],H2O2:[[0,2],[2,3],[3,1]]}[formula]||[];
 return '<div class="particle-groups">'+Array.from({length:count},()=>'<span class="particle-cluster" aria-label="'+formula+' 一組"><svg viewBox="0 0 72 60" aria-hidden="true">'+bonds.map(([a,b])=>'<line data-bond="'+list[a]+'-'+list[b]+'" x1="'+points[a][0]+'" y1="'+points[a][1]+'" x2="'+points[b][0]+'" y2="'+points[b][1]+'" stroke="#afbeb2" stroke-width="5"/>').join('')+list.map((e,i)=>'<circle cx="'+points[i][0]+'" cy="'+points[i][1]+'" r="'+(e==='H'?8:11)+'" fill="'+elements[e].color+'" stroke="#869d91"/><text x="'+points[i][0]+'" y="'+(points[i][1]+3)+'" text-anchor="middle" font-size="8" fill="#294236">'+e+'</text>').join('')+'</svg></span>').join('')+'</div>';
}
export function bookArt(){return svgFrame('<rect width="760" height="440" fill="#e8eddf"/><circle cx="380" cy="200" r="150" fill="none" stroke="#b2a571" stroke-width="2"/><path d="M380 40L518 280H242Z" fill="none" stroke="#b2a571" stroke-width="2"/><path d="M165 150Q265 120 380 170Q495 120 595 150V332Q484 303 380 350Q267 302 165 332Z" fill="#e1cf9d" stroke="#8e7c52" stroke-width="5"/><path d="M380 170V350" stroke="#9d8c61" stroke-width="3"/>'+label(380,80,'從一個疑問開始',22)+label(272,226,'物理變化',23)+label(490,226,'化學變化',23)+label(272,269,'形態改變',17)+label(490,269,'形成新物質',17),'打開的古書與觀察問題');}


// Original geometric teaching emblem; progress is supplied by the scientific model.
export function alchemyRing(cx,cy,r,progress=0){
 const p=Math.max(0,Math.min(1,progress)),point=(a,scale)=>[Math.cos(a)*r*scale,Math.sin(a)*r*scale].map(n=>n.toFixed(2)).join(',');
 const polygon=(n,scale,rotation)=>Array.from({length:n},(_,i)=>point(rotation+i*2*Math.PI/n,scale)).join(' ');
 return '<g class="alchemy-ring" transform="translate('+cx+' '+cy+')" fill="none" stroke="currentColor" aria-hidden="true"><circle r="'+r+'" stroke-width="1.1"/><circle r="'+r*.94+'" stroke-width=".6"/><circle r="'+r*.75+'" stroke-width=".7"/><polygon points="'+polygon(3,.87,-Math.PI/2)+'" stroke-width="1"/><polygon points="'+polygon(4,.67,Math.PI/4)+'" stroke-width=".7"/>'+Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return '<line x1="'+Math.cos(a)*r*.95+'" y1="'+Math.sin(a)*r*.95+'" x2="'+Math.cos(a)*r*(i%4===0?.89:.92)+'" y2="'+Math.sin(a)*r*(i%4===0?.89:.92)+'" stroke-width="'+(i%4===0?1:.6)+'"/>';}).join('')+Array.from({length:3},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/3;return '<circle cx="'+Math.cos(a)*r*.87+'" cy="'+Math.sin(a)*r*.87+'" r="'+r*.034+'" fill="#fcfaf0"/>';}).join('')+'<circle class="alchemy-progress" r="'+r*.81+'" pathLength="100" transform="rotate(-90)" stroke-width="3" stroke-linecap="round" stroke-dasharray="'+p*100+' 100"/></g>';
}
export function alchemySeal(value,caption,progress=0){return svgFrame('<g color="#b49a5e">'+alchemyRing(120,120,105,progress)+'</g><circle cx="120" cy="120" r="51" fill="#fcfaf0" stroke="#dbcfac"/><text x="120" y="119" text-anchor="middle" fill="#365847" font-size="25" font-family="Georgia,serif">'+value+'</text><text x="120" y="141" text-anchor="middle" fill="#69795f" font-size="11">'+caption+'</text>','煉成陣：'+caption+' '+value,'0 0 240 240');}
