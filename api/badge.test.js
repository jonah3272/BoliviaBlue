/**
 * Run: node --test api/badge.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { renderBadgeSvg, fmt } = require('./_lib/badgeSvg.js');

describe('live badge SVG', () => {
  it('prints buy/sell and never invents 10.50', () => {
    const svg = renderBadgeSvg(11.61, 11.5);
    assert.match(svg, /C 11\.61/);
    assert.match(svg, /V 11\.50/);
    assert.doesNotMatch(svg, /10\.50/);
  });

  it('uses dashes when rates are junk', () => {
    const svg = renderBadgeSvg(0, NaN);
    assert.match(svg, /C —/);
    assert.match(svg, /V —/);
    assert.equal(fmt(0), null);
  });
});
