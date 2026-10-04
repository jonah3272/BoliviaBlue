import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getFinancialOffer, getPartnerAds, BUY_USDT_INTENT, RECEIVE_PAYMENTS_INTENT } from '../frontend/src/config/referrals.js';
import { getBuyGuidePage } from '../frontend/src/data/buyGuidePage.js';
const source = (name) => readFileSync(new URL(`../frontend/src/${name}`, import.meta.url), 'utf8');
const expected = {
  eldorado: 'https://link.eldorado.io/MMLGEZcDf5b',
  takenos: 'https://takenos.go.link/?adj_t=1ptq1hru&adj_label=rjhasnoemail',
  binance: 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default',
  meru: 'https://getmeru.com/referrals/?referralCode=NGPFPG',
  airtm: 'https://app.airtm.io/ivt/dasyl1sfs6fzr',
};

describe('financial offer intent and destinations', () => {
  it('preserves every existing referral destination in both languages', () => {
    for (const language of ['es', 'en']) {
      const ads = getPartnerAds(language);
      assert.equal(ads.length, 5);
      for (const ad of ads) assert.equal(ad.href, expected[ad.partner]);
      assert.equal(ads[0].partner, 'eldorado');
      assert.equal(ads[1].partner, 'takenos');
      assert.equal(ads[2].partner, 'binance');
      assert.doesNotMatch(JSON.stringify(ads), /\$5|\+\$|TakeCard|Takecard|Airalo|20%|\$20/);
    }
  });
  it('offers the chosen task and matching guide with no reward qualification inferred', () => {
    for (const language of ['es', 'en']) {
      const buy = getFinancialOffer(language, BUY_USDT_INTENT);
      const receive = getFinancialOffer(language, RECEIVE_PAYMENTS_INTENT);
      assert.equal(buy.partner, 'eldorado');
      assert.equal(receive.partner, 'takenos');
      assert.equal(buy.steps.length, 5);
      assert.equal(receive.steps.length, 4);
      assert.match(buy.headline, /USDT/);
      assert.match(receive.headline, /USD.*EUR/);
      assert.match(buy.disclosure, language === 'es' ? /criptoactivo.*no efectivo USD/ : /cryptoasset.*not USD cash/);
      assert.match(receive.disclosure, language === 'es' ? /no es un banco/ : /not a bank/);
      assert.match(buy.steps[3][1], language === 'es' ? /Después de pagar/ : /After paying/);
      assert.match(buy.steps[4][1], language === 'es' ? /no canceles sin reembolso/ : /do not cancel without a refund/);
      assert.equal(getFinancialOffer(language, 'unknown').id, buy.id);
    }
  });
  it('keeps selected intent in URL and aligns the schema, guide and sticky offer', () => {
    const page = source('pages/BuyDollars.jsx');
    assert.match(page, /params\.get\('intent'\)/);
    assert.match(page, /new URLSearchParams\(params\)/);
    for (const language of ['es', 'en']) for (const intent of [BUY_USDT_INTENT, RECEIVE_PAYMENTS_INTENT]) {
      const selected = getBuyGuidePage(language, intent);
      assert.deepEqual(selected.howToSchema.step.map(({ name, text }) => [name, text]), selected.offer.steps);
    }
    assert.match(page, /FinancialOfferButton offer=\{offer\} placement="buy_page_sticky"/);
    assert.doesNotMatch(page, /PartnerAdCarousel|setInterval/);
    assert.match(page, /--bb-buy-cta-height/);
    assert.match(source('components/RateAlertFab.jsx'), /--bb-buy-cta-height/);
    assert.doesNotMatch(source('components/PartnerAdCarousel.jsx'), /setInterval|SlideArt|\+\$5/);
    assert.doesNotMatch(source('components/PlatformRatesBoard.jsx'), /\$5|\+\$5|'Bono'|'Bonus'/);
  });
  it('records visible offer exposure and outbound intent without claiming revenue or signup', () => {
    const events = [];
    const context = { trackEvent: (name, params) => events.push({ name, params }) };
    const code = source('utils/analyticsEvents.js').replace(/^import .*;\s*$/gm, '').replace(/export function /g, 'function ');
    vm.runInNewContext(code + `\ntrackOfferViewed({language:'en',partner:'eldorado',offer_id:'eldorado_bob_usdt',intent:'buy_usdt',placement:'test',variant:'benefit_v1'});trackReferralClicked({language:'en',partner:'takenos',offer_id:'takenos_client_payments',intent:'receive_payments',placement:'test',variant:'benefit_v1'});`, context);
    assert.deepEqual(events.map((e) => e.name), ['offer_viewed', 'referral_clicked', 'outbound_source_clicked']);
    for (const event of events) {
      for (const key of ['language', 'partner', 'offer_id', 'intent', 'placement', 'variant']) assert.ok(event.params[key]);
      for (const key of ['value', 'currency', 'revenue', 'qualified', 'signed_up']) assert.equal(key in event.params, false);
    }
    const hook = source('hooks/useOfferImpression.js');
    assert.match(hook, /intersectionRatio < 0\.35/);
    assert.match(hook, /!active/);
    assert.match(hook, /active = false; observer\.disconnect\(\)/);
    assert.doesNotMatch(hook, /document\.cookie|localStorage|sessionStorage|setInterval|Math\.random/);
  });
});
