'use strict';
// À chaque ouverture : version en ligne, copie hors connexion en secours.
const CACHE='nova-amigo-mobile-20261106-ordre-saisie-v9';
const OWN_PREFIXES=['nova-amigo-mobile-','amigo-systeme-pro-mobile-'];
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./bandeau-amigo.webp'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(async cache=>{
  for(const path of ASSETS){
   const response=await fetch(new Request(new URL(path,self.registration.scope),{cache:'reload'}));
   if(!response.ok)throw new Error('Fichier indisponible');
   await cache.put(path,response);
  }
 }).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>OWN_PREFIXES.some(p=>k.startsWith(p))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope)||url.pathname.includes('/hippique/'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(new Request(event.request,{cache:'no-store'}));
   if(response.ok){await cache.put(event.request,response.clone());return response;}
   return (await cache.match(event.request))||response;
  }catch(error){const saved=await cache.match(event.request);if(saved)return saved;throw error;}
 })());
});
