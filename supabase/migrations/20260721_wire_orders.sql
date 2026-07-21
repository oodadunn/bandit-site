begin;

create table if not exists public.wire_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  company text not null,
  email text not null,
  phone text,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_zip text not null,
  equipment_make text,
  equipment_model text,
  customer_notes text,
  product_subtotal numeric(12,2) not null,
  freight_status text not null default 'quoted_separately',
  status text not null default 'quote_requested',
  created_at timestamptz not null default now()
);

create table if not exists public.wire_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.wire_orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  gauge integer not null,
  length_ft integer,
  package_label text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null
);

create index if not exists wire_orders_customer_id_idx on public.wire_orders(customer_id);
create index if not exists wire_orders_email_idx on public.wire_orders(lower(email));
create index if not exists wire_order_items_order_id_idx on public.wire_order_items(order_id);

alter table public.wire_orders enable row level security;
alter table public.wire_order_items enable row level security;

drop policy if exists "Customers can view their wire orders" on public.wire_orders;
create policy "Customers can view their wire orders"
  on public.wire_orders for select to authenticated
  using (customer_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Customers can view their wire order items" on public.wire_order_items;
create policy "Customers can view their wire order items"
  on public.wire_order_items for select to authenticated
  using (
    exists (
      select 1 from public.wire_orders
      where wire_orders.id = wire_order_items.order_id
        and (wire_orders.customer_id = auth.uid() or lower(wire_orders.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

commit;
