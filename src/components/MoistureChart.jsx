const PLOTS = ['A', 'B', 'C']

function groupByDate(entries) {
  const dates = [...new Set(entries.map(entry => entry.date))].sort()
  return dates.map(date => {
    const row = { date }
    PLOTS.forEach(plot => {
      const match = entries.find(entry => entry.date === date && entry.plot === plot)
      row[plot] = match ? Number(match.moisture) : null
    })
    return row
  })
}

export default function MoistureChart({ entries }) {
  const data = groupByDate(entries)
  const values = data.flatMap(row => PLOTS.map(plot => row[plot])).filter(Number.isFinite)

  if (!data.length || values.length < 2) {
    return <p className="muted">Log at least two readings to unlock the moisture chart.</p>
  }

  const width = 720
  const height = 280
  const padding = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  function x(index) {
    if (data.length === 1) return padding
    return padding + (index / (data.length - 1)) * (width - padding * 2)
  }

  function y(value) {
    return height - padding - ((value - min) / span) * (height - padding * 2)
  }

  function pointsFor(plot) {
    return data
      .map((row, index) => row[plot] == null ? null : `${x(index)},${y(row[plot])}`)
      .filter(Boolean)
      .join(' ')
  }

  return (
    <div className="chartCard">
      <div className="chartHeader">
        <h3>Soil moisture over time</h3>
        <p>Compare amended plots against the control.</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        {PLOTS.map(plot => (
          <polyline key={plot} points={pointsFor(plot)} className={`line line${plot}`} />
        ))}
        {data.map((row, index) => (
          <text key={row.date} x={x(index)} y={height - 8} textAnchor="middle" className="axisLabel">
            {row.date.slice(5)}
          </text>
        ))}
        <text x={padding - 8} y={padding} textAnchor="end" className="axisLabel">{Math.round(max)}</text>
        <text x={padding - 8} y={height - padding} textAnchor="end" className="axisLabel">{Math.round(min)}</text>
      </svg>
      <div className="legend">
        <span><b className="dot dotA" /> Plot A Control</span>
        <span><b className="dot dotB" /> Plot B Biochar</span>
        <span><b className="dot dotC" /> Plot C Biochar + Basalt</span>
      </div>
    </div>
  )
}
