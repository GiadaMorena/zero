"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { disableDevicePush } from "@/lib/devicePush";
import { useApp } from "@/context/AppContext";
export function PushNotificationSettings(){
 const {profile,updateProfile}=useApp();
 const [status,setStatus]=useState("Controllo disponibilità…"),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[configured,setConfigured]=useState(false),[key,setKey]=useState("");
 useEffect(()=>{let live=true;void(async()=>{try{
  const {data:{session}}=await supabase.auth.getSession();
  const response=await fetch("/api/push",{cache:"no-store",headers:session?{authorization:`Bearer ${session.access_token}`}:{}});const config=await response.json();if(!live)return;
  setConfigured(!!config.configured);setKey(config.publicKey||"");
  if(!config.configured){setStatus("Invio automatico in attesa di configurazione sul server.");return;}
  if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window)){setStatus("Su iPhone apri ZERO dalla schermata Home per attivare le notifiche.");return;}
  const registration=await navigator.serviceWorker.getRegistration("/");const current=await registration?.pushManager.getSubscription();if(!live)return;
  const registered=Array.isArray(config.endpoints)&&config.endpoints.includes(current?.endpoint);
  setEnabled(!!current&&registered&&Notification.permission==="granted");setStatus(current&&registered?"Notifiche attive su questo dispositivo.":"Attiva gli avvisi anche quando ZERO è chiusa.");
 }catch{if(live)setStatus("Non riesco a verificare le notifiche. Controlla la connessione.");}})();return()=>{live=false;};},[]);
 const change=async()=>{if(busy)return;setBusy(true);try{
  if(enabled){await disableDevicePush();setEnabled(false);setStatus("Notifiche disattivate su questo dispositivo.");return;}
  if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window))throw Error("Aggiungi ZERO alla schermata Home dell’iPhone e aprila da lì.");
  if(Notification.permission==="denied")throw Error("Le notifiche sono bloccate. Consentile nelle impostazioni del dispositivo e riprova.");
  const permission=await Notification.requestPermission();if(permission!=="granted")throw Error("Notifiche non autorizzate: nessun avviso è stato attivato.");
  const registration=await navigator.serviceWorker.register("/zero-push-sw.js",{scope:"/"});
  if(!registration.active)await new Promise<void>((resolve,reject)=>{const worker=registration.installing||registration.waiting;if(!worker){reject(Error("Riprova l’attivazione."));return;}const timer=window.setTimeout(()=>reject(Error("Attivazione lenta. Riprova.")),10000);worker.addEventListener("statechange",()=>{if(worker.state==="activated"){window.clearTimeout(timer);resolve();}});});
  const bytes=Uint8Array.from(atob(key.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
  const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
  const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error("Accedi di nuovo per attivare gli avvisi.");
  const response=await fetch("/api/push",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify(subscription.toJSON())});
  if(!response.ok){await subscription.unsubscribe();throw Error("Registrazione non riuscita. Riprova: le notifiche non sono attive.");}
  if(!profile.notificationsEnabled){const result=await updateProfile({notificationsEnabled:true});if(result.error){await disableDevicePush();throw Error("Non riesco ad abilitare i promemoria nell’account. Riprova.");}}
  setEnabled(true);setStatus("Notifiche attive: un avviso il giorno prima e uno il giorno della scadenza.");
 }catch(error){setStatus(error instanceof Error?error.message:"Attivazione non riuscita. Riprova.");}finally{setBusy(false);}};
 return <section className="rounded-2xl border border-black/10 bg-white p-4 text-[#0B0B0B]" aria-label="Notifiche sul dispositivo"><h2 className="text-sm font-bold">Avvisi sul telefono</h2><p role="status" className="mt-2 text-xs leading-relaxed text-[#666]">{status}</p><p className="mt-2 text-xs leading-relaxed text-[#666]">Invio giornaliero al mattino. Su iPhone è richiesta l’app aggiunta alla schermata Home e il tuo consenso. Nessun avviso contiene importi o dettagli della carta.</p><button type="button" disabled={busy||!configured} onClick={()=>void change()} className="mt-3 rounded-full bg-[#FDC909] px-5 py-3 text-xs font-bold disabled:opacity-50">{busy?"Attendi…":enabled?"Disattiva su questo dispositivo":"Attiva notifiche su questo dispositivo"}</button></section>;
}
