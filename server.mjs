import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),file=path.resolve(root,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname).slice(1));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await fs.readFile(file);res.setHeader('Content-Type',({html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8'})[path.extname(file).slice(1)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404).end('Not found');}});
server.on('error',error=>{
 if(error.code==='EADDRINUSE') console.error('Port 4176 is already in use. Keep the existing preview window open and try http://127.0.0.1:4176 . If it is a different app, stop that app or open outputs/失落的神兵-拖曳探索版.html directly.');
 else console.error('Preview could not start: '+error.message);
 process.exitCode=1;
});
server.listen(4176,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4176\nOpen this address in your browser. Keep this window open while using the preview. Press Ctrl+C to stop.'));
process.on('SIGINT',()=>server.close());
