import "server-only";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { readTracking, TRACKING_KEY } from "@/lib/subscriptionTracking";

export const PUSH_KEY="zero_web_push_v1", SENT_KEY="zero_reminders_sent_v1";
export function adminClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw Error("Reminder service is not configured");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function authenticatedUser(request:Request){
  const header=request.headers.get("authorization")||"";
  if(!header.startsWith("Bearer "))return null;
  const admin=adminClient();
  const verifier=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await verifier.auth.getUser(header.slice(7));
  if(error||!user)return null;
  return {admin,user};
}
export function cronAuthorized(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret)return false;
  const actual=Buffer.from(request.headers.get("authorization")||""),expected=Buffer.from(`Bearer ${secret}`);
  return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export interface StoredPush { endpoint:string; keys:{auth:string;p256dh:string} }
export function validPush(value:unknown):value is StoredPush{
  if(!value||typeof value!=="object")return false;
  const push=value as StoredPush;
  try{
    const url=new URL(push.endpoint);
    const host=url.hostname;
    const allowed=host==="fcm.googleapis.com"||host==="web.push.apple.com"||host.endsWith(".push.apple.com")||host==="updates.push.services.mozilla.com"||host.endsWith(".notify.windows.com");
    return allowed&&url.protocol==="https:"&&!url.username&&!url.password&&(!url.port||url.port==="443")&&push.endpoint.length<3000&&typeof push.keys?.auth==="string"&&typeof push.keys?.p256dh==="string"&&/^[\w-]+={0,2}$/.test(push.keys.auth)&&/^[\w-]+={0,2}$/.test(push.keys.p256dh)&&Buffer.from(push.keys.auth,"base64url").length===16&&Buffer.from(push.keys.p256dh,"base64url").length===65;
  }catch{return false;}
}
export function pushesFrom(value:unknown):StoredPush[]{return Array.isArray(value)?value.filter(validPush).slice(-5):[];}
export const noCache={"Cache-Control":"private, no-store"};
export function trackingForUser(user:{user_metadata?:Record<string,unknown>}){return readTracking(user.user_metadata?.[TRACKING_KEY]);}

const BUCKET="zero-notification-service";
type Admin=ReturnType<typeof adminClient>;
export interface PushState {devices:StoredPush[];sent:string[]}
async function ensureBucket(admin:Admin){
 const {error}=await admin.storage.getBucket(BUCKET);if(!error)return;
 if(!/not found|does not exist/i.test(error.message)&&String(error.statusCode)!=="404")throw error;
 const created=await admin.storage.createBucket(BUCKET,{public:false,fileSizeLimit:500000,allowedMimeTypes:["application/json"]});
 if(created.error&&!/already exists/i.test(created.error.message))throw created.error;
}
export async function readPushState(admin:Admin,userId:string):Promise<PushState>{
 await ensureBucket(admin);
 const {data,error}=await admin.storage.from(BUCKET).download(`${userId}.json`);
 if(error){if(String(error.statusCode)==="404"||/not found|does not exist/i.test(error.message))return{devices:[],sent:[]};throw error;}
 const value=JSON.parse(await data.text());
 return{devices:pushesFrom(value.devices),sent:Array.isArray(value.sent)?value.sent.filter((item:unknown):item is string=>typeof item==="string").slice(-1000):[]};
}
export async function writePushState(admin:Admin,userId:string,state:PushState){
 await ensureBucket(admin);
 const {error}=await admin.storage.from(BUCKET).upload(`${userId}.json`,JSON.stringify(state),{upsert:true,contentType:"application/json",cacheControl:"0"});
 if(error)throw error;
}
