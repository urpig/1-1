import { format, formulaHTML, reactions } from './core.js';
export function labMassComparison(id,masses,result,progress){
 const productMass=result.products.reduce((sum,x)=>sum+x.mass,0),leftMass=result.remaining.reduce((sum,x)=>sum+x.mass,0),total=result.inputMass;
 const contents=items=>items.map(x=>formulaHTML(x.formula)+' '+format(x.mass)+' g').join(' ＋ ');
 const before=reactions[id].left.map((formula,i)=>({formula,mass:masses[i]}));
 const bar=(mass,cls)=>'<span class="'+cls+'" style="width:'+(total>0?Math.min(100,mass/total*100):0)+'%"></span>';
 let note='把產物與剩餘材料都計入，才能公平比較反應前後的總重。';
 if(id==='magnesium'&&progress>=1&&productMass>0){const mgUsed=masses[0]-result.remaining[0].mass,oxygenUsed=masses[1]-result.remaining[1].mass;note='反應掉的鎂 '+format(mgUsed)+' g ＋ 結合的氧氣 '+format(oxygenUsed)+' g ＝ 氧化鎂 '+format(productMass)+' g。增加的重量來自氧氣。';}
 return '<section id="lab-mass-comparison" class="reaction-mass-board" aria-label="反應前後的質量比較"><div class="mass-board-heading"><span>每一克，都有去向</span><b>反應前後重量對照</b></div><div class="mass-total-pair"><div><span>反應前 · 材料總重</span><strong>'+format(total)+' <small>g</small></strong><p>'+contents(before)+'</p><div class="mass-composition-bar">'+bar(total,'mass-input')+'</div></div><span class="mass-equal" aria-hidden="true">＝</span><div><span>'+(progress>=1?'反應後':'目前')+' · 全部物質總重</span><strong>'+format(result.outputMass)+' <small>g</small></strong><p>產物 '+format(productMass)+' g ＋ 剩餘材料 '+format(leftMass)+' g</p><div class="mass-composition-bar">'+bar(productMass,'mass-products')+bar(leftMass,'mass-leftover')+'</div></div></div><div class="mass-breakdown"><div><i class="products-key"></i><span>形成的產物</span><b>'+format(productMass)+' g</b><p>'+contents(result.products)+'</p></div><div><i class="leftover-key"></i><span>尚未反應的材料</span><b>'+format(leftMass)+' g</b><p>'+contents(result.remaining)+'</p></div></div><p class="mass-explanation">'+note+'</p></section>';
}
