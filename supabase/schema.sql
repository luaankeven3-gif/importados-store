-- Execute in Supabase SQL editor. Public product reads; authenticated admin writes only.
create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.products(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 160),
 category text not null,
 description text not null default '',
 image_url text,
 price_reference numeric(12,2) check(price_reference >= 0),
 status text not null default 'evaluating' check(status in ('evaluating','hidden','available')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.interests(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 visitor_key uuid not null,
 created_at timestamptz not null default now(),
 unique(product_id,visitor_key)
);
create table if not exists public.product_views(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 visitor_key uuid not null,
 viewed_on date not null default current_date,
 unique(product_id,visitor_key,viewed_on)
);
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.interests enable row level security;
alter table public.product_views enable row level security;
create or replace function public.is_catalog_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()));
$$;
revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to authenticated;
create policy "Public sees visible products" on public.products for select to anon,authenticated using(status <> 'hidden' or public.is_catalog_admin());
create policy "Admins insert products" on public.products for insert to authenticated with check(public.is_catalog_admin());
create policy "Admins update products" on public.products for update to authenticated using(public.is_catalog_admin()) with check(public.is_catalog_admin());
create policy "Admins delete products" on public.products for delete to authenticated using(public.is_catalog_admin());
create policy "Admin reads admin list" on public.admin_users for select to authenticated using(public.is_catalog_admin());
create policy "Admin reads interests" on public.interests for select to authenticated using(public.is_catalog_admin());
create policy "Admin reads views" on public.product_views for select to authenticated using(public.is_catalog_admin());
-- Anonymous analytics writes must go through a validated, rate-limited server endpoint.
-- Do not grant public INSERT to analytics tables: client-controlled visitor IDs are forgeable.
-- Create first admin manually in SQL editor after inviting user:
-- insert into public.admin_users(user_id) values ('AUTH_USER_UUID');
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_interests_product on public.interests(product_id);
create index if not exists idx_views_product on public.product_views(product_id);
