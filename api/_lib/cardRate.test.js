/**
 * Run: node --test api/_lib/cardRate.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  asBobPerUsd,
  parseWiseLive,
  parseWiseComparison,
  isCardRateStale,
} = require('./cardRate');

describe('asBobPerUsd', () => {
  it('accepts live Wise / BCB-range quotes', () => {
    assert.equal(asBobPerUsd(11.525), 11.525);
    assert.equal(asBobPerUsd('12.055'), 12.055);
  });

  it('rejects junk that used to leak into the card card', () => {
    assert.equal(asBobPerUsd(0), null);
    assert.equal(asBobPerUsd(6.96), null);
    assert.equal(asBobPerUsd(null), null);
    assert.equal(asBobPerUsd(100), null);
  });
});

describe('parseWiseLive', () => {
  it('reads rates/live value', () => {
    assert.equal(parseWiseLive({ value: 11.525 }), 11.525);
  });

  it('ignores empty payloads', () => {
    assert.equal(parseWiseLive({}), null);
    assert.equal(parseWiseLive(null), null);
  });
});

describe('parseWiseComparison', () => {
  it('picks the Wise alias, not Western Union', () => {
    const payload = {
      providers: [
        { alias: 'westernunion', quotes: [{ rate: 11.02 }] },
        { alias: 'wise', quotes: [{ rate: 11.525 }] },
      ],
    };
    assert.equal(parseWiseComparison(payload), 11.525);
  });

  it('does not fall back to the first provider', () => {
    const payload = {
      providers: [{ alias: 'westernunion', quotes: [{ rate: 11.02 }] }],
    };
    assert.equal(parseWiseComparison(payload), null);
  });
});

describe('isCardRateStale', () => {
  it('treats missing timestamps and >20m rows as stale', () => {
    assert.equal(isCardRateStale(null), true);
    assert.equal(isCardRateStale(new Date(Date.now() - 21 * 60 * 1000).toISOString()), true);
    assert.equal(isCardRateStale(new Date().toISOString()), false);
  });
});
