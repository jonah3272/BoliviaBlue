/**
 * Run: node --test newsrooms.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NEWSROOMS,
  WEEKLY_ACTIONS,
  encodeMail,
  pitchFor,
} from './frontend/src/data/newsrooms.js';

describe('newsrooms desk', () => {
  it('keeps Cadecocruz as a priority target with their published email', () => {
    const cade = NEWSROOMS.find((n) => n.id === 'cadecocruz');
    assert.ok(cade);
    assert.equal(cade.priority, true);
    assert.equal(cade.email, 'info@cadecocruz.org.bo');
    assert.match(cade.contactUrl, /cadecocruz/);
  });

  it('does not invent emails for desks without a published address', () => {
    const invented = NEWSROOMS.filter((n) => n.email && !n.email.endsWith('@cadecocruz.org.bo'));
    assert.equal(invented.length, 0);
  });

  it('builds a Gmail compose URL with the live line', () => {
    const cade = NEWSROOMS.find((n) => n.id === 'cadecocruz');
    const body = pitchFor(cade, 'Hoy el dólar blue: compra Bs 11.60, venta Bs 11.51.');
    assert.match(body, /11\.60/);
    assert.match(body, /boliviablue.com/);
    const mail = encodeMail('Datos', body, cade.email);
    assert.match(mail.gmail, /mail\.google\.com/);
    assert.match(mail.mailto, /info@cadecocruz\.org\.bo/);
  });

  it('has a five-send weekly list', () => {
    assert.equal(WEEKLY_ACTIONS.length, 5);
  });
});
