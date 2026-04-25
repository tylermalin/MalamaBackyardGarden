export default function ComparisonCard({ plots }) {
  if (!plots.length) return null

  const leader = plots[0]
  const control = plots.find(p => p.plot === 'A')

  return (
    <div className="card">
      <h3>Current leader: Plot {leader.plot}</h3>
      <p>Score: {leader.score} / 100</p>
      <p>Signal: {leader.label}</p>
      {control && leader.plot !== 'A' && (
        <p>Moisture difference vs control: {leader.moistureLift}%</p>
      )}
    </div>
  )
}
