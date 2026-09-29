type Session={access_token:string;refresh_token:string;expires_at:number};
export function configured(){const c=(window as any).STORE_CONFIG;return !!c?.url&&!!c?.key;}
function config(){const c=(window as any).STORE_CONFIG;if(!c?.url||!c?.key)throw Error('د سټور سرور لا نه دی نښلول شوی.');const u=new URL(c.url);if(u.protocol!=='https:')throw Error('HTTPS اړین دی.');return {url:u.origin,key:c.key as string};}
function session():Session|null{try{return JSON.parse(localStorage.getItem('store-session')||'null');}catch{return null;}}
function saveSession(j:any){localStorage.setItem('store-session',JSON.stringify({access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+j.expires_in*1000}));}
let refreshing:Promise<void>|null=null;
async function token(){let s=session();if(!s)return '';if(s.expires_at<Date.now()+30000){if(!refreshing)refreshing=(async()=>{const c=config();const r=await globalThis.fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s!.refresh_token})});if(!r.ok){localStorage.removeItem('store-session');throw Error('بیا اډمین حساب ته ننوځئ.');}saveSession(await r.json());})().finally(()=>{refreshing=null;});await refreshing;s=session();}return s?.access_token||'';}
async function request(path:string,init:RequestInit={},authenticated=false){const c=config();const t=authenticated?await token():'';if(authenticated&&!t)throw Error('لومړی اډمین حساب ته ننوځئ.');const h=new Headers(init.headers);h.set('apikey',c.key);if(t)h.set('Authorization','Bearer '+t);const r=await globalThis.fetch(c.url+path,{...init,headers:h});if(!r.ok){const j=await r.json().catch(()=>({}));throw Error(j.message||j.msg||j.error_description||'غوښتنه ناکامه شوه؛ بیا هڅه وکړئ.');}return r;}
export async function signIn(email:string,password:string){const r=await request('/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});saveSession(await r.json());if(!await adminAccess()){localStorage.removeItem('store-session');throw Error('دا حساب د اډمین اجازه نه لري.');}}
export async function adminAccess(){if(!session())return false;const r=await request('/rest/v1/store_admins?select=user_id',{},true);return (await r.json()).length>0;}
export async function storeFetch(_url:string,init:RequestInit={}){
 try{
 if(!init.method||init.method==='GET'){
 const products:any[]=[];let offset=0;
 while(true){const r=await request('/rest/v1/store_products?select=*&order=created_at.desc,id.desc&limit=500&offset='+offset);const batch=await r.json();products.push(...batch);if(batch.length<500)break;offset+=batch.length;}
 return Response.json({products});
 }
 if(init.method==='DELETE'){const {id}=JSON.parse(String(init.body));if(!/^[a-f0-9-]{36}$/.test(id))throw Error('ناسم جنس');await request('/rest/v1/store_products?id=eq.'+id,{method:'DELETE'},true);return Response.json({ok:true});}
 if(init.method==='POST'){
 const f=init.body as FormData;const id=String(f.get('id')||crypto.randomUUID());if(!/^[a-f0-9-]{36}$/.test(id))throw Error('ناسم جنس');const editing=!!f.get('id');const data:any={name:String(f.get('name')||'').trim(),category:String(f.get('category')||''),price:Number(f.get('price')),quantity:Number(f.get('quantity')),description:String(f.get('description')||'')};
 const file=f.get('photo');let uploaded='';
 if(file instanceof File&&file.size){if(file.size>6*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('تر ۶ MB پورې JPG، PNG یا WebP عکس وټاکئ.');const ext=file.type.split('/')[1];uploaded=crypto.randomUUID()+'.'+ext;await request('/storage/v1/object/store-images/'+uploaded,{method:'POST',headers:{'Content-Type':file.type},body:file},true);data.image=config().url+'/storage/v1/object/public/store-images/'+uploaded;}
 if(!editing&&!data.image)throw Error('د جنس عکس وټاکئ.');
 try{const path=editing?'/rest/v1/store_products?id=eq.'+id:'/rest/v1/store_products';if(!editing)data.id=id;await request(path,{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)},true);}catch(e){if(uploaded)await request('/storage/v1/object/store-images',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[uploaded]})},true).catch(()=>{});throw e;}
 return Response.json({id});
 }
 return Response.json({error:'Unsupported method'},{status:405});
 }catch(e){return Response.json({error:(e as Error).message},{status:503});}
}
