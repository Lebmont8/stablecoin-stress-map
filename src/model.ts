export type Sample = { hour: number; price: number };
type Scenario = { id: string; name: string; color: string; samples: Sample[] };

function samples(values: [number, number][]): Sample[] {
  return values.map(([hour, price]) => ({ hour, price }));
}

export const SCENARIOS: Scenario[] = [
  { id: 'wick', name: 'Fast wick', color: '#9ecbff', samples: samples([
    [0, 1], [2, .998], [4, .951], [6, .996], [9, 1.002], [24, 1],
  ]) },
  { id: 'bleed', name: 'Slow bleed', color: '#ffbf92', samples: samples([
    [0, 1], [3, .994], [6, .981], [10, .947], [13, .932], [17, .95], [21, .978], [24, .985],
  ]) },
  { id: 'double', name: 'Double dip', color: '#c3ed9d', samples: samples([
    [0, 1.001], [4, .979], [7, .996], [10, .997], [13, .976], [16, .985], [20, .999], [24, 1],
  ]) },
];

export function analyze(samples: Sample[], threshold: number) {
  if (!samples.length || !Number.isFinite(threshold)) throw new RangeError('Missing samples or threshold.');
  const low = samples.reduce((best, current) => current.price < best.price ? current : best);
  let episodes = Number(samples[0].price < threshold);
  let hoursBelow = 0;
  let lastRecovery: number | null = null;
  for (let i = 1; i < samples.length; i++) {
    const first = samples[i - 1], second = samples[i];
    const interval = second.hour - first.hour;
    if (interval <= 0) throw new RangeError('Samples must have strictly increasing times.');
    const startedBelow = first.price < threshold;
    const endedBelow = second.price < threshold;
    if (startedBelow && endedBelow) {
      hoursBelow += interval;
    } else if (startedBelow !== endedBelow) {
      const point = first.hour + interval * (threshold - first.price) / (second.price - first.price);
      if (endedBelow) {
        episodes++;
        hoursBelow += second.hour - point;
        lastRecovery = null;
      } else {
        hoursBelow += point - first.hour;
        lastRecovery = point;
      }
    }
  }
  return { low, maxDrawdown: Math.max(0, 1 - low.price), episodes, hoursBelow, lastRecovery };
}
