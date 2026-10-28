const fs=require('fs'),path=require('node:path'),vm=require('vm'),assert=require('node:assert/strict');
const root=process.argv[2]||path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript'));
const providerPath=process.argv[3]||path.join(root,'src/components/SubscriptionTrackingProvider.tsx');
const compile=p=>ts.transpileModule(fs.readFileSync(path.isAbsolute(p)?p:path.join(root,p),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const load=(p,imports={},extra={})=>{const scope={exports:{},require:name=>imports[name],...extra};vm.runInNewContext(compile(p),scope);return scope.exports;};
const renewal=load('src/lib/upcomingPayments.ts');
const logic=load('src/lib/subscriptionTracking.ts',{'./upcomingPayments':renewal});
const {readTracking,subscriptionCycle,romeDay,TRACKING_KEY}=logic;
const now=new Date('2026-10-22T10:00:00Z');
const base={id:'sub-1',name:'Cloud',cost:9.99,frequency:'mese',date:'22 ottobre',active:true,category:'Cloud',color:'#FDC909',createdAt:'2026-10-01T10:00:00Z'};
const tracking=readTracking({startedOn:'2026-10-01',subscriptions:{'sub-1':{cardId:'card-1',payments:{}}}});
assert.equal(subscriptionCycle(base,tracking,new Date('2026-10-21T10:00:00Z')).phase,'tomorrow');
assert.equal(subscriptionCycle(base,tracking,now).phase,'today');
assert.equal(subscriptionCycle(base,tracking,now).status,'pending');
const no=readTracking({...tracking,subscriptions:{'sub-1':{cardId:'card-1',payments:{'2026-10-22':false}}}});
assert.equal(subscriptionCycle(base,no,new Date('2026-10-25T10:00:00Z')).status,'unpaid');
no.subscriptions['sub-1'].payments['2026-10-22']=true;
assert.equal(subscriptionCycle(base,no,now).status,'paid');
assert.equal(subscriptionCycle(base,no,new Date('2026-11-22T10:00:00Z')).status,'pending','Each cycle needs its own answer');
assert.equal(subscriptionCycle({...base,active:false},tracking,now),null);
assert.equal(subscriptionCycle({...base,date:'31 febbraio'},tracking,new Date('2027-02-28T10:00:00Z')).recentKey,'2027-02-28');
assert.equal(subscriptionCycle({...base,date:'29 febbraio',frequency:'anno'},tracking,new Date('2028-02-28T10:00:00Z')).phase,'tomorrow');
assert.equal(subscriptionCycle({...base,date:'29 febbraio',frequency:'anno'},tracking,new Date('2027-02-28T10:00:00Z')).phase,'today');
assert.equal(subscriptionCycle({...base,createdAt:'2026-10-23T10:00:00Z'},tracking,now).status,null,'No confirmations before creation');
assert.equal(subscriptionCycle(base,readTracking({startedOn:'2026-10-23'}),now).status,null);
assert.equal(romeDay(new Date('2026-10-22T22:30:00Z')),'2026-10-23');
assert.equal(romeDay(new Date('2026-10-26T22:30:00Z')),'2026-10-26','DST uses Rome calendar dates');
assert.equal(Object.keys(readTracking(JSON.parse('{"subscriptions":{"__proto__":{"cardId":"x"}}}')).subscriptions).length,0);

function providerHarness(fail=false){
 let states=[],cursor=0,refs=[],ri=0,effects=[],metadata={[TRACKING_KEY]:readTracking({startedOn:romeDay(),subscriptions:{}})},writes=0;
 const day=romeDay(),d=new Date(day+'T12:00:00');
 const sub={...base,date:`${d.getDate()} ${['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'][d.getMonth()]}`,createdAt:day+'T00:00:00Z'};
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>null,useCallback:fn=>fn,useEffect:fn=>effects.push(fn),useRef:initial=>refs[ri++]||(refs[ri-1]={current:initial}),useState:initial=>{const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];}};
 const sdk={auth:{getUser:async()=>({data:{user:{id:'owner',user_metadata:metadata}},error:null}),getSession:async()=>({data:{session:{user:{id:'owner',user_metadata:metadata}}},error:null}),updateUser:async value=>{writes++;if(fail)return{error:{message:'offline'}};metadata={...metadata,...value.data};return{error:null};},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}};
 const recordSubscriptionPayment=async input=>{if(fail)return{error:'offline'};const value=readTracking(metadata[TRACKING_KEY]),entry=value.subscriptions[input.subscriptionId]||{cardId:'',payments:{}};entry.payments[input.cycleDate]=input.paid;value.subscriptions[input.subscriptionId]=entry;metadata={...metadata,[TRACKING_KEY]:value};return{tracking:value,transaction:input.paid?{id:'fixture-movement'}:null,balance:null};};
 const mod=load(providerPath,{'react':react,'react/jsx-runtime':{jsx:(tag,props)=>({tag,props})},'@/lib/supabase':{supabase:sdk},'@/context/AppContext':{useApp:()=>({cards:[{id:'card-1'}],subscriptions:[sub],recordSubscriptionPayment})},'@/lib/subscriptionTracking':logic},{window:{addEventListener(){},removeEventListener(){},setInterval(){return 0;},clearInterval(){},setTimeout:fn=>{fn();return 0;}}});
 const render=()=>{cursor=0;ri=0;effects=[];return mod.SubscriptionTrackingProvider({children:null}).props.value;};
 return{render,init:()=>{render();effects[0]();},states,writes:()=>writes,metadata:()=>metadata,sub};
}
(async()=>{
 for(const fail of [false,true]){
  const h=providerHarness(fail);h.init();await new Promise(resolve=>setImmediate(resolve));
  const card=await h.render().setCard('sub-1','card-1');assert.equal(!!card.error,fail);
  if(!fail){assert.equal(h.metadata()[TRACKING_KEY].subscriptions['sub-1'].cardId,'card-1');const result=await h.render().confirm('sub-1',romeDay(),true);assert.equal(result.error,undefined);assert.equal(h.metadata()[TRACKING_KEY].subscriptions['sub-1'].payments[romeDay()],true);await h.render().setCard('sub-1','');assert.equal(h.metadata()[TRACKING_KEY].subscriptions['sub-1'].cardId,'');assert.ok((await h.render().setCard('sub-1','deleted-card')).error);assert.ok((await h.render().confirm('sub-1','2099-01-01',true)).error);}
  else assert.equal(h.states[0].subscriptions['sub-1'],undefined,'Failed write leaves previous settings intact');
 }
 const server=load('src/lib/subscriptionReminderServer.ts',{'server-only':{},'@supabase/supabase-js':{},'node:crypto':require('node:crypto'),'@/lib/subscriptionTracking':logic},{Buffer,URL,process:{env:{CRON_SECRET:'fixture-secret'}}});
 const push={endpoint:'https://web.push.apple.com/Q/test',keys:{auth:Buffer.alloc(16,1).toString('base64url'),p256dh:Buffer.alloc(65,4).toString('base64url')}};
 assert.equal(server.validPush(push),true);
 for(const endpoint of ['https://127.0.0.1/private','http://web.push.apple.com/Q/test','https://web.push.apple.com.evil.test/x','https://user@web.push.apple.com/x','https://web.push.apple.com:9999/x'])assert.equal(server.validPush({...push,endpoint}),false);
 assert.equal(server.cronAuthorized(new Request('https://example.invalid')),false);assert.equal(server.cronAuthorized(new Request('https://example.invalid',{headers:{authorization:'Bearer fixture-secret'}})),true);
 console.log('PASS: day-before/day-of reminders, Rome/DST dates, monthly/yearly cycles, per-renewal yes/no, card changes, rejected saves, push endpoint validation and cron authentication.');
})().catch(error=>{console.error(error);process.exitCode=1;});
