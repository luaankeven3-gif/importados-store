export type CatalogProduct={id:string;name:string;category:string;description:string;image_url:string|null;price_reference:number|null;status:'evaluating'|'hidden'|'available'};
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const backendConfigured=Boolean(url&&key);
export async function fetchCatalog():Promise<CatalogProduct[]>{
 if(!url||!key)return [];
 const response=await fetch(url+'/rest/v1/products?select=id,name,category,description,image_url,price_reference,status&status=neq.hidden&order=created_at.desc',{headers:{apikey:key,Authorization:'Bearer '+key}});
 if(!response.ok)throw new Error('Não foi possível carregar o catálogo.');
 return response.json();
}
