const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const helpers={exports:{}};vm.runInNewContext(compile('src/lib/monthlyBudget.ts'),helpers);
const {transactionDate,monthlySummary,validMonthlyBudget}=helpers.exports;
const tx=(date,amount,createdAt,type='expense')=>({id:'test',date,amount,createdAt,type,category:'Cibo',title:'Test',cardId:'fake'});
const now=new Date(2026,9,8,12);
const summary=monthlySummary([tx('2026-10-08',-.1),tx('8 ottobre 2026',-.2),tx('30/09/2026',-500),tx('08/10/2025',-500),tx('Oggi, 12:00',-20,'2026-10-07T12:00:00Z'),tx('Oggi, 12:00',-300,'2026-09-07T12:00:00Z'),tx('Ieri',-9,'2026-10-01T12:00:00Z'),tx('8/10/2026',30,undefined,'income'),tx('Oggi',-999)],now);
assert.equal(summary.spent,20.3);assert.equal(summary.income,30);assert.equal(summary.undated,1);assert.equal(summary.transactions.length,4);
assert.equal(transactionDate(tx('31/02/2026',-1)),null);assert.equal(transactionDate(tx('8 ottobre',-1)),null);
assert.equal(transactionDate(tx('8 ottobre',-1,'2026-10-09T12:00:00Z')).getFullYear(),2026);
assert.equal(validMonthlyBudget(100.129),100.13);for(const value of [0,-1,Infinity,NaN,'100',null])assert.equal(validMonthlyBudget(value),null);
function harness(mode){let states=[],cursor=0,payload;
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>null,useEffect:()=>{},useState:initial=>{const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];},createElement:(tag,props)=>({tag,props})};
 const supabase={auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),updateUser:async p=>{payload=p;if(mode==='network')throw Error('offline');return {error:mode==='error'?{message:'fail'}:null};}}};
 const scope={exports:{},console,require:name=>name==='react'?react:name==='@/lib/monthlyBudget'?helpers.exports:{supabase}};vm.runInNewContext(compile('src/context/AppContext.tsx'),scope);
 const render=()=>{cursor=0;return scope.exports.AppProvider({children:null}).props.value};render();states[9]=100;if(mode!=='local')states[7]='fake-user';return{app:render(),states,payload:()=>payload};
}
(async()=>{
 for(const mode of ['success','local']){const h=harness(mode);const result=await h.app.updateMonthlyBudget(250);assert.equal(result.error,undefined);assert.equal(h.states[9],250);if(mode==='success')assert.equal(h.payload().data.zero_monthly_budget,250);await h.app.updateMonthlyBudget(null);assert.equal(h.states[9],null);}
 for(const mode of ['error','network']){const h=harness(mode);const result=await h.app.updateMonthlyBudget(250);assert.ok(result.error);assert.equal(h.states[9],100,'failed save preserves old budget');}
 const h=harness('success');assert.ok((await h.app.updateMonthlyBudget(-1)).error);assert.equal(h.states[9],100);
 console.log('Current-month/date parsing, cents precision, income exclusion, budget save/removal and failed-save preservation passed');
})().catch(error=>{console.error(error);process.exitCode=1});
