import { useMemo, useState } from 'react'
import { TIPOS, calcular, cop, fechaCorta } from '../lib/format'

function detalle(v) {
  if (v.tipo === 'ropa') return [v.marca, v.talla && `Talla ${v.talla}`].filter(Boolean).join(' · ')
  if (v.tipo === 'boleta') {
    return [v.localidad, v.ciudad, v.evento_fecha && fechaCorta(v.evento_fecha), v.cantidad > 1 && `x${v.cantidad}`]
      .filter(Boolean)
      .join(' · ')
  }
  return v.cantidad > 1 ? `x${v.cantidad}` : ''
}

export default function Ventas({ ventas, onEditar, onEliminar }) {
  const [tipo, setTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return ventas.filter((v) => {
      if (tipo !== 'todos' && v.tipo !== tipo) return false
      if (!q) return true
      return [v.nombre, v.marca, v.ciudad, v.cliente_nombre, v.cliente_contacto]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q))
    })
  }, [ventas, tipo, busqueda])

  return (
    <section className="bloque">
      <div className="filtros">
        <div className="chips">
          {[['todos', 'Todas'], ...Object.entries(TIPOS)].map(([k, nombre]) => (
            <button key={k} className={tipo === k ? 'chip activo' : 'chip'} onClick={() => setTipo(k)}>
              {nombre}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar por nombre, marca, ciudad o cliente"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="vacio">No hay ventas que coincidan.</p>
      ) : (
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Artículo</th>
                <th>Cliente</th>
                <th className="num">Compra</th>
                <th className="num">Envío</th>
                <th className="num">Venta</th>
                <th className="num">Ganancia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((v) => {
                const c = calcular(v)
                const cant = Number(v.cantidad) || 1
                return (
                  <tr key={v.id}>
                    <td>{fechaCorta(v.fecha)}</td>
                    <td>
                      <span className={'etiqueta ' + v.tipo}>{TIPOS[v.tipo]}</span>
                    </td>
                    <td>
                      <strong>{v.nombre}</strong>
                      <span className="sub">{detalle(v)}</span>
                    </td>
                    <td>
                      {v.cliente_nombre || <span className="sub">—</span>}
                      {v.cliente_contacto && <span className="sub">{v.cliente_contacto}</span>}
                    </td>
                    <td className="num">{cop(v.precio_compra * cant)}</td>
                    <td className="num">{cop(v.costo_envio)}</td>
                    <td className="num">{cop(c.ingreso)}</td>
                    <td className={'num ' + (c.ganancia < 0 ? 'neg' : 'pos')}>{cop(c.ganancia)}</td>
                    <td className="acciones">
                      <button className="btn peq" onClick={() => onEditar(v)}>
                        Editar
                      </button>
                      <button className="btn peq peligro" onClick={() => onEliminar(v)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
