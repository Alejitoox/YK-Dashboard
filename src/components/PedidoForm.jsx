import { useState } from 'react'
import { ESTADOS, calcular, cop, hoy } from '../lib/format'

const VACIO = {
  fecha: '',
  nombre: '',
  marca: '',
  talla: '',
  precio_compra: '',
  precio_venta: '',
  costo_envio: '',
  cliente_nombre: '',
  cliente_contacto: '',
  notas: '',
  estado: 'apartada',
}

const texto = (s) => (s && String(s).trim() ? String(s).trim() : null)
const entero = (n) => Math.max(0, Math.round(Number(n) || 0))

// 'Venta finalizada' no se elige aquí: se hace desde la lista, con confirmación.
const ESTADOS_FORM = ESTADOS.filter((e) => e.id !== 'finalizada')

export default function PedidoForm({ inicial, onCerrar, onGuardar }) {
  const editando = Boolean(inicial.id)
  const [d, setD] = useState(() => {
    const base = { ...VACIO, fecha: hoy(), ...inicial }
    Object.keys(base).forEach((k) => {
      if (base[k] === null) base[k] = ''
    })
    return base
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const set = (campo) => (e) => setD((prev) => ({ ...prev, [campo]: e.target.value }))
  const preview = calcular({
    cantidad: 1,
    precio_compra: d.precio_compra,
    precio_venta: d.precio_venta,
    costo_envio: d.costo_envio,
  })

  async function enviar(e) {
    e.preventDefault()
    if (!d.nombre.trim()) {
      setError('Escribe el nombre de la prenda.')
      return
    }
    setGuardando(true)
    setError('')
    const payload = {
      fecha: d.fecha || hoy(),
      tipo: 'ropa',
      nombre: d.nombre.trim(),
      marca: texto(d.marca),
      talla: texto(d.talla),
      precio_compra: entero(d.precio_compra),
      precio_venta: entero(d.precio_venta),
      costo_envio: entero(d.costo_envio),
      cliente_nombre: texto(d.cliente_nombre),
      cliente_contacto: texto(d.cliente_contacto),
      notas: texto(d.notas),
      estado: d.estado,
    }
    const msg = await onGuardar(payload, inicial.id)
    if (msg) {
      setError(msg)
      setGuardando(false)
    }
  }

  return (
    <div className="fondo" onClick={onCerrar}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2>{editando ? 'Editar pedido' : 'Nuevo pedido'}</h2>

        <div className="rejilla">
          <label>
            Tipo
            <input value="Ropa" disabled />
          </label>
          <label>
            Fecha de venta
            <input type="date" value={d.fecha} onChange={set('fecha')} required />
          </label>

          <label className="ancho">
            Nombre de la prenda
            <input value={d.nombre} onChange={set('nombre')} autoFocus />
          </label>

          <label>
            Marca
            <input value={d.marca} onChange={set('marca')} />
          </label>
          <label>
            Talla
            <input value={d.talla} onChange={set('talla')} />
          </label>

          <label>
            Precio de compra (COP)
            <input type="number" min="0" step="1" inputMode="numeric" value={d.precio_compra} onChange={set('precio_compra')} />
          </label>
          <label>
            Precio de venta (COP)
            <input type="number" min="0" step="1" inputMode="numeric" value={d.precio_venta} onChange={set('precio_venta')} />
          </label>

          <label>
            Precio de envío (COP)
            <input type="number" min="0" step="1" inputMode="numeric" value={d.costo_envio} onChange={set('costo_envio')} />
          </label>
          <label>
            Estado
            <select value={d.estado} onChange={set('estado')}>
              {ESTADOS_FORM.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre del cliente
            <input value={d.cliente_nombre} onChange={set('cliente_nombre')} />
          </label>
          <label>
            Contacto del cliente
            <input value={d.cliente_contacto} onChange={set('cliente_contacto')} placeholder="Teléfono, Instagram…" />
          </label>

          <label className="ancho">
            Notas
            <textarea rows="2" value={d.notas} onChange={set('notas')} />
          </label>
        </div>

        <div className="resumen">
          <span>
            Ingreso <strong>{cop(preview.ingreso)}</strong>
          </span>
          <span>
            Egreso <strong>{cop(preview.egreso)}</strong>
          </span>
          <span>
            Ganancia <strong className={preview.ganancia < 0 ? 'neg' : 'pos'}>{cop(preview.ganancia)}</strong>
          </span>
        </div>

        {error && <p className="error-form">{error}</p>}

        <div className="pie-modal">
          <button type="button" className="btn" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="btn primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
