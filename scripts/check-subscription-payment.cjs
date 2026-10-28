const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=process.argv[2]||path.resolve(__dirname,'..');
const ts=require(path.join(root,'node_modules/typescript'));
const helper=process.argv[3]||path.join(root,'src/lib/subscriptionPayment.ts');
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const load=(p,imports={})=>{const scope={exports:{},require:n=>imports[n],Intl,Date};vm.runInNewContext(compile(p),scope);return scope.exports;};
const upcoming=load(path.join(root,'src/lib/upcomingPayments.ts'));
const tracking=load(path.join(root,'src/lib/subscriptionTracking.ts'),{'./upcomingPayments':upcoming});
const {persistSubscriptionPayment}=load(helper,{'./subscriptionTracking':tracking});
const id='cccccccc-cccc-4ccc-8ccc-000000000001',txid='dddddddd-dddd-4ddd-8ddd-000000000001',card='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const input={subscriptionId:id,cycleDate:'2026-10-28',paid:true};
const row={id:txid,title:'Netflix',category:'Abbonamenti',amount:'-6.99',date:'2026-10-28',card_id:card,type:'expense',note:'[zero-subscription]',created_at:'2026-10-28T12:00:00Z'};
const metadata={startedOn:'2026-10-01',subscriptions:{[id]:{cardId:card,payments:{'2026-10-28':true}}}};
const result={tracking:metadata,transaction:row,balance:{id:card,balance:'93.01'}};
(async()=>{
 let captured,calls=0;const client={rpc:async(name,args)=>{calls++;captured={name,args};return{data:result,error:null};}};
 let r=await persistSubscriptionPayment(client,input);assert.equal(r.transaction.id,txid);assert.equal(r.transaction.amount,-6.99);assert.equal(r.transaction.cardId,card);assert.equal(r.balance.balance,93.01);assert.equal(r.tracking.subscriptions[id].payments[input.cycleDate],true);
 assert.equal(calls,1);assert.equal(captured.name,'record_subscription_payment');assert.equal(captured.args.p_subscription_id,id);assert.equal(captured.args.p_cycle_date,input.cycleDate);assert.equal(captured.args.p_paid,true);assert.equal(captured.args.p_existing_transaction_id,null);assert.equal(captured.args.p_allow_new,false);
 const choiceClient={rpc:async()=>({data:{needsChoice:true,candidates:[row]},error:null})};r=await persistSubscriptionPayment(choiceClient,input);assert.equal(r.needsChoice,true);assert.equal(r.candidates[0].amount,-6.99);
 r=await persistSubscriptionPayment(client,{...input,existingTransactionId:txid});assert.equal(captured.args.p_existing_transaction_id,txid);await persistSubscriptionPayment(client,{...input,allowNew:true});assert.equal(captured.args.p_allow_new,true);
 const no={...metadata,subscriptions:{[id]:{cardId:card,payments:{[input.cycleDate]:false}}}};r=await persistSubscriptionPayment({rpc:async()=>({data:{tracking:no,transaction:null,balance:null},error:null})},{...input,paid:false});assert.equal(r.transaction,null);assert.equal(r.tracking.subscriptions[id].payments[input.cycleDate],false);
 const before=calls;for(const bad of [{...input,subscriptionId:'nope'},{...input,cycleDate:'2026-02-31'},{...input,paid:1},{...input,existingTransactionId:'missing'},{...input,allowNew:'yes'}])assert.ok((await persistSubscriptionPayment(client,bad)).error);assert.equal(calls,before,'invalid input never sends an RPC');
 for(const data of [null,{}, {...result,transaction:null},{...result,tracking:{startedOn:'2026-10-01',subscriptions:{}}},{...result,balance:{id:'bad',balance:93}},{...result,balance:{id:card,balance:NaN}},{...result,transaction:{...row,type:'income'}},{needsChoice:true,candidates:[]},{needsChoice:true,candidates:[{...row,amount:6.99}]}])assert.ok((await persistSubscriptionPayment({rpc:async()=>({data,error:null})},input)).error,'unconfirmed/malformed server data is never success');
 for(const [message,code] of [['ZERO_SUB_MISSING_CARD','missing-card'],['ZERO_SUB_LINKED_PAYMENT','linked-payment'],['ZERO_SUB_DELETED_PAYMENT','deleted-payment'],['ZERO_SUB_CYCLE_CHANGED','cycle-changed'],['Could not find the function public.record_subscription_payment in the schema cache','not-configured']]){r=await persistSubscriptionPayment({rpc:async()=>({data:null,error:{message}})},input);assert.equal(r.code,code);assert.ok(r.error);}
 r=await persistSubscriptionPayment({rpc:async()=>{throw Error('connection lost');}},input);assert.equal(r.code,'unavailable');assert.ok(r.error.includes('due volte'));
 console.log('PASS subscription payment helper: one atomic RPC, exact parameters, verified success/choice mapping, rejection of malformed responses, known rollback errors and duplicate-safe network errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
