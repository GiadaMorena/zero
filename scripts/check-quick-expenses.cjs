const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const root=process.argv[2] || require('node:path').resolve(__dirname, '..');
const ts=require(root+'/node_modules/typescript');
function compile(file){return ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;}
const monthHelpers={exports:{}};vm.runInNewContext(compile(root+"/src/lib/monthlyBudget.ts"),monthHelpers);
const util={exports:{}};vm.runInNewContext(compile(root+'/src/lib/quickTransaction.ts'),util);
for(const [input,expected] of [['12,50',12.5],['0,01',.01],['12.50',12.5],['',null],['0',null],['-1',null],['12abc',null],['Infinity',null],['1,234',null],['1.2.3',null]]) assert.equal(util.exports.parseTransactionAmount(input),expected,input);
const cards=[{id:'a',bankName:'Fineco',balance:100},{id:'b',bankName:'Intesa',balance:50}];
const txs=[{cardId:'deleted',category:'Casa',type:'expense'},{cardId:'b',category:'Shopping',type:'expense'},{cardId:'b',category:'Shopping',type:'expense'},{cardId:'a',category:'Stipendio',type:'income'}];
assert.equal(util.exports.preferredTransactionCard(cards,txs,'a'),'b');
assert.equal(util.exports.preferredTransactionCard(cards,[], 'b'),'b');
assert.equal(util.exports.preferredTransactionCard([],txs),'');
assert.equal(JSON.stringify(util.exports.recentTransactionCategories(txs,'expense',['Casa','Shopping'])),'["Casa","Shopping"]');
function harness(mode){
 let states=[],cursor=0,insertedPayload;
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>null,useEffect:()=>{},useRef:value=>({current:value}),useState:(initial)=>{const index=cursor++;if(!(index in states))states[index]=typeof initial==='function'?initial():initial;return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value}];},createElement:(tag,props)=>({tag,props})};
 const supabase={auth:{getSession:async()=>{if(mode==='network')throw Error('offline');return {data:{session:{user:{id:'test'}}}}},getUser:async()=>({data:{user:null}})},from:()=>({insert:payload=>{insertedPayload=payload;return {select:()=>({single:async()=>mode==='insert-error'?{error:{message:'fail'},data:null}:{error:null,data:{...payload,id:'saved',card_id:payload.card_id}}})}},update:()=>({eq:()=>({eq:async()=>{if(mode==='balance-error')throw Error('offline');return {error:null}}})})})};
 const scope={exports:{},require:name=>name==='react'?react:name==='@/lib/monthlyBudget'?monthHelpers.exports:name==='@/lib/saveFeedback'?{notifySaved:()=>{}}:{supabase},console};vm.runInNewContext(compile(root+'/src/context/AppContext.tsx'),scope);
 const render=()=>{cursor=0;return scope.exports.AppProvider({children:null}).props.value};render();states[0]=[{id:'a',bankName:'Fineco',balance:100}];
 return {value:render(),states,getPayload:()=>insertedPayload};
}
(async()=>{
 for(const mode of ['insert-error','network']){const h=harness(mode);const result=await h.value.addTransaction({title:'Test',category:'Cibo',amount:150,type:'expense',cardId:'a'});assert.ok(result.error,mode);assert.equal(h.states[0][0].balance,100,mode+' restores clamped balance');assert.equal(h.states[2].length,0,mode+' removes phantom entry');}
 for(const mode of ['success','balance-error']){const h=harness(mode);const result=await h.value.addTransaction({title:'Test',category:'Cibo',amount:12.5,type:'expense',cardId:'a'});assert.equal(result.error,undefined);assert.equal(h.states[0][0].balance,87.5);assert.equal(h.states[2].length,1);assert.equal(h.states[2][0].id,'saved');assert.equal(h.getPayload().amount,-12.5);}
 console.log('Amount validation, recent choices, insert/network rollback and duplicate-retry prevention passed');
})().catch(error=>{console.error(error);process.exitCode=1});
