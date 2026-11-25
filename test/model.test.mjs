import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, SCENARIOS } from '../src/model.ts';

test('crossings are estimated between observations', () => {
  const result = analyze([
    { hour: 0, price: 1 }, { hour: 4, price: .98 }, { hour: 8, price: 1 },
  ], .99);
  assert.equal(result.episodes, 1);
  assert.equal(result.hoursBelow, 4);
  assert.equal(result.lastRecovery, 6);
  assert.equal(result.low.hour, 4);
});

test('second breach clears recovery until price crosses back', () => {
  const result = analyze([
    { hour: 0, price: 1 }, { hour: 2, price: .98 }, { hour: 4, price: 1 }, { hour: 6, price: .98 },
  ], .99);
  assert.equal(result.episodes, 2);
  assert.equal(result.hoursBelow, 3);
  assert.equal(result.lastRecovery, null);
});

test('threshold settings distinguish double dips from no breach', () => {
  const scenario = SCENARIOS.find(value => value.id === 'double');
  assert.equal(analyze(scenario.samples, .99).episodes, 2);
  assert.equal(analyze(scenario.samples, .96).episodes, 0);
  assert.throws(() => analyze([{ hour: 1, price: 1 }, { hour: 0, price: 1 }], .99));
});
