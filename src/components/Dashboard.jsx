import { TIPOS, calcular, cop, fechaCorta } from '../lib/format'

export default function Dashboard({ ventas, onVerVentas }) {
  const total = { ingresos: 0, egresos: 0, ganancia: 0 }
  const porTipo = {}
  Object.keys(TIPOS).forEach((t) => (porTipo[t] = { ventas: 0, egresos: 0, ingresos: 0, ganancia: 0 }))

  ventas.forEach((v) => {
    const c = calcular(v)
    total.ingresos += c.ingreso
    total.egresos += c.egreso
    total.ganancia += c.ganancia
    const g = porTipo[v.tipo] || porTipo.otro
    g.ventas += 1
    g.egresos += c.egreso
    g.ingresos += c.ingreso
    g.ganancia += c.ganancia
  })

  return (
    <>
      <section className="tarjetas">
        <Tarjeta titulo="Ingresos" valor={cop(total.ingresos)} nota="Total vendido" />
        <Tarjeta titulo="Egresos" valor={cop(total.egresos)} nota="Compra + envío" />
        <Tarjeta
          titulo="Ganancias totales"
          valor={cop(total.ganancia)}
          nota="Ingresos − egresos"
          tono={total.ganancia < 0 ? 'neg' : 'pos'}
        />
        <Tarjeta titulo="Número de ventas" valor={ventas.length.toLocaleString('es-CO')} nota="Registradas" />
      </section>

      <section className="bloque">
        <h2>Dinero invertido por categoría</h2>
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="num">Ventas</th>
                <th className="num">Invertido</th>
                <th className="num">Ingresos</th>
                <th className="num">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TIPOS).map(([k, nombre]) => (
                <tr key={k}>
                  <td>{nombre}</td>
                  <td className="num">{porTipo[k].ventas}</td>
                  <td className="num">{cop(porTipo[k].egresos)}</td>
                  <td className="num">{cop(porTipo[k].ingresos)}</td>
                  <td className={'num ' + (porTipo[k].ganancia < 0 ? 'neg' : 'pos')}>{cop(porTipo[k].ganancia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bloque">
        <div className="bloque-cab">
          <h2>Últimas ventas</h2>
          <button className="btn" onClick={onVerVentas}>
            Ver todas
          </button>
        </div>
        {ventas.length === 0 ? (
          <p className="vacio">Aún no hay ventas. Registra la primera con “Nueva venta”.</p>
        ) : (
          <ul className="lista">
            {ventas.slice(0, 5).map((v) => {
              const c = calcular(v)
              return (
                <li key={v.id}>
                  <div>
                    <strong>{v.nombre}</strong>
                    <span className="sub">
                      {TIPOS[v.tipo]} · {fechaCorta(v.fecha)}
                    </span>
                  </div>
                  <div className="der">
                    <span>{cop(c.ingreso)}</span>
                    <span className={'sub ' + (c.ganancia < 0 ? 'neg' : 'pos')}>{cop(c.ganancia)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

function Tarjeta({ titulo, valor, nota, tono }) {
  return (
    <div className="tarjeta">
      <span className="tarjeta-titulo">{titulo}</span>
      <span className={'tarjeta-valor ' + (tono || '')}>{valor}</span>
      <span className="tarjeta-nota">{nota}</span>
    </div>
  )
}
