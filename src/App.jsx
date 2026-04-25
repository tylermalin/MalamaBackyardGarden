import { useState } from 'react'
import { generatePlan } from './logic/generator'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [region, setRegion] = useState('LA')
  const [budget, setBudget] = useState(100)

  const plan = generatePlan({ region, budget })

  if (screen === 'landing') {
    return (
      <div className="container">
        <h1>Build a backyard carbon lab in 48 hours</h1>
        <button onClick={() => setScreen('inputs')}>Generate my plan</button>
      </div>
    )
  }

  if (screen === 'inputs') {
    return (
      <div className="container">
        <h2>Set up your plan</h2>
        <input value={budget} onChange={e => setBudget(Number(e.target.value))} />
        <select onChange={e => setRegion(e.target.value)}>
          <option value="LA">LA</option>
          <option value="Hawaii">Hawaii</option>
        </select>
        <button onClick={() => setScreen('plan')}>Generate</button>
      </div>
    )
  }

  if (screen === 'plan') {
    return (
      <div className="container">
        <h2>Your Plan</h2>
        <pre>{JSON.stringify(plan, null, 2)}</pre>
        <button onClick={() => setScreen('log')}>Start logging</button>
      </div>
    )
  }

  if (screen === 'log') {
    return (
      <div className="container">
        <h2>Log data (placeholder)</h2>
        <button onClick={() => setScreen('insight')}>View insights</button>
      </div>
    )
  }

  if (screen === 'insight') {
    return (
      <div className="container">
        <h2>First Signal</h2>
        <p>Plot C is holding more moisture than control.</p>
      </div>
    )
  }

  return null
}
