/**
 * Language query sanitizer.
 * Run: node --test urlLang.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeLangSearch, analyticsPageLocation } from './frontend/src/utils/urlLang.js';

describe('sanitizeLangSearch', () => {
  it('keeps a single ?lang=en', () => {
    assert.equal(sanitizeLangSearch('?lang=en'), '?lang=en');
  });

  it('collapses ?lang=en?lang=en', () => {
    assert.equal(sanitizeLangSearch('?lang=en?lang=en'), '?lang=en');
  });

  it('strips Spanish ?lang=es so the canonical path stays clean', () => {
    assert.equal(sanitizeLangSearch('?lang=es'), '');
  });

  it('preserves other params while collapsing a duplicate lang', () => {
    assert.equal(sanitizeLangSearch('?usd=100?lang=en'), '?usd=100&lang=en');
  });
});

describe('analyticsPageLocation', () => {
  it('never includes a hash (AdSense vignettes must not mint paths)', () => {
    const loc = analyticsPageLocation(
      'https://www.boliviablue.com',
      '/',
      '?lang=en?lang=en'
    );
    assert.equal(loc, 'https://www.boliviablue.com/?lang=en');
    assert.doesNotMatch(loc, /google_vignette/);
    assert.doesNotMatch(loc, /#/);
  });
});
