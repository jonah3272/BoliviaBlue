import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getDataInquiry, DATA_INQUIRY_EMAIL } from '../frontend/src/data/dataInquiry.js';
import { getDataDocumentationPage, PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON } from '../frontend/src/data/dataDocumentation.js';
import { renderDataDocumentationHtml } from '../seo/dataDocumentationSeo.js';
const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

describe('data inquiry contract', () => {
  it('uses a fixed inbox, safe encoding and locale before the fragment', () => {
    assert.equal(DATA_INQUIRY_EMAIL, 'info@boliviablue.com');
    for (const language of ['es', 'en']) {
      const inquiry = getDataInquiry(language);
      const mail = new URL(inquiry.mailto);
      assert.equal(mail.pathname, DATA_INQUIRY_EMAIL);
      assert.equal(mail.searchParams.get('body'), inquiry.body);
      assert.equal(mail.searchParams.get('subject'), inquiry.subject);
      assert.equal(inquiry.href, `/contacto${language === 'en' ? '?lang=en' : ''}#data-request`);
      assert.match(inquiry.body, /CSV \/ JSON \/ API/);
      assert.match(inquiry.body, /optional|opcional/);
      assert.equal(mail.searchParams.size, 2);
    }
    assert.deepEqual(getDataInquiry('unsupported?email=other@example.com'), getDataInquiry('es'));
  });
  it('keeps public downloads intact while initial HTML points to manual-review inquiry', () => {
    for (const language of ['es', 'en']) {
      const inquiry = getDataInquiry(language);
      const page = getDataDocumentationPage('/datos-historicos', language);
      const html = renderDataDocumentationHtml(read('frontend/index.html'), page.path, `?lang=${language}`);
      assert.ok(html.includes(`href="${inquiry.href}"`));
      assert.ok(html.includes(inquiry.limitation));
      assert.deepEqual(page.datasetSchema.distribution.map(({ contentUrl }) => contentUrl), [PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON]);
      assert.ok(html.includes(PUBLIC_HISTORY_CSV));
      assert.ok(html.includes(PUBLIC_HISTORY_JSON));
    }
  });
  it('adds no capture, storage, registration, delivery or revenue logic to the inquiry', () => {
    const component = read('frontend/src/components/DataInquiry.jsx');
    const data = read('frontend/src/data/dataInquiry.js');
    assert.doesNotMatch(component + data, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|<form|onSubmit|trackExportLead|trackExtendedDownload|\bPOST\b/);
    assert.match(component, /destination: DATA_INQUIRY_PATH/);
    assert.match(component, /trackAction\('data_inquiry_copy'\)/);
    assert.match(component, /trackAction\('data_inquiry_prepare_email'\)/);
    assert.match(component, /readOnly value=\{inquiry.fullText\}/);
    const contact = read('frontend/src/pages/Contact.jsx');
    assert.match(contact, /<DataInquiry key=\{language\} language=\{language\} \/>/);
    assert.match(contact, /mailto:info@boliviablue.com\?subject=Prensa/);
    assert.doesNotMatch(contact, /(?:12|24) (?:horas|hours)/);
  });
  it('removes unavailable self-service backend examples but retains the public API and history workflow', () => {
    const api = read('frontend/src/pages/ApiDocs.jsx');
    assert.doesNotMatch(api, /YOUR_TOKEN|email form|formulario de email|50000|50,000|50\.000/);
    assert.match(api, /require[s]? manual review/);
    assert.match(api, /to=\{inquiry.href\}/);
    assert.match(api, /path: '\/api\/blue-rate'/);
    assert.match(api, /\['csv', 'json'\]/);
    assert.match(api, /path: '\/api\/health'/);
    const history = read('frontend/src/pages/DatosHistoricos.jsx');
    assert.match(history, /buildServerExportHref\('csv', '30d'\)/);
    assert.match(history, /buildServerExportHref\('json', '30d'\)/);
    assert.match(history, /datos_historicos_unavailable_inquiry/);
    assert.equal((history.match(/to=\{inquiry.href\}/g) || []).length, 2);
  });
});
