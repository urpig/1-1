import { mountHandoutPractice } from './handout-practice.js';
import { finaleSteps } from './story-journey.js';
import { practiceProblems } from './data.js';
import { bookArt, svgFrame } from './art.js';
import { format, elements } from './core.js';
import { escapeHTML } from './components.js';
export function mountStory(root,card,ctx){
if(card.type==='story'){
root.innerHTML='<div class="observation-cards"><button data-observe="ice"><span class="comparison-icon ice">H₂O<br>❄ → 💧</span><b>冰融成水</b><small>點擊查看微粒</small><p hidden>前後都是 H₂O，只改變狀態。</p></button><button data-observe="rust"><span class="comparison-icon rust">Fe → 鐵鏽</span><b>鐵釘生鏽</b><small>點擊查看組成</small><p hidden>生成與鐵不同的鐵鏽等新物質。</p></button><button data-observe="stone"><span class="comparison-icon stone">◆ → ◇ ◇</span><b>切碎礦石</b><small>點擊查看變化</small><p hidden>礦石變小，不等於元素變成黃金。</p></button></div><p class="activity-status" role="status">先留下猜想，再比較三種變化。</p>';
let seen=new Set(ctx.data.comparisons||[]);
root.querySelectorAll('[data-observe]').forEach(b=>{const reveal=()=>{b.querySelector('p').hidden=false;b.classList.add('observed');};if(seen.has(b.dataset.observe))reveal();b.onclick=()=>{if(!ctx.predict())return;reveal();seen.add(b.dataset.observe);ctx.data.comparisons=[...seen];ctx.save();root.querySelector('.activity-status').textContent='已比較 '+seen.size+' / 3；判斷重點是新物質。';if(seen.size===3)ctx.mark('compared');};});return{reset(){seen.clear();ctx.data.comparisons=[];root.querySelectorAll('[data-observe]').forEach(b=>{b.classList.remove('observed');b.querySelector('p').hidden=true;});}};
}
if(card.type==='practice')return mountHandoutPractice(root,ctx);
if(card.type==='final'){
let guideStep=ctx.data.finalGuideStep||0;
root.innerHTML='<div class="final-prediction"><span class="eyebrow">最後的判斷 · 賢者之石的考驗</span><h3>'+card.prediction+'</h3>'+card.choices.map((x,i)=>'<button class="secondary final-choice" data-final-choice="'+i+'" aria-pressed="'+(ctx.data.finalPrediction===i)+'">'+x+'</button>').join('')+'<p>先留下現在的想法，再跟著阿公的三個問題檢查證據。</p></div><div class="final-findings" '+(ctx.data.finalPrediction===undefined?'hidden':'')+'><section class="final-guide" aria-label="阿公引導的三步推理"><div class="final-guide-heading"><span class="eyebrow">阿公的三個問題</span><span class="final-guide-count"></span></div><div class="final-guide-stage" aria-live="polite"></div><div class="button-row"><button class="secondary final-guide-back">← 回到上一個問題</button><button class="primary final-guide-next">接著想下一個問題 →</button></div></section><div class="final-conclusion"><div class="truth-panel"><div class="gold-element"><span>79</span><b>Au</b><small>金 · 79 個質子</small></div><div><h3>提取黃金，與把其他元素變成金</h3><div class="truth-compare"><p><b>含 Au 的礦石 → 提取 Au</b><br>礦石裡本來就有金，把它取出來，不是把其他元素變成金。</p><p><b>其他元素 → Au</b><br>要靠核反應改變原子核，讓它有 79 個質子。一般化學反應做不到。</p></div></div></div><p class="nuclear-note">阿公補充：「有些核反應能產生金，但通常花很多錢，只得到一點點，不是划算的造金方法。」賢者之石是故事裡的傳說，沒有科學證據證明它能點石成金。</p><div class="evidence-board"><h3>選出能支持結論的三條證據</h3>'+['化學反應是原子重新排列','一般化學反應前後，每種原子都一樣多','看原子核有幾個質子，就知道是哪種元素','只要變成金黃色，就是金'].map((s,i)=>'<label class="check-line"><input type="checkbox" data-evidence="'+i+'">'+s+'</label>').join('')+'<label class="reason-label">用自己的話解釋：為什麼真正轉變元素需要核反應？<textarea rows="3" maxlength="600" class="final-reason" placeholder="一般化學反應只會……；金的原子核有……，所以把其他元素變成金必須……"></textarea></label><button class="primary save-reason">整理我的證據</button><p class="activity-status" role="status"></p></div><div class="prediction-revisit"></div></div></div>';
function drawGuide(){
 const step=finaleSteps[guideStep];
 root.querySelector('.final-guide-stage').innerHTML='<h3>'+step.title+'</h3>'+ctx.renderDialogue(step.dialogue)+'<p class="final-guide-clue">'+step.clue+'</p>';
 root.querySelector('.final-guide-count').textContent=(guideStep+1)+' / '+finaleSteps.length;
 root.querySelector('.final-guide-back').disabled=guideStep===0;
 root.querySelector('.final-guide-next').disabled=guideStep===finaleSteps.length-1;
 root.querySelector('.final-guide-next').textContent=guideStep===finaleSteps.length-1?'✓ 接著整理下方證據':'接著想下一個問題 →';
 root.querySelector('.final-conclusion').hidden=guideStep<finaleSteps.length-1;
}
root.querySelector('.final-guide-back').onclick=()=>{guideStep=Math.max(0,guideStep-1);ctx.data.finalGuideStep=guideStep;ctx.save();drawGuide();};
root.querySelector('.final-guide-next').onclick=()=>{guideStep=Math.min(finaleSteps.length-1,guideStep+1);ctx.data.finalGuideStep=guideStep;ctx.save();drawGuide();};
root.querySelectorAll('[data-final-choice]').forEach(b=>b.onclick=()=>{ctx.data.finalPrediction=Number(b.dataset.finalChoice);ctx.save();root.querySelectorAll('[data-final-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));root.querySelector('.final-findings').hidden=false;root.dispatchEvent(new CustomEvent('chem:final-prediction',{bubbles:true}));});
root.querySelector('.final-reason').value=ctx.data.finalReason||'';root.querySelectorAll('[data-evidence]').forEach(x=>x.checked=(ctx.data.finalEvidence||[]).includes(Number(x.dataset.evidence)));
root.querySelector('.save-reason').onclick=()=>{if(!ctx.predict())return;const selected=[...root.querySelectorAll('[data-evidence]:checked')].map(x=>Number(x.dataset.evidence)),reason=root.querySelector('.final-reason').value.trim();ctx.data.finalReason=reason;ctx.data.finalEvidence=selected;ctx.save();if(selected.length===3&&[0,1,2].every(x=>selected.includes(x))&&reason.length>=12){ctx.mark('evidence-explanation');root.querySelector('.activity-status').textContent='✓ 已存下你的說明。檢查一下：有沒有說到「化學反應只換組合，質子數不變；要變成另一種元素，需要改變原子核」？文字內容不會自動判分，可以請老師一起看看。';}else root.querySelector('.activity-status').textContent='應選前面三條證據；金黃色不是金元素的證明。再寫至少 12 個字，說明化學反應與改變原子核的差別。';};
drawGuide();
return{reset(){root.querySelectorAll('input').forEach(x=>x.checked=false);root.querySelector('textarea').value='';ctx.data.finalReason='';ctx.data.finalEvidence=[];delete ctx.data.finalPrediction;guideStep=0;ctx.data.finalGuideStep=0;drawGuide();root.querySelectorAll('[data-final-choice]').forEach(b=>b.setAttribute('aria-pressed','false'));root.querySelector('.final-findings').hidden=true;}};
}
let step=Math.min(Number(ctx.data['step'+card.id]||0),card.type==='mole'?4:card.type==='symbols'?3:2),timer=null;
const limit=card.type==='mole'?4:card.type==='symbols'?3:2;
root.innerHTML='<div class="guided-observation"><div class="guided-stage"></div><div class="button-row"><button class="secondary step-back">← 上一格</button><button class="primary step-next">下一格 →</button><button class="secondary step-play">播放／暫停</button><button class="text-button step-reset">重播</button><span class="step-count"></span></div><div class="activity-status" role="status"></div></div>';
function atomic(){
const from=[[160,170],[205,170],[320,170],[365,170],[525,170],[575,170]],to=[[205,230],[275,230],[485,230],[555,230],[240,175],[520,175]],colors=['H','H','H','H','O','O'];
let body='<rect width="760" height="360" rx="12" fill="#edf2e7"/>';
if(step===0)body+='<path d="M160 170H205M320 170H365M525 170H575" stroke="#9eafa6" stroke-width="12"/>';
if(step===2)body+='<path d="M205 230L240 175L275 230M485 230L520 175L555 230" stroke="#9eafa6" stroke-width="12"/>';
body+=colors.map((e,i)=>{const pos=step===0?from[i]:step===2?to[i]:[100+i*110,180+(i%2)*55];return '<g class="tracking-atom" style="transform:translate('+pos[0]+'px,'+pos[1]+'px)"><circle r="'+(e==='H'?22:29)+'" fill="'+elements[e].color+'" stroke="#718b7d"/><text y="6" text-anchor="middle" fill="#263e33" font-size="18">'+e+'</text><text y="48" text-anchor="middle" fill="#65796b" font-size="12">'+(i+1)+'</text></g>';}).join('');
body+='<text x="380" y="52" text-anchor="middle" fill="#2b4d3a" font-size="23">'+['反應前：2H₂ ＋ O₂','示意：舊的連結改變，原子重新組合','反應後：2H₂O'][step]+'</text><text x="380" y="327" text-anchor="middle" fill="#526c5a" font-size="17">H：4 → 4　　O：2 → 2　　原子沒有消失</text>';
return svgFrame(body,'氫和氧重新排列成水的六顆原子追蹤圖','0 0 760 360')+'<div class="atom-identity"><div><h3>看質子數，分辨是哪種元素</h3><p>質子 p⁺：正電；中子 n：無電；電子 e⁻：負電。原子核內有質子與中子。</p><p><b>原子序 Z＝質子數</b><br>質量數 A＝質子數＋中子數</p></div><table><thead><tr><th>同位素</th><th>p⁺</th><th>n</th><th>中性原子 e⁻</th></tr></thead><tbody><tr><th>碳-12</th><td>6</td><td>6</td><td>6</td></tr><tr><th>碳-14</th><td>6</td><td>8</td><td>6</td></tr></tbody></table></div><p class="model-note">動畫把原子分開畫，方便追蹤。真實反應不一定會先變成一顆顆分開的原子。</p>';
}
function mole(){const slides=[
['從熟悉的計數開始','一打＝12 個','<div class="dozen">'+Array(12).fill('<i></i>').join('')+'</div><p>「一打」只告訴我們數量；一打雞蛋和一打橘子不會一樣重。</p>'],
['原子很小，要用更大的計數單位','1 mol ≈ 6.02×10²³ 個','<p>完整數字約為 602,000,000,000,000,000,000,000。這是數量，不是大小或體積。</p><p>現行定義：1 mol 恰好含 6.02214076×10²³ 個指定粒子。本章計算用約 6.02×10²³；講義常用約 6×10²³，依題目指定的近似值計算。</p>'],
['同樣多，不一定同樣重','1 mol H₂O：18 g　｜　1 mol CO₂：44 g','<p>兩者都有約 6.02×10²³ 個分子，但每個 CO₂ 分子比 H₂O 分子重。</p><p>莫耳質量 M：每一莫耳有幾克，單位 g/mol。</p>'],
['把質量、莫耳、粒子數接起來','m ÷ M → n → n × Nₐ','<p>36 g H₂O ÷18 g/mol＝2 mol；2×6.02×10²³≈1.204×10²⁴ 個水分子。</p><p>反向計算：n＝N/Nₐ，m＝nM。</p>'],
['縮小到單一分子','一個 H₂O 約 2.99×10⁻²³ g','<p>18 g/mol ÷6.02×10²³ mol⁻¹＝2.99×10⁻²³ g。</p><p>0.5 mol 是半莫耳，裡面仍有很多個完整水分子。數分子時是 1 個、2 個，沒有半個完整水分子。算出的巨大數字通常是近似值。</p>']];
const [a,b,c]=slides[step];return '<div class="scale-slide"><span class="eyebrow">'+a+'</span><h3>'+b+'</h3>'+c+'</div>';}
function symbols(){const lines=['H₂O₂ → H₂O ＋ O₂','2H₂O₂ → 2H₂O ＋ O₂','2H₂O₂(aq) → 2H₂O(l) ＋ O₂(g)','2H₂O₂(aq) — MnO₂ → 2H₂O(l) ＋ O₂(g)'],info=['左邊是反應物，右邊是生成物。＋把同側物質分開；→指出反應方向。這一格尚未配平。','係數 2 表示兩份；下標 ₂ 表示一份內的組成。現在已配平，不能再改下標。','aq 是水溶液；l 是液體；g 是氣體；s 是固體。O₂(g) 也常在適合的反應式中以 ↑ 表示氣體跑出來。','MnO₂ 放在箭號附近表示催化劑。Δ 表示加熱；↓表示生成沉澱。催化劑不是這裡的反應物或生成物。'];return '<div class="symbol-stage"><span class="eyebrow">化學反應式的第 '+(step+1)+' 層</span><div class="large-equation">'+lines[step]+'</div><p>'+info[step]+'</p><div class="symbol-key">'+['＋ 分隔物質','→ 反應方向','係數 整份數量','下標 組成','Δ 加熱','催化劑 改變快慢','↑ 氣體','↓ 沉澱','s 固體','l 液體','g 氣體','aq 水溶液'].map(x=>'<span>'+x+'</span>').join('')+'</div></div>';}
function ratios(){return '<div class="ratio-stage"><div class="large-equation">2H₂O₂ → 2H₂O ＋ O₂</div><table><thead><tr><th>比較項目</th><th>H₂O₂</th><th>H₂O</th><th>O₂</th></tr></thead><tbody><tr><th>係數／分子數比</th><td>2</td><td>2</td><td>1</td></tr>'+(step>=1?'<tr><th>莫耳數</th><td>2 mol</td><td>2 mol</td><td>1 mol</td></tr><tr><th>莫耳質量</th><td>34 g/mol</td><td>18 g/mol</td><td>32 g/mol</td></tr>':'')+(step>=2?'<tr class="highlight"><th>質量</th><td>68 g</td><td>36 g</td><td>32 g</td></tr>':'')+'</tbody></table><p class="formula-line">'+['前面的係數表示分子數的比例，這裡是 2：2：1。','莫耳數比相同，但每一莫耳的質量不同。','68 g＝36 g＋32 g　｜　質量比 17：9：8'][step]+'</p></div>';}
function draw(){root.querySelector('.guided-stage').innerHTML=card.type==='atoms'?atomic():card.type==='mole'?mole():card.type==='symbols'?symbols():ratios();root.querySelector('.step-count').textContent=(step+1)+' / '+(limit+1)+' 格';root.querySelector('.step-back').disabled=step===0;root.querySelector('.step-next').disabled=step===limit;ctx.data['step'+card.id]=step;ctx.save();if(step===limit)ctx.mark('observed-steps');}
function stop(){if(timer)clearInterval(timer);timer=null;root.querySelector('.step-play').textContent='播放／暫停';}
root.querySelector('.step-next').onclick=()=>{if(!ctx.predict())return;stop();step=Math.min(limit,step+1);draw();};
root.querySelector('.step-back').onclick=()=>{stop();step=Math.max(0,step-1);draw();};
root.querySelector('.step-reset').onclick=()=>{stop();step=0;draw();};
root.querySelector('.step-play').onclick=()=>{if(!ctx.predict())return;if(timer){stop();return;}if(step===limit)step=0;draw();root.querySelector('.step-play').textContent='暫停';timer=setInterval(()=>{step=Math.min(limit,step+1);draw();if(step===limit)stop();},2400);};draw();
return{reset(){stop();step=0;draw();}};
}

