export function generatePlan({ region, budget }) {
  const plan = {
    compost: '2 bags',
    mulch: '1 bag',
    plants: '3 identical plants'
  }

  if (budget > 150) plan.biochar = '1 bag'
  if (budget > 250) plan.basalt = '1 bag'

  plan.watering = region === 'LA' ? '3x per week' : 'adjust locally'

  return plan
}
