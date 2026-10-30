// Navigation and presentation enhancements; calculations and saved answers stay in app.js.
const icons=[
'<path d="M10 3h12m-9 0v9L6 25a3 3 0 0 0 3 4h14a3 3 0 0 0 3-4l-7-13V3M10 20h12"/><circle cx="14" cy="24" r=".7"/><circle cx="19" cy="18" r=".7"/>',
'<path d="M16 4v24M7 28h18M5 10h22M7 10l-4 9h8l-4-9Zm18 0-4 9h8l-4-9ZM3 20q4 5 8 0m10 0q4 5 8 0"/><circle cx="16" cy="8" r="2"/>',
'<circle cx="16" cy="16" r="4"/><circle cx="6" cy="8" r="3"/><circle cx="26" cy="8" r="3"/><circle cx="16" cy="28" r="3"/><path d="m8 10 5 4m6 0 5-4m-8 10v5"/>',
'<path d="M4 7h8M8 3v8M21 5h7M21 9h7M5 23h20m-5-5 5 5-5 5"/><circle cx="8" cy="23" r="3"/>',
'<path d="M6 3h20v26H6zM10 8h12M10 13h3m6 0h3m-12 5h3m6 0h3m-12 5h3m6 0h3"/>'
];
const stopInfo={3:['原子與莫耳','先理解質量與微粒的關係'],1:['反應的現象','從變化找出新物質'],4:['寫出反應式','先寫化學式，再配平係數'],5:['算出產量','看示範，練習莫耳比例'],2:['驗證質量守恆','親手操作，追蹤每一克']};
export function mountPolish(cards){
 const stops=cards.map(c=>stopInfo[c.id]);
 const route=document.querySelector('#chapter-route'), map=document.querySelector('.expedition-stations');
 map.innerHTML=stops.map((s,i)=>'<a class="expedition-stop" href="#chem-'+cards[i].id+'"><span class="stop-top"><svg class="stop-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[cards[i].id-1]+'</svg><span class="stop-number">0'+(i+1)+'</span></span><b>'+s[0]+'</b><span class="stop-arrow" aria-hidden="true">↗</span></a>').join('');
 const sheets=[...document.querySelectorAll('.learning-card')];
 sheets.forEach((sheet,index)=>{
  const header=sheet.querySelector('.card-header');header.dataset.chapterNumber=String(index+1).padStart(2,'0');
  const waypoints=document.createElement('nav');waypoints.className='card-waypoints';waypoints.setAttribute('aria-label','第 '+(index+1)+' 站的學習步驟');
  const steps=[['讀線索','.story-opening'],[cards[index].type==='phenomena'?'看反應':'動手探索','.activity'],['小試身手','.quiz']];
  steps.forEach(([label,selector],i)=>{
   const button=document.createElement('button');button.type='button';button.innerHTML='<span aria-hidden="true">'+(i+1)+'</span>'+label;
   button.addEventListener('click',()=>{
    const target=sheet.querySelector(selector);if(selector==='.activity')sheet.querySelector('.foundation-lesson')?.dispatchEvent(new Event('foundation:activity'));target.setAttribute('tabindex','-1');
    target.scrollIntoView({behavior:document.documentElement.classList.contains('reduce-motion')?'auto':'smooth',block:'start'});target.focus({preventScroll:true});
    target.classList.remove('waypoint-highlight');requestAnimationFrame(()=>target.classList.add('waypoint-highlight'));
    setTimeout(()=>target.classList.remove('waypoint-highlight'),1400);
   });waypoints.append(button);
  });header.append(waypoints);
 });
 function reflectProgress(){
  for(let i=0;i<5;i++){
   const mastered=route.querySelector('[data-nav="'+cards[i].id+'"]').classList.contains('mastered'), tile=map.children[i];
   tile.dataset.mastered=String(mastered);tile.querySelector('.stop-number').textContent=mastered?'✓':String(i+1).padStart(2,'0');
  }
 }
 new MutationObserver(reflectProgress).observe(route,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});reflectProgress();
 const mast=document.querySelector('#current-station'), track=document.querySelector('#reading-progress'), top=document.querySelector('.back-to-top');
 let scheduled=false, current=-2;
 function update(){
  scheduled=false;const height=document.documentElement.scrollHeight-innerHeight;
  track.style.transform='scaleX('+Math.min(1,Math.max(0,height?scrollY/height:0))+')';top.hidden=scrollY<650;
  let index=-1;for(let i=0;i<sheets.length;i++){if(sheets[i].getBoundingClientRect().top<innerHeight*.38)index=i;}
  if(index!==current){current=index;mast.textContent=index<0?'第一章 · 化學反應與化學計量':String(index+1).padStart(2,'0')+' / '+stops[index][0];
   route.querySelectorAll('a').forEach((a,i)=>{a.classList.toggle('active',i===index);if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
}
