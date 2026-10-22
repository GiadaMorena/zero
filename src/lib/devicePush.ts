import { supabase } from "@/lib/supabase";
export async function disableDevicePush(){
 if(typeof navigator==="undefined"||!("serviceWorker"in navigator))return;
 const registration=await navigator.serviceWorker.getRegistration("/");
 const subscription=await registration?.pushManager.getSubscription();if(!subscription)return;
 const endpoint=subscription.endpoint;
 // Invalidate the local endpoint even if the server cannot be reached at logout.
 await subscription.unsubscribe();
 try{const {data:{session}}=await supabase.auth.getSession();if(session)await fetch("/api/push",{method:"DELETE",signal:AbortSignal.timeout(4000),headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify({endpoint})});}catch{}
}
