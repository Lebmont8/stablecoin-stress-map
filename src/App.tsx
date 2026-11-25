import { useState } from 'react';
import { Metric, Page } from './layout.tsx';
import { analyze, SCENARIOS } from './model.ts';
import { Plot } from './Plot.tsx';

const dollars = (value: number) => '$' + value.toFixed(3);
const hours = (value: number) => value.toFixed(1) + ' h';

export function App() {
  const [threshold, setThreshold] = useState(.99);
  const [selection, setSelection] = useState(SCENARIOS.map(scenario => scenario.id));
  const shown = SCENARIOS.filter(scenario => selection.includes(scenario.id));
  const comparisons = shown.map(scenario => analyze(scenario.samples, threshold));
  const series = shown.map(scenario => ({
    color: scenario.color,
    points: scenario.samples.map(sample => ({ x: sample.hour, y: sample.price })),
  }));
  const guide = { color: '#e4e9e5', dashed: true, points: [{ x: 0, y: threshold }, { x: 24, y: threshold }] };

  function toggle(id: string) {
    setSelection(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  }

  return <Page>
    <div className="panel controls">
      <label className="wide" htmlFor="threshold">
        <span>Depeg threshold<span className="value" aria-hidden="true">{dollars(threshold)}</span></span>
        <input id="threshold" type="range" aria-valuetext={dollars(threshold)} min=".90" max=".999" step=".001" value={threshold}
          onChange={event => setThreshold(event.target.valueAsNumber)} />
      </label>
      <fieldset className="scenario-options wide">
        <legend>Scenarios to compare</legend>
        {SCENARIOS.map(scenario => <label className="check" key={scenario.id}>
          <input type="checkbox" checked={selection.includes(scenario.id)}
            disabled={selection.length === 1 && selection[0] === scenario.id}
            onChange={() => toggle(scenario.id)} />
          {scenario.name}
        </label>)}
      </fieldset>
    </div>
    <section className="panel chart-panel" aria-labelledby="stress-chart">
      <h2 id="stress-chart">Price through the stress event</h2>
      <Plot series={[...series, guide]} xMax={24} yMin={.9} yMax={1.01}
        xLabel="Elapsed hours" yLabel="Stablecoin price (USD)"
        description={shown.map((scenario, index) => scenario.name + ': low ' + dollars(comparisons[index].low.price) +
          ' at ' + hours(comparisons[index].low.hour)).join('. ')}
        formatX={value => value + 'h'} formatY={dollars} />
      <div className="legend">
        {shown.map(scenario => <span key={scenario.id}><i aria-hidden="true" style={{ color: scenario.color }} />{scenario.name}</span>)}
        <span className="dashed">Threshold {dollars(threshold)}</span>
      </div>
    </section>
    <div className="cards trio">
      {shown.map((scenario, index) => {
        const result = comparisons[index];
        const recovery = result.episodes === 0 ? 'No breach'
          : result.lastRecovery === null ? 'Not recovered by 24 h' : hours(result.lastRecovery);
        return <section key={scenario.id} className="panel">
          <h3>{scenario.name}</h3>
          <dl>
            <Metric label="Lowest price">{dollars(result.low.price)}</Metric>
            <Metric label="Max drop from $1">{(result.maxDrawdown * 100).toFixed(1)}%</Metric>
            <Metric label="Time below threshold">{hours(result.hoursBelow)}</Metric>
            <Metric label="Breaches">{result.episodes}</Metric>
            <Metric label="Last recovery (elapsed)">{recovery}</Metric>
          </dl>
        </section>;
      })}
    </div>
    <p className="note">Synthetic scenarios, not historical stablecoin prices. Threshold crossings are interpolated between samples.</p>
  </Page>;
}
