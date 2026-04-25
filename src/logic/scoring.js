const PLOTS = ['A', 'B', 'C']

export function getCompleteSessions(entries) {
  const byDate = entries.reduce((acc, entry) => {
    acc[entry.date] = acc[entry.date] || []
    acc[entry.date].push(entry)
    return acc
  }, {})

  return Object.entries(byDate)
    .map(([date, rows]) => ({ date, rows }))
    .filter(session => PLOTS.every(plot => session.rows.some(row => row.plot === plot)))
}

export function average(values) {
  const clean = values.map(Number).filter(value => Number.isFinite(value))
  if (!clean.length) return 0
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

function moistureScore(plotAvg, controlAvg, plot) {
  if (!controlAvg) return 0
  if (plot === 'A') return 10

  const lift = ((plotAvg - controlAvg) / controlAvg) * 100
  if (lift >= 20) return 35
  if (lift >= 10) return 25
  if (lift >= 5) return 15
  if (lift > -5) return 5
  return 0
}

function stabilityScore(readings) {
  const nums = readings.map(Number).filter(value => Number.isFinite(value))
  if (nums.length < 2) return 0
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const avg = average(nums)
  if (!avg) return 0
  const swing = ((max - min) / avg) * 100
  if (swing <= 10) return 15
  if (swing <= 20) return 10
  if (swing <= 30) return 5
  return 0
}

function plantHealthPoints(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'new growth') return 4
  if (normalized === 'healthy') return 3
  if (normalized === 'neutral') return 1
  if (normalized === 'stressed') return -2
  if (normalized === 'wilting') return -2
  if (normalized === 'yellowing') return -2
  if (normalized === 'pest damage') return -2
  if (normalized === 'dead') return -8
  return 0
}

function plantHealthScore(plotEntries) {
  if (!plotEntries.length) return 0
  const points = plotEntries.reduce((sum, entry) => sum + plantHealthPoints(entry.plantStatus), 0)
  const max = plotEntries.length * 4
  const min = plotEntries.length * -8
  const normalized = ((points - min) / (max - min)) * 25
  return Math.max(0, Math.min(25, Math.round(normalized)))
}

function temperatureScore(plotEntries, controlEntries, plot) {
  if (plot === 'A') return 6
  const plotTemps = plotEntries.map(e => Number(e.temperature)).filter(Number.isFinite)
  const controlTemps = controlEntries.map(e => Number(e.temperature)).filter(Number.isFinite)
  if (plotTemps.length < 2 || controlTemps.length < 2) return 0
  const plotRange = Math.max(...plotTemps) - Math.min(...plotTemps)
  const controlRange = Math.max(...controlTemps) - Math.min(...controlTemps)
  if (plotRange < controlRange) return 10
  if (plotRange === controlRange) return 6
  return 3
}

function carbonInputScore(plot, entries) {
  if (plot === 'C') return 5
  if (plot === 'B') return 5
  const hasMulchOrCompost = entries.some(entry => entry.actions?.includes('mulch') || entry.actions?.includes('compost'))
  return hasMulchOrCompost ? 3 : 0
}

export function scorePlots(entries) {
  const plotGroups = PLOTS.reduce((acc, plot) => {
    acc[plot] = entries.filter(entry => entry.plot === plot)
    return acc
  }, {})

  const controlAvg = average(plotGroups.A.map(entry => entry.moisture))

  return PLOTS.map(plot => {
    const plotEntries = plotGroups[plot]
    const avgMoisture = average(plotEntries.map(entry => entry.moisture))
    const score =
      moistureScore(avgMoisture, controlAvg, plot) +
      stabilityScore(plotEntries.map(entry => entry.moisture)) +
      plantHealthScore(plotEntries) +
      temperatureScore(plotEntries, plotGroups.A, plot) +
      10 +
      carbonInputScore(plot, plotEntries)

    return {
      plot,
      score: Math.min(100, Math.round(score)),
      avgMoisture: Math.round(avgMoisture * 10) / 10,
      label: rankPlot(score),
      entries: plotEntries.length,
      moistureLift: plot === 'A' || !controlAvg ? 0 : Math.round(((avgMoisture - controlAvg) / controlAvg) * 100)
    }
  }).sort((a, b) => b.score - a.score)
}

