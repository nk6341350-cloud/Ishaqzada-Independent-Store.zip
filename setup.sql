-- Run once in the SQL Editor of YOUR OWN Supabase project.
-- First create the owner in Authentication > Users with a password you control.
-- No ChatGPT account, Sites runtime, worker, service key, or billing signup is required by this code.
begin;
create table public.store_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.store_admins enable row level security;
revoke all on public.store_admins from anon, authenticated;
grant select on public.store_admins to authenticated;
create policy own_admin_row on public.store_admins for select to authenticated using(user_id=(select auth.uid()));
create table public.store_products(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 150),
 category text not null check(category in ('رنګ','میکپ سامان','وریښتان','شمپو','شمپو او تیل','سپري','سیرم','معجون','تیل','کپسول','کپسول او تیل','کریم او فیس واش','کریم','فیس واش','ساعتونه','عطرونه','فوډر','چائ','کریم او سیرم')),
 price numeric(12,2) not null check(price>=0),
 quantity integer not null default 0 check(quantity>=0),
 description text not null default '' check(length(description)<=4000),
 image text not null check(image like 'https://%'),
 created_at timestamptz not null default now()
);
create index store_products_created on public.store_products(created_at desc,id desc);
alter table public.store_products enable row level security;
revoke all on public.store_products from anon,authenticated;
grant select on public.store_products to anon,authenticated;
grant insert,update,delete on public.store_products to authenticated;
create policy public_catalog on public.store_products for select to anon,authenticated using(true);
create policy admin_insert on public.store_products for insert to authenticated with check(exists(select 1 from public.store_admins where user_id=(select auth.uid())));
create policy admin_update on public.store_products for update to authenticated using(exists(select 1 from public.store_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.store_admins where user_id=(select auth.uid())));
create policy admin_delete on public.store_products for delete to authenticated using(exists(select 1 from public.store_admins where user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('store-images','store-images',true,6291456,array['image/jpeg','image/png','image/webp']);
create policy store_image_insert on storage.objects for insert to authenticated with check(bucket_id='store-images' and exists(select 1 from public.store_admins where user_id=(select auth.uid())));
create policy store_image_select on storage.objects for select to authenticated using(bucket_id='store-images' and exists(select 1 from public.store_admins where user_id=(select auth.uid())));
create policy store_image_delete on storage.objects for delete to authenticated using(bucket_id='store-images' and exists(select 1 from public.store_admins where user_id=(select auth.uid())));
-- SQL Editor alone grants admin. Browser clients cannot grant themselves admin.
do $$
declare owner_id uuid;
begin
 select id into owner_id from auth.users where lower(email)='nk6341350@gmail.com' and email_confirmed_at is not null;
 if owner_id is null then raise exception 'Create and confirm the owner account nk6341350@gmail.com in Authentication > Users first.'; end if;
 insert into public.store_admins(user_id) values(owner_id);
end $$;
commit;
