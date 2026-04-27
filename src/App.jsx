import { useState, useEffect } from 'react'
import { generatePlan } from './logic/generator'
import { scorePlots, firstInsight } from './logic/scoring'
import { exportToCsv } from './logic/exportCsv'
import MoistureChart from './components/MoistureChart'
import ComparisonCard from './components/ComparisonCard'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [region, setRegion] = useState('LA')
  const [budget, setBudget] = useState(100)
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('entries') || '[]'))
  const [form, setForm] = useState({ plot: 'A', moisture: '', temperature: '', plantStatus: 'healthy' })

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries))
  }, [entries])

  const plan = generatePlan({ region, budget })
  const plots = scorePlots(entries)
  const insight = firstInsight(entries)

  function addEntry() {
    if (!form.moisture) return
    setEntries([...entries, { ...form, date: new Date().toISOString().slice(0,10) }])
  }

  if (screen === 'landing') {
    return <div className="container"><h1>Backyard Carbon Lab</h1><button onClick={() => setScreen('inputs')}>Start</button></div>
  }

  if (screen === 'inputs') {
    return <div className="container"><h2>Setup</h2><input value={budget} onChange={e => setBudget(Number(e.target.value))}/><select onChange={e => setRegion(e.target.value)}><option>LA</option><option>Hawaii</option></select><button onClick={() => setScreen('plan')}>Next</button></div>
  }

  if (screen === 'plan') {
    return <div className="container"><h2>Plan</h2><pre>{JSON.stringify(plan,null,2)}</pre><button onClick={() => setScreen('log')}>Start Logging</button></div>
  }

  if (screen === 'log') {
    return (
      <div className="container">
        <h2>Log Entry</h2>
        <select onChange={e => setForm({ ...form, plot: e.target.value })}><option>A</option><option>B</option><option>C</option></select>
        <input placeholder="Moisture" onChange={e => setForm({ ...form, moisture: e.target.value })} />
        <input placeholder="Temp" onChange={e => setForm({ ...form, temperature: e.target.value })} />
        <select onChange={e => setForm({ ...form, plantStatus: e.target.value })}><option>healthy</option><option>neutral</option><option>stressed</option></select>
        <button onClick={addEntry}>Save</button>
        <button onClick={() => setScreen('insight')}>View Insights</button>
      </div>
    )
  }

  if (screen === 'insight') {
    return (
      <div className="container">
        <h2>{insight.title}</h2>
        <p>{insight.body}</p>
        <p>Confidence: {insight.confidence}</p>
        <ComparisonCard plots={plots} />
        <MoistureChart entries={entries} />
        <button onClick={() => exportToCsv(entries)}>Export CSV</button>
      </div>
    )
  }

  return null
}
