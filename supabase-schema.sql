-- B2B Mall Supabase Schema
-- Run this SQL in Supabase SQL Editor

-- 1. Products
create table if not exists products (
  id text primary key,
  sku text not null,
  name text not null,
  brand text not null default '',
  category_id integer not null default 0,
  subcategory text,
  images text[] default '{}',
  prices jsonb not null default '{}',
  min_quantity integer not null default 1,
  max_quantity integer,
  stock integer not null default 0,
  stock_status text not null default 'available',
  options jsonb default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  admin_options jsonb default '[]',
  variants jsonb default '[]',
  shipping jsonb,
  description text,
  detail_images text[] default '{}',
  show_option_images boolean default false,
  quantity_discounts jsonb default '[]'
);

-- 2. Orders
create table if not exists orders (
  id text primary key,
  order_number text not null,
  user_id text not null,
  "user" jsonb not null default '{}',
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  shipping_fee numeric not null default 0,
  total_amount numeric not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  payment_method text not null default '',
  shipping_address jsonb not null default '{}',
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Members
create table if not exists members (
  id text primary key,
  name text not null,
  email text not null,
  company text,
  business_number text,
  tier text not null default 'member',
  status text not null default 'active',
  total_orders integer not null default 0,
  total_spent numeric not null default 0,
  created_at timestamptz not null default now(),
  last_order_at timestamptz,
  provider text
);

-- 4. Promotions
create table if not exists promotions (
  id text primary key,
  title text not null,
  description text not null default '',
  type text not null default 'all',
  discount numeric not null default 0,
  image text not null default '',
  target_tiers text[] default '{}',
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text
);

-- 5. Shipping Settings (single row)
create table if not exists shipping_settings (
  id text primary key default 'default',
  name text not null default '기본 배송비',
  type text not null default 'flat',
  is_default boolean not null default true,
  base_fee numeric not null default 3000,
  free_shipping_threshold numeric,
  tiers jsonb default '[]',
  regions jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Tier Settings (single row)
create table if not exists tier_settings (
  id text primary key default 'default',
  is_enabled boolean not null default true,
  auto_upgrade boolean not null default true,
  auto_downgrade boolean not null default false,
  evaluation_period text not null default 'cumulative',
  thresholds jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- 7. Popup Modals
create table if not exists popup_modals (
  id text primary key,
  title text not null,
  content text not null default '',
  image text,
  is_active boolean not null default true,
  target_pages text[] default '{}',
  show_once boolean not null default false,
  show_to_logged_in_only boolean not null default false,
  button_text text,
  button_link text,
  start_date timestamptz,
  end_date timestamptz,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Site Settings (single row)
create table if not exists site_settings (
  id text primary key default 'default',
  top_banner jsonb not null default '{"image":"","alt":"가성비연구소 PRICE LAB","link":"","isActive":true}',
  updated_at timestamptz not null default now()
);

-- Storage buckets (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true);

-- RLS policies: allow public read/write (adjust for production)
alter table products enable row level security;
create policy "Products are viewable by everyone" on products for select using (true);
create policy "Products are editable by everyone" on products for all using (true);

alter table orders enable row level security;
create policy "Orders are viewable by everyone" on orders for select using (true);
create policy "Orders are editable by everyone" on orders for all using (true);

alter table members enable row level security;
create policy "Members are viewable by everyone" on members for select using (true);
create policy "Members are editable by everyone" on members for all using (true);

alter table promotions enable row level security;
create policy "Promotions are viewable by everyone" on promotions for select using (true);
create policy "Promotions are editable by everyone" on promotions for all using (true);

alter table shipping_settings enable row level security;
create policy "Shipping settings viewable by everyone" on shipping_settings for select using (true);
create policy "Shipping settings editable by everyone" on shipping_settings for all using (true);

alter table tier_settings enable row level security;
create policy "Tier settings viewable by everyone" on tier_settings for select using (true);
create policy "Tier settings editable by everyone" on tier_settings for all using (true);

alter table popup_modals enable row level security;
create policy "Popup modals viewable by everyone" on popup_modals for select using (true);
create policy "Popup modals editable by everyone" on popup_modals for all using (true);

alter table site_settings enable row level security;
create policy "Site settings viewable by everyone" on site_settings for select using (true);
create policy "Site settings editable by everyone" on site_settings for all using (true);
