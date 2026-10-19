const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/signOutSession.ts','utf8'), { compilerOptions:{module:ts.ModuleKind.CommonJS} }).outputText, {exports:exported});
const {signOutSession}=exported;
const storage = () => {
  const data=new Map();
  return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
};
const keys=['zero_app_state_v6','zero_auth_state_v5','zero_auth_state_v6','unrelated'];
const fresh=()=>{const local=storage(),session=storage();for(const key of keys)local.setItem(key,'keep');for(const key of ['zero_pending_wallet_v1','zero_update_resume_v1','unrelated'])session.setItem(key,'keep');return {local,session};};
(async()=>{
  for(const mode of ['error','throw','still-active']){
    const {local,session}=fresh();
    const auth={signOut:async()=>{if(mode==='throw')throw Error('offline');return {error:mode==='error'?Error('offline'):null};},getSession:async()=>({data:{session:{user:{id:'old'}}}})};
    assert.ok((await signOutSession(auth,local,session)).error,mode);
    assert.equal(local.getItem('zero_app_state_v6'),'keep','Failure must not pretend to have signed out');
  }
  const {local,session}=fresh();
  const sdkStorage=storage();
  const tokenPart=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const token=[tokenPart({alg:'HS256',typ:'JWT'}),tokenPart({sub:'11111111-1111-4111-8111-111111111111',exp:Math.floor(Date.now()/1000)+3600}),tokenPart('fake-signature')].join('.');
  sdkStorage.setItem('test-auth',JSON.stringify({access_token:token,refresh_token:'test-refresh',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'11111111-1111-4111-8111-111111111111',email:'fixture@example.invalid'}}));
  const requests=[];
  const client=createClient('https://example.supabase.co','test-publishable',{auth:{storage:sdkStorage,storageKey:'test-auth',detectSessionInUrl:false,autoRefreshToken:false},global:{fetch:async(url)=>{requests.push(String(url));return new Response('{}',{status:200,headers:{'content-type':'application/json'}});}}});
  assert.ok((await client.auth.getSession()).data.session,'Fixture starts authenticated');
  assert.equal((await signOutSession(client.auth,local,session)).error,undefined);
  assert.equal((await client.auth.getSession()).data.session,null,'SDK session is actually removed');
  assert.equal(sdkStorage.getItem('test-auth'),null);
  assert.ok(requests.some(url=>url.includes('/logout?scope=local')));
  assert.equal(local.getItem('zero_app_state_v6'),null);
  assert.equal(local.getItem('zero_auth_state_v6'),'keep','Device PIN stays associated with its owner');
  assert.equal(local.getItem('unrelated'),'keep');
  assert.equal(session.getItem('zero_pending_wallet_v1'),null);
  assert.equal(session.getItem('zero_update_resume_v1'),null);
  assert.equal(session.getItem('unrelated'),'keep');
  const login=await client.auth.signInWithOAuth({provider:'google',options:{skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}});
  assert.equal(new URL(login.data.url).searchParams.get('prompt'),'select_account');
  assert.match(fs.readFileSync('src/components/AuthScreen.tsx','utf8'),/prompt:\s*"select_account"/);
  console.log('PASS: real SDK session removal, local logout scope, OAuth account chooser, failed logout handling, cache cleanup and PIN preservation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
