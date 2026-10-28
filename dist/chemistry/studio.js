import { escapeHTML } from './components.js';
// A larger workspace keeps the same elements, listeners, and experiment state.
export function prepareStudio(root,{number,title,description},ctx){
 root.classList.add('interactive-studio');root.setAttribute('data-glossary-skip','');
 const heading=document.createElement('header');heading.className='studio-heading';
 heading.innerHTML='<div class="studio-heading-copy"><span class="studio-number">'+number+'</span><div><span class="studio-eyebrow">動手探索 / LEARNING STUDIO</span><h3>'+escapeHTML(title)+'</h3><p>'+escapeHTML(description)+'</p></div></div><button type="button" class="studio-expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/></svg>放大操作台</button>';
 root.prepend(heading);
 heading.querySelector('button').onclick=()=>{

  const dialog=document.createElement('dialog');dialog.className='studio-dialog';dialog.setAttribute('aria-label',title+' · 放大操作台');
  dialog.innerHTML='<div class="studio-dialog-bar"><div><span class="studio-eyebrow">專注操作</span><b>'+escapeHTML(title)+'</b></div><button type="button" class="studio-close" autofocus>完成，回到課程 <span aria-hidden="true">×</span></button></div><div class="studio-dialog-body"></div>';
  const content=[...root.children].filter(x=>x!==heading),placeholders=content.map(node=>{const marker=document.createComment('studio position');node.before(marker);return marker;});
  root.append(dialog);content.forEach(node=>dialog.querySelector('.studio-dialog-body').append(node));
  root.classList.add('is-expanded');
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  dialog.onclose=()=>{root.dispatchEvent(new Event('workspaceclose'));root.classList.remove('is-expanded');content.forEach((node,i)=>placeholders[i].replaceWith(node));dialog.remove();document.body.style.overflow=overflow;heading.querySelector('button').focus({preventScroll:true});};
  dialog.querySelector('.studio-close').onclick=()=>dialog.close();dialog.showModal();
 };
}
