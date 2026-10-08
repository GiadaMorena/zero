const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(root+'/src/lib/'+file+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
let now=100_000;const resume={exports:{},Date:{now:()=>now}};vm.runInNewContext(compile('updateResume'),resume);
const updates={exports:{},require:()=>resume.exports,Date:{now:()=>now},URL,AbortSignal};vm.runInNewContext(compile('appUpdates'),updates);
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(options={}){
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const docHandlers={},winHandlers={},timers=new Map(),reloaded=[],pending=[];
 let blockers=options.blocked?[{getClientRects:()=>[{}]}]:[],connected=true,version=options.version??'v2',requests=0;
 const unlocked={getClientRects:()=>[{}],getAttribute:()=> 'giada@example.test'};
 const document={hidden:!!options.hidden,activeElement:null,querySelectorAll:selector=>selector.includes('data-app-session-unlocked')?(options.unlocked?[unlocked]:[]):blockers,contains:()=>connected,addEventListener:(key,fn)=>docHandlers[key]=fn,removeEventListener:key=>delete docHandlers[key]};
 const navigator={onLine:options.online??true};
 const window={location:{href:options.url??'https://zero.test/?keep=1#home',replace:url=>reloaded.push(url)},history:{replaceState:(_,__,url)=>window.location.href=url},addEventListener:(key,fn)=>winHandlers[key]=fn,removeEventListener:key=>delete winHandlers[key],setInterval:(fn,ms)=>{timers.set(ms,fn);return ms},clearInterval:ms=>timers.delete(ms)};
 const fetch=async(_,init)=>{requests++;assert.equal(init.cache,'no-store');if(options.fail)throw Error('offline');return{ok:options.ok??true,json:async()=>({version})}};
 const stop=updates.exports.startAppUpdates({window,document,navigator,fetch,storage,currentVersion:options.current??'v1',onPending:value=>pending.push(value)});
 return{storage,values,document,navigator,window,timers,reloaded,pending,stop,docHandlers,winHandlers,requests:()=>requests,unblock:()=>blockers=[],disconnect:()=>connected=false,setVersion:value=>version=value};
}
(async()=>{
 let h=setup();await tick();now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,1);assert.equal(new URL(h.reloaded[0]).searchParams.get('keep'),'1');assert.equal(new URL(h.reloaded[0]).hash,'#home');assert.equal(new URL(h.reloaded[0]).searchParams.get('zero_update'),'v2');h.timers.get(2000)();assert.equal(h.reloaded.length,1,'single reload');h.stop();assert.equal(h.timers.size,0);
 h=setup({blocked:true});await tick();now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,0,'form prevents reload');h.unblock();h.timers.get(2000)();assert.equal(h.reloaded.length,1);h.stop();
 h=setup();await tick();const field={value:'draft',matches:selector=>!selector.includes('search'),getClientRects:()=>[{}]};h.docHandlers.input({target:field});now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,0,'unsaved field prevents reload');h.disconnect();h.timers.get(2000)();assert.equal(h.reloaded.length,1);h.stop();
 for(const options of [{online:false},{hidden:true},{fail:true},{ok:false},{version:'v1'},{version:15},{current:'development'}]){h=setup(options);await tick();now+=2000;h.timers.get(2000)?.();assert.equal(h.reloaded.length,0,JSON.stringify(options));h.stop();}
 h=setup({online:false});await tick();h.navigator.onLine=true;h.winHandlers.online();await tick();now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,1,'reconnection checks update');h.stop();
 h=setup({url:'https://zero.test/?zero_update=v2'});await tick();now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,0,'URL protects against reload loop');h.stop();
 h=setup();await tick();h.setVersion('v1');h.timers.get(60000)();await tick();now+=2000;h.timers.get(2000)();assert.equal(h.reloaded.length,0,'rollback cancels obsolete update');h.stop();
 h=setup({unlocked:true});await tick();now+=2000;h.timers.get(2000)();assert.ok(h.storage.getItem(resume.exports.UPDATE_RESUME_KEY));assert.equal(resume.exports.consumeUpdateResume(h.storage,'giada@example.test','v2','v2'),true);assert.equal(resume.exports.consumeUpdateResume(h.storage,'giada@example.test','v2','v2'),false,'resume is one-use');h.stop();
 for(const [email,version,requested,at] of [['other@example.test','v2','v2',now],['giada@example.test','v1','v2',now],['giada@example.test','v2',null,now],['giada@example.test','v2','v2',now-60001]]){h=setup({current:'development'});h.storage.setItem(resume.exports.UPDATE_RESUME_KEY,JSON.stringify({email:'giada@example.test',version:'v2',at}));assert.equal(resume.exports.consumeUpdateResume(h.storage,email,version,requested),false);h.stop();}
 console.log('Automatic update, deferred drafts/PIN, offline/reconnection, reload-loop protection and same-session continuation passed');
})().catch(error=>{console.error(error);process.exitCode=1});
