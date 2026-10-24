export function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function metric(label,value,unit=''){return '<div class="metric"><span>'+label+'</span><strong>'+value+' <small>'+unit+'</small></strong></div>';}
export function ExplorationWorkbench(scene,controls,note=''){return '<div class="workbench"><div class="model-column"><div class="scene">'+scene+'</div><p class="model-note">'+note+'</p></div><aside class="experiment-controls">'+controls+'</aside></div>';}
export function numberField(id,label,value,min,max,step,unit){return '<div class="number-field"><label for="'+id+'">'+label+' <span>'+unit+'</span></label><div class="number-pair"><input id="'+id+'" type="number" min="'+min+'" max="'+max+'" step="any" value="'+value+'" inputmode="decimal" aria-describedby="'+id+'-error"><input aria-label="'+label+'滑桿" type="range" min="'+min+'" max="'+max+'" step="any" data-step="'+step+'" value="'+value+'" data-pair="'+id+'"></div><span class="field-error" id="'+id+'-error" role="status"></span></div>';}
export function bindNumber(root,id,callback){
 const input=root.querySelector('#'+id),range=root.querySelector('[data-pair="'+id+'"]'),error=root.querySelector('#'+id+'-error');
 const min=Number(input.min),max=Number(input.max),step=Number(range.dataset.step)||1;
 const exact=n=>Number(n.toPrecision(12));
 function commit(n){input.value=String(n);range.value=String(n);input.setCustomValidity('');error.textContent='';callback(n);const other=root.querySelector('input:invalid');if(other){root.querySelectorAll('[data-run],.step').forEach(b=>b.disabled=true);guideStep(root,'還有一個數字需要修正','把標示的欄位改好，再繼續操作。','#'+other.id);}}
 function invalid(){input.setCustomValidity('請輸入範圍內的數字');error.textContent='請輸入 '+min+'～'+max+'；材料用量暫時保持原來的設定。';root.querySelectorAll('[data-run],.step').forEach(b=>b.disabled=true);guideStep(root,'先修正輸入的數字',error.textContent,'#'+id);}
 function handler(event){const raw=event.target.value,n=Number(raw);if(raw===''||!Number.isFinite(n)||n<min||n>max){invalid();return;}commit(event.target===range?exact(Math.max(min,Math.min(max,min+Math.round((n-min)/step)*step))):n);}
 input.addEventListener('input',handler);range.addEventListener('input',handler);
 range.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const current=Number(range.value),next=e.key==='Home'?min:e.key==='End'?max:current+(['ArrowRight','ArrowUp'].includes(e.key)?step:-step);commit(exact(Math.max(min,Math.min(max,next))));});
 return v=>{input.value=String(v);range.value=String(v);input.setCustomValidity('');error.textContent='';};
}
export function makeDraggable(button,target,onDrop,status){
 let gesture=null,suppress=false;
 const inside=(x,y,r)=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
 const hits=e=>{const r=target.getBoundingClientRect();return inside(e.clientX,e.clientY,r)||(gesture&&inside(e.clientX+gesture.offsetX,e.clientY+gesture.offsetY,r));};
 const reset=()=>{button.style.transform='';button.classList.remove('dragging');target.classList.remove('drop-active');target.classList.remove('drop-ready');target.removeAttribute?.('data-drop-hint');gesture=null;};
 const cancel=()=>{if(!gesture)return;suppress=true;reset();if(status)status.textContent='已取消拿取，材料放回原位。';};
 button.addEventListener('pointerdown',e=>{if(e.button!==0||button.disabled)return;const r=button.getBoundingClientRect?.();suppress=false;gesture={x:e.clientX,y:e.clientY,pointer:e.pointerId,moved:false,offsetX:r?(r.left+r.right)/2-e.clientX:0,offsetY:r?(r.top+r.bottom)/2-e.clientY:0};button.focus?.({preventScroll:true});button.setPointerCapture(e.pointerId);});
 button.addEventListener('pointermove',e=>{if(!gesture)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.hypot(dx,dy)>5)gesture.moved=true;if(gesture.moved){e.preventDefault?.();button.classList.add('dragging');target.classList.add('drop-active');const hit=hits(e);if(hit)target.classList.add('drop-ready');else target.classList.remove('drop-ready');target.setAttribute?.('data-drop-hint',hit?'放手就能放入':'把材料移到這裡 · Esc 可取消');button.style.transform='translate('+dx+'px,'+dy+'px)';}});
 button.addEventListener('pointerup',e=>{if(!gesture)return;const moved=gesture.moved,hit=hits(e);suppress=moved;reset();if(moved){if(hit)onDrop();else if(status)status.textContent='沒有放入，材料已回到原位。拖進標示區再放手，或直接點材料。';}});
 button.addEventListener('pointercancel',cancel);button.addEventListener('lostpointercapture',cancel);
 button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')suppress=false;if(e.key==='Escape'&&gesture){e.preventDefault?.();cancel();}});
 button.addEventListener('click',e=>{if(suppress){suppress=false;e.preventDefault();return;}if(!button.disabled)onDrop();});
}
export function reactionClock(update,finish){let progress=0,timer=null,last=0;const stop=()=>{if(timer)clearInterval(timer);timer=null;};return{start(){if(progress>=1)progress=0;if(timer)return;last=performance.now();timer=setInterval(()=>{const t=performance.now();progress=Math.min(1,progress+Math.max(0,t-last)/5000);last=t;update(progress,true);if(progress===1){stop();update(progress,false);finish();}},60);},pause(){stop();update(progress,false);},step(){stop();const before=progress;progress=Math.min(1,Math.round((progress+.1)*1e9)/1e9);update(progress,false);if(before<1&&progress===1)finish();},reset(){stop();progress=0;update(0,false);},get running(){return timer!==null;},get progress(){return progress;}};}
export function notice(root,text){root.querySelector('.activity-status').textContent=text;}


