const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const lib=(file,imports={},globals={})=>{const scope={exports:{},require:name=>imports[name],...globals};vm.runInNewContext(compile(file),scope);return scope.exports;};
const renewals=lib('src/lib/upcomingPayments.ts'),logic=lib('src/lib/subscriptionTracking.ts',{'./upcomingPayments':renewals});
const time='2026-10-22T08:00:00Z';class Clock extends Date{constructor(...args){super(...(args.length?args:[time]));}static now(){return new Date(time).getTime();}}
function fixture({paid=false,enabled=true,sendError=false}={}){
 const user={id:'owner',user_metadata:{[logic.TRACKING_KEY]:{startedOn:'2026-10-01',subscriptions:{a:{cardId:'card',payments:paid?{'2026-10-22':true}:{}}}}}};
 const state={devices:[{endpoint:'https://web.push.apple.com/Q/test',keys:{auth:'test',p256dh:'test'}}],sent:[]};const calls=[];
 const rows=[{id:'a',name:'Private merchant',cost:99,frequency:'mese',date:'22 ottobre',active:true,created_at:'2026-10-01T10:00:00Z'},{id:'b',name:'Private merchant 2',cost:50,frequency:'mese',date:'23 ottobre',active:true,created_at:'2026-10-01T10:00:00Z'}];
 const admin={auth:{admin:{listUsers:async()=>({data:{users:[user]},error:null})}},from:table=>{const result=()=>({data:table==='profiles'?{notifications_enabled:enabled}:rows,error:null});const q={select:()=>q,eq:()=>q,single:async()=>result(),then:resolve=>Promise.resolve(result()).then(resolve)};return q;}};
 const helpers={adminClient:()=>admin,cronAuthorized:req=>req.headers.get('authorization')==='Bearer cron',noCache:{},trackingForUser:user=>logic.readTracking(user.user_metadata[logic.TRACKING_KEY]),readPushState:async()=>structuredClone(state),writePushState:async(_a,_u,next)=>{Object.assign(state,structuredClone(next));}};
 const sender={setVapidDetails(){},sendNotification:async(device,payload)=>{calls.push(JSON.parse(payload));if(sendError)throw{statusCode:500};}};
 const route=lib('src/app/api/cron/subscription-reminders/route.ts',{'web-push':{default:sender,__esModule:true},'node:crypto':require('node:crypto'),'@/lib/subscriptionReminderServer':helpers,'@/lib/subscriptionTracking':logic},{Date:Clock,Response,Set,process:{env:{VAPID_PUBLIC_KEY:'public',VAPID_PRIVATE_KEY:'private'}}});
 return{route,calls,state};
}
(async()=>{
 const request=()=>new Request('https://example.invalid/api/cron/subscription-reminders',{headers:{authorization:'Bearer cron'}});
 const f=fixture();assert.equal((await f.route.GET(new Request('https://example.invalid'))).status,401);assert.equal(f.calls.length,0);
 assert.equal((await f.route.GET(request())).status,200);assert.equal(f.calls.length,2);assert.ok(f.calls.some(call=>call.title.includes('domani')));assert.ok(f.calls.some(call=>call.title.includes('oggi')));assert.equal(JSON.stringify(f.calls).includes('Private merchant'),false,'Push does not disclose merchant or amounts');
 await f.route.GET(request());assert.equal(f.calls.length,2,'Repeated cron must not send the same reminder again');
 const paid=fixture({paid:true});await paid.route.GET(request());assert.equal(paid.calls.length,1,'Paid renewal skips day-of notification');
 const off=fixture({enabled:false});await off.route.GET(request());assert.equal(off.calls.length,0);
 const failure=fixture({sendError:true});assert.equal((await failure.route.GET(request())).status,503);assert.equal(failure.state.sent.length,0,'Failed sends remain retryable');
 console.log('PASS: scheduled day-before/day-of dispatch, duplicate prevention, paid/disabled exclusion, private payloads, failed-send retries and unauthorized rejection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
