const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=process.argv[2]||path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const compile=file=>ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const helper={exports:{}};vm.runInNewContext(compile('src/lib/transactionChanges.ts'),helper);
const {changedBalances,persistTransactionChange}=helper.exports;
const original={id:'tx',title:'Spesa',category:'Cibo',amount:-20,date:'2026-10-09',cardId:'a',type:'expense',note:''};
const replacement={...original,amount:-12.5,cardId:'b'};
const initial=[{id:'a',balance:80},{id:'b',balance:50}];
assert.equal(changedBalances(initial,original,{...original,amount:-30})[0].balance,70);
assert.equal(changedBalances(initial,original,replacement)[0].balance,100);
assert.equal(changedBalances(initial,original,replacement)[1].balance,37.5);
assert.equal(changedBalances(initial,original,null)[0].balance,100);
function db(mode){
 const records={cards:initial.map(x=>({...x})),transactions:[{...original,user_id:'u',card_id:'a',note:null}]}; records.cards.forEach(x=>x.user_id='u');
 const client={from:table=>{let action='select',values,filters=[],ids;
  const query={select(){return query},update(data){action='update';values=data;return query},delete(){action='delete';return query},eq(key,value){filters.push([key,value]);return query},is(key,value){filters.push([key,value]);return query},in(key,list){ids=list;return query},single:async()=>run(true),maybeSingle:async()=>{const r=run(false);return {data:r.data[0]||null,error:r.error}},then(resolve,reject){return Promise.resolve(run(false)).then(resolve,reject)}};
  function run(single){
   if(table==='cards'&&action==='update'&&values.balance===37.5&&mode==='card-error')return{data:null,error:{message:'fail'}};
   if(table==='transactions'&&action!=='select'&&mode==='tx-error')return{data:null,error:{message:'fail'}};
   if(mode==='network')throw Error('offline');
   let rows=records[table].filter(row=>filters.every(([key,val])=>row[key]===val)&&(!ids||ids.includes(row.id)));
   if(action==='update')rows.forEach(row=>Object.assign(row,values));
   if(action==='delete')records[table]=records[table].filter(row=>!rows.includes(row));
   if(table==='transactions'&&action!=='select'&&mode==='lost-response')throw Error('response lost after commit');
   return {data:single?rows[0]||null:rows.map(row=>({...row})),error:single&&!rows.length?{message:'conflict'}:null};
  }return query;
 }};return{client,records};
}
(async()=>{
 for(const mode of ['success','lost-response','tx-error','card-error','network']){
  const h=db(mode),r=await persistTransactionChange(h.client,'u',original,replacement);
  if(mode==='success'||mode==='lost-response'){assert.equal(r.error,undefined);assert.equal(h.records.cards[0].balance,100);assert.equal(h.records.cards[1].balance,37.5);assert.equal(h.records.transactions[0].card_id,'b');}
  else {assert.ok(r.error);assert.equal(h.records.cards[0].balance,80,'rollback original card');assert.equal(h.records.cards[1].balance,50,'rollback destination card');assert.equal(h.records.transactions[0].amount,-20);}
 }
 const stale=db('success');stale.records.transactions[0].amount=-25;
 assert.ok((await persistTransactionChange(stale.client,'u',original,replacement)).error);assert.equal(stale.records.cards[0].balance,80);
 const removed=db('success');assert.equal((await persistTransactionChange(removed.client,'u',original,null)).error,undefined);assert.equal(removed.records.transactions.length,0);assert.equal(removed.records.cards[0].balance,100);
 console.log('Amount/card correction, deletion balance restoration, stale-write protection and backend/network rollback passed');
})().catch(error=>{console.error(error);process.exitCode=1});


