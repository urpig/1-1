export const PRACTICE_DROPS=12;
export function createHeatingPractice(){return {loaded:false,lit:false};}
export function loadHeatingSample(state){if(state.loaded)return false;state.loaded=true;return true;}
export function setHeatingFlame(state,lit){if(lit&&!state.loaded)return false;const changed=state.lit!==!!lit;state.lit=!!lit;return changed;}
// Shared state for instrument controls, drawings and completion checks.
export function createReactionPractice(){return {solutions:[],dropperReady:false,drops:0};}
export function addPracticeSolution(state,id){
 if(!['sodium','calcium'].includes(id)||state.solutions.includes(id))return false;
 state.solutions.push(id);return true;
}
export function placePracticeDropper(state,inside){state.dropperReady=!!inside;}
export function addPracticeDrop(state){if(!state.dropperReady||state.drops>=PRACTICE_DROPS)return false;state.drops++;return true;}
export function practiceReady(state,id){return id==='solid'?state.solutions.length===2:id==='gas'?state.drops===PRACTICE_DROPS:false;}

// Keep pointer and keyboard presses paired, including interrupted gestures.
export function bindDropperPress(button,{enabled,start,stop,tap}){
 let pointer=null,key=null;
 const release=()=>{if(pointer===null&&key===null)return;pointer=null;key=null;stop();};
 button.addEventListener('pointerdown',e=>{if(e.button!==0||button.disabled||!enabled())return;e.preventDefault();pointer=e.pointerId;button.setPointerCapture(e.pointerId);start();});
 button.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;release();if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);});
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
 button.addEventListener('blur',release);
 button.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key)||button.disabled||!enabled())return;e.preventDefault();if(e.repeat||key!==null)return;key=e.key;start();});
 button.addEventListener('keyup',e=>{if(e.key!==key)return;e.preventDefault();release();});
 button.addEventListener('click',e=>{if(e.detail===0&&!button.disabled&&enabled())tap();});
 return release;
}
