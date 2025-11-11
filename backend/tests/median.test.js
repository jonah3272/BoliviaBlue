import { test } from 'node:test';
import assert from 'node:assert';
import { median } from '../median.js';

test('median of odd-length array', () => {
  const result = median([3, 1, 2]);
  assert.strictEqual(result, 2);
});

test('median of even-length array', () => {
  const result = median([4, 1, 3, 2]);
  assert.strictEqual(result, 2.5);
});

test('median with single element', () => {
  const result = median([42]);
  assert.strictEqual(result, 42);
});

test('median with two elements', () => {
  const result = median([10, 20]);
  assert.strictEqual(result, 15);
});

test('median with empty array', () => {
  const result = median([]);
  assert.strictEqual(result, null);
});

test('median with null input', () => {
  const result = median(null);
  assert.strictEqual(result, null);
});

test('median filters out non-finite values', () => {
  const result = median([1, 2, NaN, 3, Infinity, 4]);
  assert.strictEqual(result, 2.5);
});

test('median with all non-finite values', () => {
  const result = median([NaN, Infinity, -Infinity]);
  assert.strictEqual(result, null);
});

test('median with negative numbers', () => {
  const result = median([-3, -1, -2]);
  assert.strictEqual(result, -2);
});

test('median with decimals', () => {
  const result = median([1.5, 2.5, 3.5, 4.5, 5.5]);
  assert.strictEqual(result, 3.5);
});

