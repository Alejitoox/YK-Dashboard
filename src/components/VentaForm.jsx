import { useState } from 'react'
import { TIPOS, calcular, cop, hoy } from '../lib/format'

const VACIA = {
  fecha: '',
  tipo: 'ropa',
  nombre: '',
  marca: '',
  talla: '',
  evento_fecha: '',
  ciudad: '',
  localidad: '',
  cantidad: 1,
  precio_compra: '',
  precio_venta: '',
  costo_envio: '',
  cliente_nombre: '',
  cliente_contacto: '',
  notas: '',
}

const texto = (s) => (s && String(s).trim() ? String(s).trim() : null)
const entero = (n) => Math.max(0, Math.round(Number(n) || 0))

export default function VentaForm({ inicial, onCerrar, onGuardar }) {
  const editando = Boolean(inicial.id)
  const [d, setD] = useState(() => {
    const base = { ...VACIA, fecha: hoy(), ...inicial }
    Object.keys(base).forEach((k) => {
      if (base[k] === null) base[k] = ''
    })
    return base
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const set = (campo) => (e) => setD((prev) => ({ ...prev, [campo]: e.target.value }))
  const esRopa = d.tipo === 'ropa'
  const esBoleta = d.tipo === 'boleta'
  const preview = calcular({
    cantidad: esBoleta || d.tipo === 'otro' ? d.cantidad : 1,
    precio_compra: d.precio_compra,
    precio_venta: d.precio_venta,
    costo_envio: esBoleta ? 0 : d.costo_envio,
  })

  async function enviar(e) {
    e.preventDefault()
    if (!d.nombre.trim()) {
      setError(esBoleta ? 'Escribe el nombre del evento o concierto.' : 'Escribe el nombre del artículo.')
      return
    }
    setGuardando(true)
    setError('')
    const payload = {
      fecha: d.fecha || hoy(),
      tipo: d.tipo,
      nombre: d.nombre.trim(),
      marca: esRopa ? texto(d.marca) : null,
      talla: esRopa ? texto(d.talla) : null,
      evento_fecha: esBoleta ? d.evento_fecha || null : null,
      ciudad: esBoleta ? texto(d.ciudad) : null,
      localidad: esBoleta ? texto(d.localidad) : null,
      cantidad: esRopa ? 1 : Math.max(1, Math.round(Number(d.cantidad) || 1)),
      precio_compra: entero(d.precio_compra),
      precio_venta: entero(d.precio_venta),
      costo_envio: esBoleta ? 0 : entero(d.costo_envio),
      cliente_nombre: texto(d.cliente_nombre),
      cliente_contacto: texto(d.cliente_contacto),
      notas: texto(d.notas),
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
        <h2>{editando ? 'Editar venta' : 'Nueva venta'}</h2>

        <div className="rejilla">
          <label>
            Tipo
            <select value={d.tipo} onChange={set('tipo')}>
              {Object.entries(TIPOS).map(([k, n]) => (
                <option key={k} value={k}>
                  {k === 'boleta' ? 'Boleta de concierto' : n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha de venta
            <input type="date" value={d.fecha} onChange={set('fecha')} required />
          </label>

          <label className="ancho">
            {esBoleta ? 'Evento / concierto' : esRopa ? 'Nombre de la prenda' : 'Nombre del artículo'}
            <input value={d.nombre} onChange={set('nombre')} autoFocus />
          </label>

          {esRopa && (
            <>
              <label>
                Marca
                <input value={d.marca} onChange={set('marca')} />
              </label>
              <label>
                Talla
                <input value={d.talla} onChange={set('talla')} />
              </label>
            </>
          )}

          {esBoleta && (
            <>
              <label>
                Fecha del evento
                <input type="date" value={d.evento_fecha} onChange={set('evento_fecha')} />
              </label>
              <label>
                Ciudad
                <input value={d.ciudad} onChange={set('ciudad')} />
              </label>
              <label>
                Localidad
                <input value={d.localidad} onChange={set('localidad')} />
              </label>
            </>
          )}

          {!esRopa && (
            <label>
              Cantidad
              <input type="number" min="1" step="1" value={d.cantidad} onChange={set('cantidad')} />
            </label>
          )}

          <label>
            Precio de compra{!esRopa && ' (por unidad)'} (COP)
            <input type="number" min="0" step="1" inputMode="numeric" value={d.precio_compra} onChange={set('precio_compra')} />
          </label>
          <label>
            Precio de venta{!esRopa && ' (por unidad)'} (COP)
            <input type="number" min="0" step="1" inputMode="numeric" value={d.precio_venta} onChange={set('precio_venta')} />
          </label>

          {!esBoleta && (
            <label>
              Precio de envío (COP)
              <input type="number" min="0" step="1" inputMode="numeric" value={d.costo_envio} onChange={set('costo_envio')} />
            </label>
          )}

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
