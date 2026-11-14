export type CatalogProduct={id:string;name:string;category:string;description:string;image_url:string|null;price_reference:number|null;status:'evaluating'|'hidden'|'available'};
const url=(import.meta.env.VITE_SUPABASE_URL as string|undefined)?.replace(/\/$/,'');
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const backendConfigured=Boolean(url&&key);
type Session={access_token:string;refresh_token:string;expires_at:number};
const sessionKey='importados-admin-session';
let session:Session|null=null;
try{const saved=localStorage.getItem(sessionKey);if(saved)session=JSON.parse(saved)}catch{}
function saveSession(s:Session|null){session=s;if(s)localStorage.setItem(sessionKey,JSON.stringify(s));else localStorage.removeItem(sessionKey)}
async function request(path:string,options:RequestInit={},authenticated=false){
 if(!url||!key)throw new Error('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
 const headers:Record<string,string>={apikey:key,'Content-Type':'application/json',...(options.headers as Record<string,string>||{})};
 if(authenticated){const token=await accessToken();if(!token)throw new Error('Entre como administrador.');headers.Authorization='Bearer '+token}
 // Publishable keys belong in apikey, not in a Bearer authorization header.
 const res=await fetch(url+path,{...options,headers});
 if(!res.ok){const detail=await res.json().catch(()=>({}));throw new Error(detail.message||detail.msg||detail.error_description||'Falha na solicitação ('+res.status+').')}
 if(res.status===204)return null;
 return res.json();
}
async function accessToken():Promise<string|null>{
 if(!session)return null;
 if(Date.now()/1000<session.expires_at-60)return session.access_token;
 try{const refreshed=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});saveSession({access_token:refreshed.access_token,refresh_token:refreshed.refresh_token,expires_at:Math.floor(Date.now()/1000)+refreshed.expires_in});return session!.access_token}catch{saveSession(null);return null}
}
export async function fetchCatalog():Promise<CatalogProduct[]>{return request('/rest/v1/products?select=id,name,category,description,image_url,price_reference,status&status=neq.hidden&order=created_at.desc')}
export async function signIn(email:string,password:string){
 const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
 saveSession({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+data.expires_in});
 if(!await isAdmin()){saveSession(null);throw new Error('Esta conta não tem permissão de administrador.')}
}
export function signOut(){saveSession(null)}
export async function isAdmin():Promise<boolean>{
 if(!session)return false;
 try{return await request('/rest/v1/rpc/is_catalog_admin',{method:'POST',body:'{}'},true)===true}catch{return false}
}
export async function adminProducts():Promise<CatalogProduct[]>{return request('/rest/v1/products?select=id,name,category,description,image_url,price_reference,status&order=created_at.desc',{},true)}
export async function saveProduct(p:Partial<CatalogProduct> & Pick<CatalogProduct,'name'|'category'|'description'|'status'>){
 const {id,...fields}=p;
 await request('/rest/v1/products'+(id?'?id=eq.'+encodeURIComponent(id):''),{method:id?'PATCH':'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(fields)},true);
}
export async function deleteProduct(id:string){await request('/rest/v1/products?id=eq.'+encodeURIComponent(id),{method:'DELETE'},true)}
