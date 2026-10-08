const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..');
const ts=require(root+'/node_modules/typescript');
const compiled=ts.transpileModule(fs.readFileSync(root+'/src/lib/pinFlow.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const scope={exports:{}};vm.runInNewContext(compiled,scope);
const {sameLoginAccount,nextLoginStep}=scope.exports;
assert.equal(sameLoginAccount('Giada@example.test',' giada@EXAMPLE.test '),true);
assert.equal(sameLoginAccount('giada@example.test','altro@example.test'),false);
assert.equal(sameLoginAccount('',undefined),false);
const pin={hasPin:true,pinCode:'482957'};
assert.equal(nextLoginStep({zero_onboarding_completed:true},pin),'lock');
assert.equal(nextLoginStep({},pin),'lock','legacy/Google account with a saved PIN enters verification');
assert.equal(nextLoginStep({zero_onboarding_completed:true},pin,true),'create_pin','explicit reset creates a new PIN');
assert.equal(nextLoginStep({zero_onboarding_completed:true},{hasPin:false,pinCode:''}),'create_pin');
assert.equal(nextLoginStep({}, {hasPin:false,pinCode:''}),'profile_setup');
assert.equal(nextLoginStep({zero_profile_completed:true},{hasPin:false,pinCode:''}),'add_card');
assert.equal(nextLoginStep({zero_onboarding_completed:true},{hasPin:true,pinCode:'123'}),'create_pin');

// Render the actual page with hook/SDK stubs to exercise logout → login → one unlock.
let states=[],cursor=0,latestTree,effects=[];
const react={createElement:(tag,props,...children)=>({tag,props:props||{},children}),useState:initial=>{const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},useEffect:fn=>effects.push(fn)};
const stored=new Map();const localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)};
let profileResolve;
const user={email:'giada@example.test',id:'fake-user',user_metadata:{zero_onboarding_completed:true},app_metadata:{provider:'google'}};
let sessionUser=user;
const supabase={auth:{getSession:async()=>({data:{session:sessionUser?{user:sessionUser}:null}}),getUser:async()=>({data:{user}}),signOut:async()=>{},updateUser:async()=>({error:null})},from:()=>({select:()=>({eq:()=>({single:()=>new Promise(resolve=>{profileResolve=resolve})})})})};
const listeners={};const document={hidden:false,addEventListener:(key,fn)=>listeners[key]=fn,removeEventListener:key=>delete listeners[key]};
const components={};
function requireStub(name){
 if(name==='react')return react;if(name==='@/lib/supabase')return {supabase};if(name==='@/lib/pinFlow')return scope.exports;
 if(name==='@/context/AppContext')return {AppProvider:'AppProvider'};
 const component=name.split('/').pop();components[component]=component;return {[component]:component};
}
const code=ts.transpileModule(fs.readFileSync(root+'/src/app/page.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const page={exports:{},require:requireStub,localStorage,document,window:{location:{hash:'',search:'',pathname:'/'},history:{replaceState:()=>{}}},URLSearchParams,console};vm.runInNewContext(code,page);
function render(){cursor=0;effects=[];latestTree=page.exports.default();return latestTree;}
function find(tag,node=latestTree){if(!node||typeof node!=='object')return null;if(node.tag===tag)return node;for(const child of node.children||[]){for(const item of Array.isArray(child)?child:[child]){const found=find(tag,item);if(found)return found;}}return null;}
(async()=>{
 render();states[0]={isRegistered:true,hasPin:true,pinCode:pin.pinCode,userName:'Giada',userEmail:user.email};states[1]='app';states[7]=false;render();
 states[3]='profilo';render();await find('ProfiloScreen').props.onLogout();
 const saved=JSON.parse(stored.get('zero_auth_state_v6'));assert.equal(saved.isRegistered,false);assert.equal(saved.pinCode,pin.pinCode);
 states[1]='login';render();await find('AuthScreen').props.onAuth({name:'Giada',email:'GIADA@example.test'});assert.equal(states[1],'lock');
 render();assert.equal(find('PinScreen').props.mode,'lock');find('PinScreen').props.onSuccess();assert.equal(states[1],'app','one successful unlock enters app directly');
 render();effects[1]();document.hidden=true;listeners.visibilitychange();assert.equal(states[1],'lock','background lock applies in app');
 render();effects[1]();listeners.visibilitychange();assert.equal(states[1],'lock','background event cannot change PIN verification into setup');
 find('PinScreen').props.onForgotPin();render();await find('AuthScreen').props.onAuth({name:'Giada',email:user.email});assert.equal(states[1],'create_pin','reauthentication after forgotten PIN permits explicit reset');
 render();find('PinScreen').props.onPinSet('395827');assert.equal(states[1],'confirm_pin');render();find('PinScreen').props.onSuccess();assert.equal(states[1],'app');
 render();states[1]='register';render();find('AuthScreen').props.onAuth({name:'Nuovo',email:'nuovo@example.test'});assert.equal(states[0].hasPin,false,'new account must not inherit old PIN');
 // A full reload after logout must restore device PIN settings before the next login.
 stored.set('zero_auth_state_v6',JSON.stringify(saved));states=[];sessionUser=null;render();effects[0]();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(states[0].pinCode,pin.pinCode);assert.equal(states[1],'welcome');assert.equal(states[7],false);
 states[1]='login';render();await find('AuthScreen').props.onAuth({name:'Giada',email:user.email});assert.equal(states[1],'lock','login after browser reload must reuse the saved PIN');
 // Exercise the actual keypad: six digits trigger exactly one unlock, with no second entry.
 const pinModule={exports:{},require:name=>name==='react'?react:name==='lucide-react'?{Delete:'Delete',Lock:'Lock'}:name==='next/image'?{default:'Image',__esModule:true}:{default:'Logo',__esModule:true},console,setTimeout:()=>0};
 const pinSource=ts.transpileModule(fs.readFileSync(root+'/src/components/PinScreen.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
 vm.runInNewContext(pinSource,pinModule);
 function button(text,node){if(!node||typeof node!=='object')return null;if(node.tag==='button'&&node.children.includes(text))return node;for(const child of node.children||[]){for(const item of Array.isArray(child)?child:[child]){const found=button(text,item);if(found)return found;}}return null;}
 for(const [entered,expected,successes] of [[pin.pinCode,pin.pinCode,1],['123456',pin.pinCode,0],['123456','',0]]){
   states=[];let count=0;const props={mode:'lock',expectedPin:expected,onSuccess:()=>count++};
   for(const digit of entered){cursor=0;const tree=pinModule.exports.PinScreen(props);button(digit,tree).props.onClick();}
   assert.equal(count,successes,'one keypad entry validates only the configured PIN');
 }
 console.log('PIN routing, account matching, logout retention, single unlock, background lock and registration/reset confirmation passed');
})().catch(error=>{console.error(error);process.exitCode=1});
