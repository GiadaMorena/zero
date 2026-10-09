const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const quick={exports:{}};vm.runInNewContext(compile('src/lib/quickTransaction.ts'),quick);
function harness(failure){let states=[],refs=[],cursor=0,refCursor=0,calls=[],resolveSave;
const react={useState:initial=>{const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],v=>states[i]=v]},useRef:initial=>refs[refCursor++]||(refs[refCursor-1]={current:initial}),useEffect:()=>{},useCallback:fn=>fn,createElement:(tag,props,...children)=>({tag,props:props||{},children})};
const app={activeCard:{id:'card'},addTransaction:data=>{calls.push(data);return new Promise(resolve=>resolveSave=()=>resolve(failure?{error:'Connessione non disponibile'}:{}))}};
const scope={exports:{},require:name=>name==='react'?react:name==='@/context/AppContext'?{useApp:()=>app}:name==='@/lib/quickTransaction'?quick.exports:{},setTimeout:()=>1,clearTimeout:()=>{},console};vm.runInNewContext(compile('src/components/ReceiptScanModal.tsx'),scope);
const render=()=>{cursor=0;refCursor=0;return scope.exports.ReceiptScanModal({isOpen:true,onClose:()=>{}})};
const find=(node,predicate)=>{if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of(node.children||[]).flat(Infinity)){const found=find(child,predicate);if(found)return found}return null};
let tree=render();find(tree,n=>n.tag==='button'&&n.children.includes('Compila senza foto')).props.onClick();
function fill(id,value){find(render(),n=>n.props.id===id).props.onChange({target:{value}})}
fill('receipt-title','Negozio test');fill('receipt-amount','12abc');
const save=()=>find(render(),n=>n.tag==='button'&&n.children.includes('Salva spesa')).props.onClick();
return{save,fill,states,calls,resolve:()=>resolveSave(),render,value:id=>find(render(),n=>n.props.id===id).props.value,error:()=>find(render(),n=>n.props.role==='alert')?.children.join('')};}
(async()=>{for(const failure of [false,true]){const h=harness(failure);await h.save();assert.equal(h.calls.length,0);h.fill('receipt-amount','12,50');const pending=h.save();assert.equal(h.states[0],'saving');assert.equal(h.calls.length,1);h.resolve();await pending;assert.equal(h.states[0],failure?'confirm':'success');assert.equal(h.calls[0].amount,12.5);assert.equal(h.calls[0].cardId,'card');if(failure){assert.equal(h.value('receipt-amount'),'12,50');assert.equal(h.error(),'Connessione non disponibile');}}console.log('Receipt validation, awaited persistence and failed-save form preservation passed');})().catch(e=>{console.error(e);process.exitCode=1});
