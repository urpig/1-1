import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve('dist/chemistry'),modules=[],visited=new Set();
function visit(file){
 if(visited.has(file))return;
 visited.add(file);
 let source=fs.readFileSync(path.join(root,file),'utf8').replace(/\uFEFF/g,'');
 const exports=[...source.matchAll(/export\s+(?:const|let|function|class)\s+(\w+)/g)].map(m=>m[1]);
 const pattern=/^import\s+\{([^}]+)\}\s+from\s+['"]\.\/([^'"]+)['"];?\r?$/gm;
 const imports=[...source.matchAll(pattern)];
 for(const m of imports)visit(m[2]);
 source=source.replace(pattern,(_,names,dep)=>'const {'+names+'}=__modules['+JSON.stringify(dep)+'];').replace(/\bexport\s+(?=const|let|function|class)/g,'');
 modules.push('__modules['+JSON.stringify(file)+']=(()=>{\n'+source+'\nreturn {'+exports.join(',')+'};\n})();');
}
visit('app.js');
const script="'use strict';\nconst __modules={};\n"+modules.join('\n');new vm.Script(script);
function image(file){return 'data:image/png;base64,'+fs.readFileSync(path.resolve(root,file)).toString('base64');}
let css=fs.readFileSync(path.join(root,'styles.css'),'utf8').replace(/url\(['"]?((?:\.\.\/assets\/story\/|\.\/assets\/)[^)'"\s]+)['"]?\)/g,(_,file)=>'url("'+image(file)+'")');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8')
.replace('<link rel="stylesheet" href="./styles.css">',()=>'<style>'+css+'</style>')
.replace('src="./assets/alchemy-attic.png"',()=>'src="'+image('./assets/alchemy-attic.png')+'"')
.replace('<script type="module" src="./app.js"></script>',()=>'<script>'+script.replaceAll('</script','<\\/script')+'</script>');
if(/(?:src|href)="\.\/(?:styles\.css|app\.js|assets\/)/.test(html))throw new Error('Unbundled local dependency');
fs.mkdirSync('release',{recursive:true});fs.mkdirSync('outputs',{recursive:true});
fs.writeFileSync('release/chemistry.html',html.replaceAll('href="../index.html"','href="./index.html"'));
fs.writeFileSync('outputs/chemistry-adventure.html',html.replaceAll('href="../index.html"','href="./chemistry-adventure.html"'));
console.log(JSON.stringify({modules:visited.size,bytes:Buffer.byteLength(html),output:path.resolve('outputs/chemistry-adventure.html')}));

