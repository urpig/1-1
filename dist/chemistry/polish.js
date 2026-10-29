// Navigation and presentation enhancements; calculations and saved answers stay in app.js.
const stopInfo={3:['原子與莫耳','先理解質量與微粒的關係'],1:['反應的現象','從變化找出新物質'],4:['寫出反應式','先寫化學式，再配平係數'],5:['算出產量','看示範，練習莫耳比例'],2:['驗證質量守恆','親手操作，追蹤每一克']};
export function mountPolish(cards){
 const stops=cards.map(c=>stopInfo[c.id]);
 const route=document.querySelector('#chapter-route');
 const sheets=[...document.querySelectorAll('.learning-card')];
 sheets.forEach((sheet,index)=>{
  const header=sheet.querySelector('.card-header');header.dataset.chapterNumber=String(index+1).padStart(2,'0');
 });
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