export function rankPlot(score) {
  if (score >= 80) return 'Strong performer'
  if (score >= 60) return 'Promising'
  if (score >= 40) return 'Mixed signal'
  if (score >= 20) return 'Weak signal'
  return 'Needs more data'
}

export function confidenceLabel(entries) {
  const counts = PLOTS.map(plot => entries.filter(entry => entry.plot === plot).length)
  const minEntries = Math.min(...counts)
  if (minEntries <= 2) return 'Too early'
  if (minEntries <= 6) return 'Low'
  if (minEntries <= 20) return 'Medium'
  return 'Higher'
}

export function firstInsight(entries) {
  const ranked = scorePlots(entries)
  const leader = ranked[0]
  const control = ranked.find(plot => plot.plot === 'A')
  if (!leader || entries.length < 3) {
    return {
      title: 'Not enough data yet',
      body: 'Log Plot A, B, and C on the same day to unlock your first comparison.',
      leader: null,
      confidence: confidenceLabel(entries)
    }
  }

  if (leader.plot === 'A') {
    return {
      title: 'No amended plot is leading yet',
      body: 'The control plot is currently performing best. Keep conditions equal and continue logging.',
      leader,
      confidence: confidenceLabel(entries)
    }
  }

  return {
    title: `Plot ${leader.plot} is showing the strongest early signal`,
    body: `Plot ${leader.plot} is holding ${Math.abs(leader.moistureLift)}% ${leader.moistureLift >= 0 ? 'more' : 'less'} moisture than the control, with a current score of ${leader.score}/100.`,
    leader,
    control,
    confidence: confidenceLabel(entries)
  }
}

export function scoreUserDataset(entries, metadata = {}) {
  if (!entries.length) return { score: 0, rank: 'Incomplete', ready: false, improvements: ['Log your first entries for Plot A, B, and C.'] }

  const sessions = Object.values(entries.reduce((acc, entry) => {
    acc[entry.date] = acc[entry.date] || []
    acc[entry.date].push(entry)
    return acc
  }, {}))

  const completeSessions = sessions.filter(session => PLOTS.every(plot => session.some(entry => entry.plot === plot)))
  const completeness = completeSessions.length / sessions.length
  const photoRate = entries.filter(entry => entry.photo || entry.photoName).length / entries.length
  const days = new Set(entries.map(entry => entry.date)).size
  const requiredMeta = ['region', 'plotSize', 'plantType', 'wateringMethod']
  const metaCompleteness = requiredMeta.filter(key => metadata[key]).length / requiredMeta.length

  let score = 0
  score += completeness >= 0.95 ? 30 : completeness >= 0.75 ? 20 : completeness >= 0.5 ? 10 : 0
  score += metadata.consistentUnits ? 10 : 0
  score += metadata.sameTimeOfDay ? 10 : 0
  score += metadata.sameMeasurementMethod ? 5 : 0
  score += photoRate >= 0.95 ? 15 : photoRate >= 0.75 ? 10 : photoRate >= 0.4 ? 5 : 0
  score += days >= 21 ? 15 : days >= 14 ? 10 : days >= 7 ? 7 : days >= 3 ? 3 : 0
  score += metaCompleteness >= 1 ? 10 : metaCompleteness >= 0.75 ? 6 : metaCompleteness >= 0.4 ? 3 : 0
  score += metadata.datasetHash ? 5 : 3

  const improvements = []
  if (completeness < 0.95) improvements.push('Log Plot A, B, and C every session.')
  if (photoRate < 0.95) improvements.push('Add photos for every plot entry.')
  if (days < 7) improvements.push(`Log ${7 - days} more day${7 - days === 1 ? '' : 's'} to reach contribution readiness.`)
  if (metaCompleteness < 1) improvements.push('Complete region, plot size, plant type, and watering metadata.')

  return {
    score: Math.min(100, Math.round(score)),
    rank: rankDataset(score),
    ready: days >= 7 && completeness >= 0.75 && metaCompleteness >= 0.75,
    improvements
  }
}

export function rankDataset(score) {
  if (score >= 90) return 'Verified Contributor'
  if (score >= 75) return 'High-Quality Dataset'
  if (score >= 50) return 'Useful Pilot'
  if (score >= 25) return 'Needs Cleanup'
  return 'Incomplete'
}
