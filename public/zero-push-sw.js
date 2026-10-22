self.addEventListener("push",event=>{
  let payload={};try{payload=event.data?event.data.json():{};}catch{}
  event.waitUntil(self.registration.showNotification(typeof payload.title==="string"?payload.title:"Promemoria ZERO",{
    body:typeof payload.body==="string"?payload.body:"Apri ZERO per controllare le scadenze.",
    icon:"/icon.png",badge:"/icon.png",tag:typeof payload.tag==="string"?payload.tag:"zero-reminder",
    data:{url:"/#subscription-reminders"}
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL("/#subscription-reminders",self.location.origin).href;
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows)if(new URL(client.url).origin===self.location.origin){client.postMessage({type:"zero-subscription-reminders"});await client.focus();return;}
    await self.clients.openWindow(url);
  })());
});
