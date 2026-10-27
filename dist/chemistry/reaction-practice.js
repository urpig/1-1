// Shared state for instrument controls, drawings and completion checks.
export function createReactionPractice(){return {solutions:[],dropperReady:false,drops:0};}
export function addPracticeSolution(state,id){
 if(!['sodium','calcium'].includes(id)||state.solutions.includes(id))return false;
 state.solutions.push(id);return true;
}
export function placePracticeDropper(state,inside){state.dropperReady=!!inside;}
export function addPracticeDrop(state){if(!state.dropperReady||state.drops>=3)return false;state.drops++;return true;}
export function practiceReady(state,id){return id==='solid'?state.solutions.length===2:id==='gas'?state.drops===3:false;}
