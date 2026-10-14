import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getDataDocumentationPage } from '../frontend/src/data/dataDocumentation.js';
import { PLAIN_CITE_ES, PLAIN_CITE_EN } from '../frontend/src/utils/citationCopy.js';
import { applyEnglishAnnotations } from '../middleware.js';

const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd } = require('../frontend/scripts/inject-seo-shell.cjs');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const guidance = readFileSync(new URL('../frontend/public/llms.txt', import.meta.url), 'utf8');
const schemas = (html) => [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => JSON.parse(match[1]));
const fixedCadence = /cada\s+~?15\s*min|every\s+~?15\s*min|15.minute|R\/P15M/i;

for (const [language, label, citation] of [['es', 'Spanish', PLAIN_CITE_ES], ['en', 'English', PLAIN_CITE_EN]]) {
  test(`LLM attribution retains the current per-record provenance qualification: ${language}`, () => {
    const attribution = guidance.split('\n').find((line) => line.startsWith(`${label}:`));
    const description = getDataDocumentationPage('/datos-historicos', language).copy.datasetDescription;
    const qualification = description.slice(description.indexOf(language === 'es' ? 'La composición de fuentes' : 'Source composition'));
    assert.ok(qualification.length > 0);
    assert.ok(attribution.includes(qualification));
    assert.ok(citation.includes(qualification));
    assert.doesNotMatch(attribution, /histórica de fuentes no está registrada|historical source composition is not recorded/);
  });
}

test('LLM coverage guidance matches the current methodology for older, recorded and missing provenance', () => {
  const method = getDataDocumentationPage('/fuente-de-datos', 'en').copy;
  assert.ok(guidance.includes(method.provenanceDescription));
  assert.match(guidance, /A reading can use one platform; unavailable sources are not invented/);
  assert.doesNotMatch(guidance, /Historical source composition and collector version were not stored|Future USD\/BOB collectors/);
});

test('the shared WebSite description points to observation time without a cadence guarantee', () => {
  const website = schemas(template).find((schema) => schema['@type'] === 'WebSite');
  assert.ok(website);
  assert.match(website.description, /actualizaciones periódicas/);
  assert.match(website.description, /fecha y hora de observación/);
  assert.doesNotMatch(website.description, fixedCadence);

  const spanish = injectStaticJsonLd(injectRootShell(replaceMeta(template, '/prensa'), ROUTES['/prensa'].shell), '/prensa');
  const english = applyEnglishAnnotations(spanish, '/prensa', null);
  for (const html of [spanish, english]) {
    const structuredData = schemas(html);
    assert.ok(structuredData.length > 0);
    assert.doesNotMatch(JSON.stringify(structuredData), fixedCadence);
  }
  assert.equal(schemas(spanish).find((schema) => schema['@type'] === 'WebSite').description, website.description);
});

test('built guidance is copied from its source and inherited WebSite descriptions remain qualified', {
  skip: !existsSync(new URL('../frontend/dist/prensa/index.html', import.meta.url)),
}, () => {
  assert.equal(readFileSync(new URL('../frontend/dist/llms.txt', import.meta.url), 'utf8'), guidance);
  for (const file of ['index.html', 'prensa/index.html']) {
    const html = readFileSync(new URL(`../frontend/dist/${file}`, import.meta.url), 'utf8');
    const structuredData = schemas(html);
    assert.ok(structuredData.length > 0);
    assert.doesNotMatch(JSON.stringify(structuredData), fixedCadence);
  }
});
