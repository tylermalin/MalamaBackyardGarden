# Mālama Backyard Carbon Garden Lab

A forkable, real-world protocol and web tool for setting up a backyard soil-carbon experiment, collecting consistent field data, and comparing plot performance over time.

## What this is

The Mālama Backyard Carbon Garden Lab is a simple 3-plot experiment designed for homes, schools, community gardens, and local climate education projects.

Participants create three comparable plots:

| Plot | Treatment | Purpose |
|---|---|---|
| A | Control | Baseline soil behavior |
| B | Biochar | Carbon-rich soil amendment |
| C | Biochar + Basalt | Carbon input plus mineral amendment |

The goal is not to issue carbon credits. The goal is to teach measurement, improve soil literacy, build repeatable local datasets, and introduce sensor-based environmental verification.

## What the app does

The app guides users through a linear workflow:

1. Generate a region- and budget-specific project plan.
2. Review the 3-plot setup.
3. Complete a build checklist.
4. Log measurements for Plots A, B, and C.
5. View first-insight comparisons.
6. Score plot performance and dataset quality.
7. Export CSV data.
8. Prepare contribution-ready datasets.

## First insight logic

The first insight should answer one question:

> Is one plot already behaving differently?

The app prioritizes early signals in this order:

1. Moisture retention
2. Moisture stability
3. Plant health
4. Temperature stability
5. Carbon input record

The app uses signal language, not proof language. It says “current leader” or “early signal,” not “best carbon sequestration.”

## Carbon model note

This project uses educational estimates only.

- Biochar contribution is estimated from the amount added.
- Plant growth is treated as a proxy signal.
- Basalt/enhanced weathering claims require lab testing and formal MRV.

This project is not designed for carbon credit issuance.

## Local setup

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Repo structure

```text
src/
  App.jsx              Main route/state shell
  main.jsx             React entry
  styles.css           UI styles
  data/presets.js      Region and budget defaults
  logic/generator.js   Project plan generation
  logic/scoring.js     Plot/user scoring model
  logic/exportCsv.js   CSV export helpers
protocol/
  three-plot-method.md Field method
  carbon-model.md      Educational model
contrib/
  datasets/            Community-submitted datasets
  regions/             Regional calibration forks
```

## Contribution rules

A useful contribution should include:

- Entries for Plot A, B, and C on the same date
- Consistent units
- At least 7 days of readings
- Photo evidence where possible
- Region, plot size, plant type, and amendment details

## License

MIT
