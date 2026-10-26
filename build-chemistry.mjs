import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
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
let css=['styles.css','polish.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n').replace(/url\(['"]?((?:\.\.\/assets\/story\/|\.\/assets\/)[^)'"\s]+)['"]?\)/g,(_,file)=>'url("'+image(file)+'")');
// Keep the entire module graph on one release, including returning visitors.
const version=crypto.createHash('sha256').update([...visited].sort().map(file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).join('\n')+css.replace(/\r\n/g,'\n')).digest('hex').slice(0,12);
const importMap='<script type="importmap" id="release-imports">'+JSON.stringify({imports:Object.fromEntries([...visited].sort().map(file=>['./'+file,'./'+file+'?v='+version]))})+'</script>';
const entryPath=path.join(root,'index.html'),previousEntry=fs.readFileSync(entryPath,'utf8');
const entry=previousEntry.replace(/<script type="importmap" id="release-imports">[\s\S]*?<\/script>\s*/,'')
.replace(/href="\.\/(styles|polish)\.css(?:\?v=[^"]+)?"/g,(_,name)=>'href="./'+name+'.css?v='+version+'"')
.replace(/<script type="module" src="\.\/app\.js(?:\?v=[^"]+)?"><\/script>/,()=>importMap+'\n<script type="module" src="./app.js?v='+version+'"></script>');
if(entry!==previousEntry)fs.writeFileSync(entryPath,entry);
let html=entry.replace(importMap+'\n','')
.replace(/<link rel="stylesheet" href="\.\/styles\.css(?:\?v=[^"]+)?">/,()=>'<style>'+css+'</style>')
.replace(/<link rel="stylesheet" href="\.\/polish\.css(?:\?v=[^"]+)?">/,'')
.replace('src="./assets/alchemy-attic.png"',()=>'src="'+image('./assets/alchemy-attic.png')+'"')
.replace(/<script type="module" src="\.\/app\.js(?:\?v=[^"]+)?"><\/script>/,()=>'<script>'+script.replaceAll('</script','<\\/script')+'</script>');
if(/(?:src|href)="\.\/(?:styles\.css|app\.js|assets\/)/.test(html))throw new Error('Unbundled local dependency');
fs.mkdirSync('release',{recursive:true});fs.mkdirSync('outputs',{recursive:true});
fs.writeFileSync('release/chemistry.html',html.replaceAll('href="../index.html"','href="./index.html"'));
fs.writeFileSync('outputs/chemistry-adventure.html',html.replaceAll('href="../index.html"','href="./chemistry-adventure.html"'));
console.log(JSON.stringify({modules:visited.size,bytes:Buffer.byteLength(html),output:path.resolve('outputs/chemistry-adventure.html')}));