export function WorkflowSteps(labels,step){return '<ol class="workflow-steps" aria-label="實驗步驟">'+labels.map((label,i)=>'<li class="'+(i<step?'done':i===step?'current':'')+'"><span>'+(i<step?'✓':i+1)+'</span>'+label+'</li>').join('')+'</ol>';}
export function matchedMassPair(records){for(const closed of [...records].reverse().filter(r=>r.closed)){const open=[...records].reverse().find(r=>!r.closed&&Math.abs(r.soda-closed.soda)<1e-8&&Math.abs(r.acid-closed.acid)<1e-8);if(open)return{open,closed};}return null;}
export function massTrace(initial,reading,progress){
 const delta=reading-initial,x=55+600*progress,y=42-delta*14;
 return '<div class="mass-trace"><svg viewBox="0 0 720 225" role="img" aria-label="目前實驗的質量變化 '+delta.toFixed(3)+' 公克"><text x="55" y="23" font-size="12" fill="#536e62">和反應前相比，變重或變輕多少（g）</text>'+[0,5,10].map(v=>'<path d="M55 '+(42+v*14)+'H655" stroke="#dbe4d8" stroke-dasharray="3 5"/><text x="41" y="'+(46+v*14)+'" text-anchor="end" font-size="11" fill="#718473">'+(-v)+'</text>').join('')+'<path d="M55 42V183H655" fill="none" stroke="#9dae9e"/><path d="M55 42L'+x+' '+y+'" fill="none" stroke="#527d64" stroke-width="3"/><circle cx="'+x+'" cy="'+y+'" r="5" fill="#b99657" stroke="#fff" stroke-width="2"/><text x="55" y="204" font-size="11" fill="#718473">0%</text><text x="655" y="204" text-anchor="end" font-size="11" fill="#718473">100% 觀察進度</text></svg><p>本次質量變化 <strong>'+Number(delta.toFixed(3))+' g</strong>；負數表示天平比反應前更輕。</p></div>';
}


// One short next action; repeated animation frames do not re-announce unchanged guidance.
export function guideStep(root,title,detail,selector=''){
 let guide=root.querySelector('.interaction-guide');
 if(!guide){guide=document.createElement('div');guide.className='interaction-guide';guide.setAttribute('role','status');guide.setAttribute('aria-live','polite');guide.innerHTML='<span class="guide-icon" aria-hidden="true">↗</span><div><b class="guide-title"></b><p class="guide-detail"></p></div><span class="guide-label">操作小提示</span>';root.prepend(guide);}
 if(guide.querySelector('.guide-title').textContent!==title)guide.querySelector('.guide-title').textContent=title;
 if(guide.querySelector('.guide-detail').textContent!==detail)guide.querySelector('.guide-detail').textContent=detail;
 root.querySelectorAll('.next-action').forEach(x=>x.classList.remove('next-action'));
 if(selector)root.querySelector(selector)?.classList.add('next-action');
}
