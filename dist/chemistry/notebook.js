export function notebookMarkup(card,extraClass='science-explanation'){
 return '<aside class="kui-notebook '+extraClass+'" aria-label="小葵的筆記"><header><span class="story-portrait story-portrait--kui" data-expression="thinking" aria-hidden="true"></span><div><h3>小葵的筆記</h3></div></header><ul>'+card.keyPoints.map(point=>'<li>'+point+'</li>').join('')+'</ul><details class="explanation-depth"><summary>深入了解</summary>'+card.explanation.map(point=>'<p>'+point+'</p>').join('')+'</details></aside>';
}
