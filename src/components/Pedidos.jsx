import { useMemo, useState } from 'react'
import { ESTADOS, calcular, cop, estadoLabel, fechaCorta } from '../lib/format'

export default function Pedidos({ pedidos, error, onNuevo, onEditar, onEliminar, onCambiarEstado, onVerVentas }) {
  const [filtro, setFiltro] = useState('curso')
  const [busqueda, setBusqueda] = useState('')

  const conteo = useMemo(() => {
    const c = { todos: pedidos.length, curso: 0 }
    ESTADOS.forEach((e) => (c[e.id] = 0))
    pedidos.forEach((p) => {
      c[p.estado] = (c[p.estado] || 0) + 1
      if (p.estado !== 'finalizada') c.curso += 1
    })
    return c
  }, [pedidos])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return pedidos.filter((p) => {
      if (filtro === 'curso' && p.estado === 'finalizada') return false
      if (filtro !== 'curso' && filtro !== 'todos' && p.estado !== filtro) return false
      if (!q) return true
      return [p.nombre, p.marca, p.cliente_nombre, p.cliente_contacto]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q))
    })
  }, [pedidos, filtro, busqueda])

  const chips = [['curso', 'En curso'], ...ESTADOS.map((e) => [e.id, e.label]), ['todos', 'Todos']]

  if (error) {
    const faltaTabla = /pedidos/i.test(error) && /(schema cache|does not exist|relation)/i.test(error)
    return (
      <section className="bloque">
        <div className="bloque-cab">
          <h2>Pedidos</h2>
        </div>
        <p className="error-form">No se pudieron cargar los pedidos: {error}</p>
        {faltaTabla && (
          <p className="vacio">
            Falta crear la tabla en Supabase: ejecuta el archivo <code>supabase/pedidos.sql</code> en SQL Editor.
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="bloque">
      <div className="bloque-cab">
        <h2>Pedidos</h2>
        <button className="btn primario" onClick={onNuevo}>
          + Nuevo pedido
        </button>
      </div>

      <div className="filtros">
        <div className="chips">
          {chips.map(([k, nombre]) => (
            <button key={k} className={filtro === k ? 'chip activo' : 'chip'} onClick={() => setFiltro(k)}>
              {nombre} · {conteo[k] || 0}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar por prenda, marca o cliente"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="vacio">
          {pedidos.length === 0 ? 'Aún no hay pedidos. Crea el primero con “Nuevo pedido”.' : 'No hay pedidos que coincidan.'}
        </p>
      ) : (
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prenda</th>
                <th>Cliente</th>
                <th className="num">Compra</th>
                <th className="num">Envío</th>
                <th className="num">Venta</th>
                <th className="num">Ganancia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const c = calcular({ ...p, cantidad: 1 })
                const final = p.estado === 'finalizada'
                return (
                  <tr key={p.id}>
                    <td>{fechaCorta(p.fecha)}</td>
                    <td>
                      <strong>{p.nombre}</strong>
                      <span className="sub">{[p.marca, p.talla && `Talla ${p.talla}`].filter(Boolean).join(' · ')}</span>
                      {p.notas && <span className="sub">{p.notas}</span>}
                    </td>
                    <td>
                      {p.cliente_nombre || <span className="sub">—</span>}
                      {p.cliente_contacto && <span className="sub">{p.cliente_contacto}</span>}
                    </td>
                    <td className="num">{cop(p.precio_compra)}</td>
                    <td className="num">{cop(p.costo_envio)}</td>
                    <td className="num">{cop(p.precio_venta)}</td>
                    <td className={'num ' + (c.ganancia < 0 ? 'neg' : 'pos')}>{cop(c.ganancia)}</td>
                    <td>
                      {final ? (
                        <>
                          <span className="etiqueta estado-finalizada">{estadoLabel(p.estado)}</span>
                          <button className="enlace" onClick={onVerVentas}>
                            Ver en Ventas
                          </button>
                        </>
                      ) : (
                        <select
                          className={'sel-estado estado-' + p.estado}
                          value={p.estado}
                          onChange={(e) => onCambiarEstado(p, e.target.value)}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="acciones">
                      {!final && (
                        <button className="btn peq" onClick={() => onEditar(p)}>
                          Editar
                        </button>
                      )}
                      <button className="btn peq peligro" onClick={() => onEliminar(p)}>
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
