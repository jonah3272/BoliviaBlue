const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const source = readFileSync(new URL('../frontend/src/pages/Home.jsx', `file://${__filename}`), 'utf8');
const section = source.slice(source.indexOf('{/* Citation and data resources */}'));
test('homepage media resources explain reader tasks in both languages without a ranking plea', () => {
  assert.match(section, /Consultá la metodología, descargá datos históricos o guardá una lectura con fecha y hora desde el kit de prensa\./);
  assert.match(section, /Review the methodology, download historical data, or save a timestamped observation from the press kit\./);
  assert.doesNotMatch(section, /Every linked mention|Cada mención con enlace|#1/);
});
test('homepage media resources retain existing destinations and add localized methodology access', () => {
  for (const target of ['/widget', '/prensa', '/datos-historicos', '/fuente-de-datos']) assert.ok(section.includes(`to="${target}"`));
  assert.match(section, /'Método y fuentes' : 'Method and sources'/);
});
