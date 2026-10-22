import { adminClient, authenticatedUser, noCache, readPushState, validPush, writePushState } from "@/lib/subscriptionReminderServer";
export const runtime="nodejs";
export async function GET(request:Request){
 let configured=!!(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY&&process.env.CRON_SECRET&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 if(configured)try{const check=await adminClient().auth.admin.listUsers({page:1,perPage:1});configured=!check.error;}catch{configured=false;}
 let endpoints:string[]=[];
 if(configured&&request.headers.has("authorization"))try{
  const auth=await authenticatedUser(request);
  if(auth)endpoints=(await readPushState(auth.admin,auth.user.id)).devices.map(device=>device.endpoint);
 }catch{configured=false;}
 return Response.json({configured,publicKey:configured?process.env.VAPID_PUBLIC_KEY:null,endpoints},{headers:noCache});
}
export async function POST(request:Request){
 try{
  if(Number(request.headers.get("content-length")||0)>10000)return new Response(null,{status:413});
  if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY||!process.env.CRON_SECRET)return Response.json({error:"Le notifiche automatiche non sono ancora configurate sul server."},{status:503,headers:noCache});
  const auth=await authenticatedUser(request);if(!auth)return new Response(null,{status:401});
  const text=await request.text();if(text.length>10000)return new Response(null,{status:413});
  const body=JSON.parse(text);if(!validPush(body))return Response.json({error:"Dispositivo push non valido."},{status:400,headers:noCache});
  const state=await readPushState(auth.admin,auth.user.id);
  const previous=state.devices;
  const devices=[...previous.filter(push=>push.endpoint!==body.endpoint),{endpoint:body.endpoint,keys:body.keys}].slice(-5);
  await writePushState(auth.admin,auth.user.id,{...state,devices});
  return Response.json({ok:true},{headers:noCache});
 }catch{return Response.json({error:"Servizio notifiche non disponibile. Riprova."},{status:503,headers:noCache});}
}
export async function DELETE(request:Request){
 try{
  const auth=await authenticatedUser(request);if(!auth)return new Response(null,{status:401});
  const body=await request.json();if(typeof body.endpoint!=="string")return new Response(null,{status:400});
  const state=await readPushState(auth.admin,auth.user.id);
  const devices=state.devices.filter(push=>push.endpoint!==body.endpoint);
  await writePushState(auth.admin,auth.user.id,{...state,devices});
  return Response.json({ok:true},{headers:noCache});
 }catch{return new Response(null,{status:503});}
}
