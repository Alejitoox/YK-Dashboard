-- Apartado "Pedidos": ejecuta este script en Supabase > SQL Editor > New query > Run
-- (si ya lo ejecutaste, es seguro volver a correrlo)

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date not null default current_date,           -- fecha de venta
  tipo text not null default 'ropa' check (tipo in ('ropa', 'boleta', 'otro')),
  nombre text not null,                               -- nombre de la prenda
  marca text,
  talla text,
  precio_compra bigint not null default 0 check (precio_compra >= 0), -- COP
  precio_venta bigint not null default 0 check (precio_venta >= 0),   -- COP
  costo_envio bigint not null default 0 check (costo_envio >= 0),     -- COP
  cliente_nombre text,
  cliente_contacto text,
  notas text,
  estado text not null default 'apartada'
    check (estado in ('apartada', 'pedido_miami', 'bodega_miami', 'bodega_bogota', 'finalizada')),
  venta_id uuid references public.ventas (id) on delete set null  -- venta creada al finalizar
);

create index if not exists pedidos_estado_idx on public.pedidos (estado);
create index if not exists pedidos_fecha_idx on public.pedidos (fecha desc);

-- Al pasar un pedido a "finalizada" se crea automáticamente la venta (una sola vez).
-- Un pedido finalizado queda bloqueado: si algo estaba mal, se corrige en la venta.
create or replace function public.pedido_finalizar()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.estado = 'finalizada' then
    if new.venta_id is not distinct from old.venta_id then
      raise exception 'Un pedido con venta finalizada ya no se puede modificar. Corrige la venta en el apartado Ventas.';
    end if;
    -- cambio de venta_id (por ejemplo, se eliminó la venta): se permite sin recrearla
    return new;
  end if;

  if new.estado = 'finalizada' and new.venta_id is null then
    insert into public.ventas
      (fecha, tipo, nombre, marca, talla, cantidad, precio_compra, precio_venta,
       costo_envio, cliente_nombre, cliente_contacto, notas)
    values
      (new.fecha, new.tipo, new.nombre, new.marca, new.talla, 1, new.precio_compra, new.precio_venta,
       new.costo_envio, new.cliente_nombre, new.cliente_contacto, new.notas)
    returning id into new.venta_id;
  end if;

  return new;
end;
$$;

drop trigger if exists pedido_finalizar_trg on public.pedidos;
create trigger pedido_finalizar_trg
  before insert or update on public.pedidos
  for each row execute function public.pedido_finalizar();

alter table public.pedidos enable row level security;

-- Igual que "ventas": sin login, abierta a quien tenga la clave anon (ver README).
drop policy if exists "acceso_sin_login" on public.pedidos;
create policy "acceso_sin_login" on public.pedidos
  for all to anon, authenticated
  using (true) with check (true);
