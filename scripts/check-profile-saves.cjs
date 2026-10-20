const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const budget={exports:{}};vm.runInNewContext(compile('src/lib/monthlyBudget.ts'),budget);
function harness(mode){
 let states=[],cursor=0,payload,resolve;
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>null,useEffect:()=>{},useRef:value=>({current:value}),useState:initial=>{const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},createElement:(tag,props)=>({tag,props})};
 const supabase={auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}})},from:()=>({update:data=>{payload=data;return{eq:()=>({select:()=>({single:async()=>{if(mode==='network')throw Error('offline');if(mode==='pending')return new Promise(r=>{resolve=r;});return{data:mode==='error'?null:{id:'user'},error:mode==='error'?{message:'denied'}:null};}})})};}})};
 const cache=new Map([['zero_auth_state_v6',JSON.stringify({userName:'Prima',pinCode:'123456'})]]);
 const context={exports:{},console,localStorage:{getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)},require:name=>name==='react'?react:name==='@/lib/monthlyBudget'?budget.exports:{supabase}};
 vm.runInNewContext(compile('src/context/AppContext.tsx'),context);
 const render=()=>{cursor=0;return context.exports.AppProvider({children:null}).props.value;};render();states[6]={name:'Prima',email:'fixture@example.invalid',avatarText:'P',notificationsEnabled:true};states[7]=mode==='local'?null:'user';const app=render();
 return{app,states,cache,payload:()=>payload,resolve:value=>resolve(value)};
}
(async()=>{
 for(const mode of ['success','local']){const h=harness(mode);assert.equal((await h.app.updateProfile({name:'  Dopo  '})).error,undefined);assert.equal(h.states[6].name,'Dopo');assert.equal(h.states[6].avatarText,'D');assert.equal(JSON.parse(h.cache.get('zero_auth_state_v6')).userName,'Dopo');if(mode==='success')assert.equal(h.payload().name,'Dopo');}
 for(const mode of ['error','network']){const h=harness(mode);assert.ok((await h.app.updateProfile({name:'Dopo'})).error);assert.equal(h.states[6].name,'Prima');assert.equal(JSON.parse(h.cache.get('zero_auth_state_v6')).userName,'Prima');assert.ok((await h.app.updateProfile({notificationsEnabled:false})).error);assert.equal(h.states[6].notificationsEnabled,true);}
 const h=harness('success');assert.ok((await h.app.updateProfile({name:'   '})).error);assert.ok((await h.app.updateProfile({name:'a'.repeat(101)})).error);assert.ok((await h.app.updateProfile({email:'other@example.invalid'})).error);assert.equal(h.states[6].email,'fixture@example.invalid');assert.equal((await h.app.updateProfile({notificationsEnabled:false})).error,undefined);assert.equal(h.states[6].notificationsEnabled,false);
 const pending=harness('pending');const first=pending.app.updateProfile({name:'Dopo'});await new Promise(r=>setImmediate(r));assert.ok((await pending.app.updateProfile({name:'Altro'})).error);pending.resolve({data:{id:'user'},error:null});await first;assert.equal(pending.states[6].name,'Dopo');
 console.log('PASS: profile persistence, failed/network/no-row saves preserve old data, name validation, read-only email, reminders and concurrent-save guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});
