import { useCallback, useEffect, useState } from 'react'
import { supabase, configurado } from './lib/supabase'
import Dashboard from './components/Dashboard'
import Ventas from './components/Ventas'
import VentaForm from './components/VentaForm'
import Pedidos from './components/Pedidos'
import PedidoForm from './components/PedidoForm'
import { estadoLabel } from './lib/format'

export default function App() {
  const [vista, setVista] = useState('panel')
  const [ventas, setVentas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorPedidos, setErrorPedidos] = useState('')
  const [form, setForm] = useState(null) // null = cerrado, {} = nueva, {...} = editar
  const [formPedido, setFormPedido] = useState(null)

  const cargar = useCallback(async () => {
    if (!configurado) {
      setCargando(false)
      return
    }
    setCargando(true)
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setError('')
      setVentas(data)
    }
    setCargando(false)
  }, [])

  const cargarPedidos = useCallback(async () => {
    if (!configurado) return
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setErrorPedidos(error.message)
    } else {
      setErrorPedidos('')
      setPedidos(data)
    }
  }, [])

  useEffect(() => {
    cargar()
    cargarPedidos()
  }, [cargar, cargarPedidos])

  async function guardar(payload, id) {
    const consulta = id
      ? supabase.from('ventas').update(payload).eq('id', id)
      : supabase.from('ventas').insert(payload)
    const { error } = await consulta
    if (error) return error.message
    await cargar()
    setForm(null)
    return null
  }

  async function eliminar(venta) {
    if (!window.confirm(`¿Eliminar la venta "${venta.nombre}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('ventas').delete().eq('id', venta.id)
    if (error) window.alert(error.message)
    else cargar()
  }

  async function guardarPedido(payload, id) {
    const consulta = id
      ? supabase.from('pedidos').update(payload).eq('id', id)
      : supabase.from('pedidos').insert(payload)
    const { error } = await consulta
    if (error) return error.message
    await cargarPedidos()
    setFormPedido(null)
    return null
  }

  async function cambiarEstado(pedido, estado) {
    if (estado === pedido.estado) return
    if (estado === 'finalizada') {
      const ok = window.confirm(
        `¿Marcar "${pedido.nombre}" como ${estadoLabel(estado)}?\n\n` +
          'Se creará automáticamente una venta y el pedido ya no se podrá modificar.',
      )
      if (!ok) {
        await cargarPedidos() // restablece el selector
        return
      }
    }
    const { error } = await supabase.from('pedidos').update({ estado }).eq('id', pedido.id)
    if (error) window.alert(error.message)
    // si se finalizó, la venta nueva debe aparecer también en Ventas y en el Panel
    await Promise.all([cargarPedidos(), estado === 'finalizada' ? cargar() : Promise.resolve()])
  }

  async function eliminarPedido(pedido) {
    const aviso =
      pedido.estado === 'finalizada'
        ? ' La venta que se creó a partir de este pedido NO se elimina.'
        : ''
    if (!window.confirm(`¿Eliminar el pedido "${pedido.nombre}"?${aviso} Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('pedidos').delete().eq('id', pedido.id)
    if (error) window.alert(error.message)
    else cargarPedidos()
  }

  if (!configurado) {
    return (
      <main className="centro">
        <div className="aviso">
          <h1>Falta conectar Supabase</h1>
          <p>
            Crea un archivo <code>.env</code> (o configura las variables en Vercel) con{' '}
            <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>. Los pasos están en
            el README.
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <span className="logo">YK</span>
          <span>Store</span>
        </div>
        <nav>
          <button className={vista === 'panel' ? 'tab activo' : 'tab'} onClick={() => setVista('panel')}>
            Panel
          </button>
          <button className={vista === 'ventas' ? 'tab activo' : 'tab'} onClick={() => setVista('ventas')}>
            Ventas
          </button>
          <button className={vista === 'pedidos' ? 'tab activo' : 'tab'} onClick={() => setVista('pedidos')}>
            Pedidos
          </button>
        </nav>
        <button className="btn primario" onClick={() => setForm({})}>
          + Nueva venta
        </button>
      </header>

      <main className="contenido">
        {error && (
          <div className="error">
            No se pudieron cargar las ventas: {error}
            <button className="btn" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}
        {vista === 'pedidos' ? (
          <Pedidos
            pedidos={pedidos}
            error={errorPedidos}
            onNuevo={() => setFormPedido({})}
            onEditar={setFormPedido}
            onEliminar={eliminarPedido}
            onCambiarEstado={cambiarEstado}
            onVerVentas={() => setVista('ventas')}
          />
        ) : cargando && ventas.length === 0 ? (
          <p className="vacio">Cargando…</p>
        ) : vista === 'panel' ? (
          <Dashboard ventas={ventas} onVerVentas={() => setVista('ventas')} />
        ) : (
          <Ventas ventas={ventas} onEditar={setForm} onEliminar={eliminar} />
        )}
      </main>

      {form && <VentaForm inicial={form} onCerrar={() => setForm(null)} onGuardar={guardar} />}
      {formPedido && (
        <PedidoForm inicial={formPedido} onCerrar={() => setFormPedido(null)} onGuardar={guardarPedido} />
      )}
    </div>
  )
}
