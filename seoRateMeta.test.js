/**
 * Live-rate SERP titles vs stable GA titles.
 * Run: node --test seoRateMeta.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLiveRateSeoMeta,
  analyticsTitleForPath,
  stripLiveRatesFromTitle,
  liveBobParts,
} from './frontend/src/utils/seoRateMeta.js';

describe('buildLiveRateSeoMeta', () => {
  it('puts buy/sell in the dolar-blue-hoy title without a date', () => {
    const meta = buildLiveRateSeoMeta({
      buy: 11.87,
      sell: 11.75,
      language: 'es',
      page: 'dolar-blue-hoy',
    });
    assert.equal(meta.title, 'Dólar Blue Hoy Bolivia: Compra 11.87 · Venta 11.75');
    assert.doesNotMatch(meta.title, /20\d\d/);
    assert.equal(meta.analyticsTitle, 'Dólar Blue Hoy Bolivia | Lectura Verificada Paralelo');
  });

  it('leads the homepage title with dólar blue hoy Bolivia', () => {
    const meta = buildLiveRateSeoMeta({
      buy: 11.98,
      sell: 11.92,
      language: 'es',
      page: 'home',
    });
    assert.equal(meta.title, 'Bolivia Blue | Bolivian Blue: Compra 11.98 · Venta 11.92');
    assert.match(meta.description, /Bolivian Blue/);
    assert.doesNotMatch(meta.description, /para la compra/);
  });

  it('never emits Compra 0.00', () => {
    const meta = buildLiveRateSeoMeta({
      buy: 0,
      sell: 0,
      language: 'es',
      page: 'home',
    });
    assert.doesNotMatch(meta.title, /0\.00/);
    assert.equal(meta.title, 'Bolivia Blue | Dólar Blue Hoy, lectura P2P verificada');
  });

  it('uses 1.000 COP in Bs for the peso page (per-peso rate is < 1)', () => {
    const meta = buildLiveRateSeoMeta({
      buy: 3.75,
      sell: 3.72,
      language: 'es',
      page: 'peso',
    });
    assert.equal(meta.title, 'Peso colombiano a boliviano: 1.000 COP ≈ 3.75 / 3.72 Bs');
    assert.match(meta.description, /USDT\/COP/);
  });

  it('uses city live titles for Santa Cruz', () => {
    const meta = buildLiveRateSeoMeta({
      buy: 11.6,
      sell: 11.5,
      language: 'es',
      page: 'santa-cruz',
    });
    assert.equal(meta.title, 'Dólar Blue Santa Cruz Hoy: Compra 11.60 · Venta 11.50');
  });
});

describe('analyticsTitleForPath', () => {
  it('groups homepage hits under one title even when SERP titles include rates', () => {
    assert.equal(
      analyticsTitleForPath('/', 'es'),
      'Bolivia Blue | Dólar Blue Hoy, lectura P2P verificada'
    );
    assert.equal(
      analyticsTitleForPath('/dolar-blue-hoy', 'es'),
      'Dólar Blue Hoy Bolivia | Lectura Verificada Paralelo'
    );
    assert.equal(
      analyticsTitleForPath('/dolar-blue-santa-cruz', 'es'),
      'Dólar Blue Santa Cruz Hoy | Paralelo Bolivia'
    );
  });
});

describe('stripLiveRatesFromTitle', () => {
  it('removes compra/venta ticks from a leaked SERP title', () => {
    assert.equal(
      stripLiveRatesFromTitle('Dólar Blue Bolivia Hoy: Compra 12.05 · Venta 12.02'),
      'Dólar Blue Bolivia Hoy'
    );
  });
});

describe('liveBobParts', () => {
  it('returns formatted buy/sell and $100 without inventing 10.50', () => {
    const live = liveBobParts({ buy: 11.61, sell: 11.5 });
    assert.equal(live.buyStr, '11.61');
    assert.equal(live.sellStr, '11.50');
    assert.equal(live.times(100), '1161.00');
    const missing = liveBobParts(null);
    assert.equal(missing.buyStr, null);
    assert.equal(missing.times(100), null);
  });
});
