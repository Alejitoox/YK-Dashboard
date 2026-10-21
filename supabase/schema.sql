-- Ejecuta este script en Supabase > SQL Editor > New query > Run

create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date not null default current_date,
  tipo text not null check (tipo in ('ropa', 'boleta', 'otro')),
  nombre text not null,              -- prenda, evento/concierto o artículo
  marca text,                        -- solo ropa
  talla text,                        -- solo ropa
  evento_fecha date,                 -- solo boletas
  ciudad text,                       -- solo boletas
  localidad text,                    -- solo boletas
  cantidad integer not null default 1 check (cantidad > 0),
  precio_compra bigint not null default 0 check (precio_compra >= 0), -- COP por unidad
  precio_venta bigint not null default 0 check (precio_venta >= 0),   -- COP por unidad
  costo_envio bigint not null default 0 check (costo_envio >= 0),     -- COP total
  cliente_nombre text,
  cliente_contacto text,
  notas text
);

create index if not exists ventas_fecha_idx on public.ventas (fecha desc);
create index if not exists ventas_tipo_idx on public.ventas (tipo);

alter table public.ventas enable row level security;

-- ATENCIÓN: esta política deja leer y escribir a cualquiera que tenga la URL y la
-- clave anon de tu proyecto (la app no tiene login). Sirve para empezar, pero los datos
-- de tus clientes quedan expuestos si alguien consigue esa clave. Recomendado: agregar
-- login (Supabase Auth) y cambiar a la política "solo autenticados" de más abajo.
drop policy if exists "acceso_sin_login" on public.ventas;
create policy "acceso_sin_login" on public.ventas
  for all to anon, authenticated
  using (true) with check (true);

-- Cuando agregues login, borra la política anterior y usa esta:
-- drop policy if exists "acceso_sin_login" on public.ventas;
-- create policy "solo_autenticados" on public.ventas
--   for all to authenticated
--   using (true) with check (true);
