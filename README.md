# YK Store · Panel de ventas

Dashboard para registrar y consultar ventas de ropa, boletas de conciertos y otros artículos, en pesos colombianos (COP).

**Stack:** React + Vite + Supabase (base de datos). Se despliega en Vercel.

## Qué hace

- **Panel:** tarjetas de Ingresos, Egresos, Ganancias totales y Número de ventas; resumen de dinero invertido por categoría (Ropa, Boletas, Otros) y últimas ventas.
- **Ventas:** tabla con todas las ventas, filtro por tipo, búsqueda, editar y eliminar.
- **Nueva venta:**
  - Ropa: nombre de la prenda, marca, talla, precio de compra, precio de venta y precio de envío.
  - Boletas: evento/concierto, fecha del evento, ciudad, localidad, cantidad, precio de compra y venta.
  - Cliente (nombre y contacto) y notas en todos los tipos.

### Cómo se calcula

- Los precios de compra y venta de boletas/otros son **por unidad** (se multiplican por la cantidad). El envío es un valor total.
- **Ingresos** = precio de venta × cantidad.
- **Egresos** = precio de compra × cantidad + envío.
- **Ganancia** = Ingresos − Egresos.
- Cada registro es una venta ya realizada (no hay control de inventario sin vender).

## 1. Crear la base de datos (Supabase)

1. Crea un proyecto gratis en https://supabase.com.
2. Abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. Ve a **Project Settings → API** y copia la **Project URL** y la clave **anon public**.

## 2. Probar en tu computador

```bash
npm install
cp .env.example .env     # y pon tu URL y tu clave anon
npm run dev
```

## 3. Subir a GitHub

```bash
git init
git add .
git commit -m "Panel de ventas YK Store"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/yk-dashboard.git
git push -u origin main
```

El archivo `.env` está en `.gitignore`, no se sube.

## 4. Desplegar en Vercel

1. En https://vercel.com → **Add New → Project** → importa el repositorio.
2. Vercel detecta Vite solo (build: `npm run build`, salida: `dist`).
3. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. **Deploy.**

## Seguridad: léelo

La app no tiene login. Para que funcione así, la política de `schema.sql` permite leer y escribir a cualquiera que tenga la URL y la clave anon de Supabase. Esa clave viaja dentro del código web, así que **quien la consiga puede ver y modificar tus ventas, incluidos los datos de contacto de tus clientes**. Úsalo así solo mientras pruebas. Cuando quieras cerrarlo, agrega login con Supabase Auth y cambia a la política `solo_autenticados` que está comentada al final de `supabase/schema.sql`.
