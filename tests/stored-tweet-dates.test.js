import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { storedTweetDate, newestStoredTweetDate, formatStoredTweetDate } from '../frontend/src/utils/storedTweetDates.js';

describe('stored X post dates', () => {
  it('uses the API ISO field, supports the legacy field, and rejects missing or invalid values', () => {
    assert.equal(storedTweetDate({ published_at_iso: '2025-03-29T15:00:00Z', published_at: '2025-01-01T00:00:00Z' }), '2025-03-29T15:00:00.000Z');
    assert.equal(storedTweetDate({ published_at: '2025-03-29T15:00:00Z' }), '2025-03-29T15:00:00.000Z');
    assert.equal(storedTweetDate({ published_at_iso: 'invalid', published_at: '2025-03-29T15:00:00Z' }), '2025-03-29T15:00:00.000Z');
    for (const value of [null, undefined, '', 'invalid', ' ', 0, '0', '42', '2025-03-29', '2025-02-30T12:00:00Z']) assert.equal(storedTweetDate({ published_at_iso: value }), null);
  });
  it('reports the newest valid stored date rather than the fetch/current time', () => {
    assert.equal(newestStoredTweetDate([{ published_at_iso: 'invalid' }, { published_at_iso: '2025-03-29T15:00:00Z' }, { published_at: '2024-12-01T12:00:00Z' }]), '2025-03-29T15:00:00.000Z');
    assert.equal(newestStoredTweetDate([]), null);
    assert.equal(newestStoredTweetDate(null), null);
    assert.equal(newestStoredTweetDate([{ published_at_iso: 'bad' }]), null);
  });
  it('formats absolute dates in the requested language and Bolivia timezone with a safe fallback', () => {
    const date = '2025-03-29T02:00:00Z';
    assert.match(formatStoredTweetDate(date, 'es'), /28.*2025/);
    assert.match(formatStoredTweetDate(date, 'en'), /Mar 28, 2025/);
    assert.equal(formatStoredTweetDate('invalid', 'es'), 'Fecha no disponible');
    assert.equal(formatStoredTweetDate(null, 'en'), 'Date unavailable');
    assert.doesNotMatch(formatStoredTweetDate(date, 'en'), /hace|Invalid/);
  });
  it('labels the stored archive honestly and keeps setup details out of the reader flow', () => {
    const source = readFileSync(new URL('../frontend/src/components/TweetsFeed.jsx', import.meta.url), 'utf8');
    assert.match(source, /archive is not a live feed/);
    assert.match(source, /newestStoredTweetDate\(tweets\)/);
    assert.doesNotMatch(source, /formatTimeAgo|TWITTER_BEARER_TOKEN|Railway|more real-time/);
    assert.match(source, /!cancelled && request === latestRequest/);
  });
});
