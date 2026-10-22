import webpush from "web-push";
import { createHash } from "node:crypto";
import { adminClient, cronAuthorized, noCache, readPushState, trackingForUser, writePushState } from "@/lib/subscriptionReminderServer";
import { romeDay, subscriptionCycle } from "@/lib/subscriptionTracking";
import type { SubscriptionItem } from "@/context/AppContext";
export const runtime="nodejs";
export const maxDuration=60;
export async function GET(request:Request){
 if(!cronAuthorized(request))return new Response(null,{status:401});
 if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return new Response(null,{status:503});
 try{
  const admin=adminClient(),now=new Date(),today=romeDay(now);
  webpush.setVapidDetails("https://zero-henna-one.vercel.app",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
  let failed=false,processed=0;
  for(let page=1;page<=100;page++){
   const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});if(error)throw error;
   for(const user of data.users){
    let state;
    try{state=await readPushState(admin,user.id);}catch{failed=true;continue;}
    const devices=state.devices;if(!devices.length)continue;
    const [profiles,rows]=await Promise.all([admin.from("profiles").select("notifications_enabled").eq("id",user.id).single(),admin.from("subscriptions").select("*").eq("user_id",user.id).eq("active",true)]);
    if(profiles.error||rows.error){failed=true;continue;}
    if(profiles.data.notifications_enabled===false)continue;
    const tracking=trackingForUser(user);
    const sent=new Set<string>(state.sent.filter(value=>value.startsWith(today+":")));
    const expired=new Set<string>();
    for(const row of rows.data||[]){
     const sub:SubscriptionItem={...row,cost:Number(row.cost),createdAt:row.created_at};
     const cycle=subscriptionCycle(sub,tracking,now);if(!cycle?.phase||cycle.phase==="today"&&cycle.status==="paid")continue;
     for(const device of devices){
      const deviceId=createHash("sha256").update(device.endpoint).digest("hex").slice(0,16),key=`${today}:${sub.id}:${cycle.phase}:${deviceId}`;
      if(sent.has(key))continue;
      try{
       await webpush.sendNotification(device,JSON.stringify({title:cycle.phase==="tomorrow"?"Un abbonamento si rinnova domani":"Un abbonamento si rinnova oggi",body:cycle.phase==="tomorrow"?"Apri ZERO per controllare la scadenza e la carta associata.":"Apri ZERO e conferma: hai già pagato?",tag:`zero-renewal-${sub.id}-${today}`,url:"/#subscription-reminders"}),{TTL:12*60*60,timeout:8000});
       sent.add(key);processed++;
      }catch(error){const status=(error as {statusCode?:number}).statusCode;if(status===404||status===410)expired.add(device.endpoint);else failed=true;}
     }
    }
    try{
     const fresh=await readPushState(admin,user.id);
     await writePushState(admin,user.id,{devices:fresh.devices.filter(device=>!expired.has(device.endpoint)),sent:[...new Set([...fresh.sent.filter(value=>value.startsWith(today+":")),...sent])].slice(-1000)});
    }catch{failed=true;}
   }
   if(data.users.length<100)break;
  }
  return Response.json({ok:!failed,processed},{status:failed?503:200,headers:noCache});
 }catch{return Response.json({error:"Reminder processing failed"},{status:503,headers:noCache});}
}
