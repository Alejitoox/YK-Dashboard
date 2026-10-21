export const TIPOS = {
  ropa: 'Ropa',
  boleta: 'Boletas',
  otro: 'Otros',
}

// Estados de un pedido, en orden. Al llegar a 'finalizada' la base de datos crea la venta.
export const ESTADOS = [
  { id: 'apartada', label: 'Prenda apartada (50%)' },
  { id: 'pedido_miami', label: 'Pedido hecho a Miami' },
  { id: 'bodega_miami', label: 'Pedido en bodega Miami' },
  { id: 'bodega_bogota', label: 'Pedido en bodega Bogotá' },
  { id: 'finalizada', label: 'Venta finalizada' },
]

export const estadoLabel = (id) => ESTADOS.find((e) => e.id === id)?.label || id

const copFmt = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export const cop = (n) => copFmt.format(Number(n) || 0)

// Cálculos de una venta: precios de compra/venta son por unidad, el envío es total.
export function calcular(v) {
  const cant = Number(v.cantidad) || 1
  const ingreso = (Number(v.precio_venta) || 0) * cant
  const egreso = (Number(v.precio_compra) || 0) * cant + (Number(v.costo_envio) || 0)
  return { ingreso, egreso, ganancia: ingreso - egreso }
}

// 'YYYY-MM-DD' -> '20 oct 2026' sin desfases de zona horaria
export function fechaCorta(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function hoy() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
