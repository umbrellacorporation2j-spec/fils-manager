const C='index-manager-v5';
const F=['./','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
// A redirected response can't be served to a page navigation (causes ERR_FAILED), so cache a clean copy.
const clean=async r=>{if(!r.redirected)return r;const b=await r.blob();return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})};
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{const c=await caches.open(C);
    await Promise.all(F.map(async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok)await c.put(u,await clean(r))}catch(_){}}))})());
  self.skipWaiting()});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));
  self.clients.claim()});
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  if(q.mode==='navigate'){
    e.respondWith(fetch(q).then(async r=>{
      if(r.ok&&r.type==='basic'){const c=await caches.open(C);c.put('./',await clean(r.clone()))}
      return r}).catch(()=>caches.match('./')));
    return}
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q)))});
