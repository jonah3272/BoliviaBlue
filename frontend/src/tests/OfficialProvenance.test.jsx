import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RateTrioStrip from '../components/RateTrioStrip';
import RateCards from '../components/RateCards';
import { RateProvider, useRate } from '../contexts/RateContext';
import BlueRateCards from '../components/BlueRateCards';
import { officialRateModel } from '../utils/officialRate';
import { transformToAreaChartData } from '../utils/areaChartTransformer';

const mocks = vi.hoisted(() => ({ language: 'en', currency: 'USD', rate: vi.fn(), card: vi.fn() }));
vi.mock('../utils/api', () => ({ fetchBlueRate: mocks.rate, fetchCardRates: mocks.card }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: mocks.language, t: key => key }) }));
vi.mock('../contexts/CurrencyContext', () => ({ useCurrency: () => ({ currency: mocks.currency }) }));
vi.mock('../components/PageHead', () => ({ default: () => null }));
vi.mock('../components/CrossSourceBadge', () => ({ default: () => null }));
vi.mock('../utils/analytics', () => ({ trackRateCardView: vi.fn(), trackOfficialRateToggle: vi.fn(), trackRateUpdate: vi.fn() }));

const originalTime = new Date(Date.now() - 60000).toISOString();
const boardDate = new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10);
const blueTime = new Date().toISOString();
const p2p = { buy: 12.02, sell: 11.98, buy_bob_per_usd: 12.02, sell_bob_per_usd: 11.98, updated_at_iso: blueTime };
const values = { official_buy: 11.68, official_sell: 11.68, official_mid: 11.68 };
const observation = { version: 1, status: 'verified', source: 'bcb', source_url: 'https://www.bcb.gob.bo/', source_date: boardDate, observed_at: originalTime, buy: 11.68, sell: 11.68, mid: 11.68 };
const rows = {
  current: { ...p2p, ...values, official_observation: observation },
  stale: { ...p2p, ...values, official_observation: { ...observation, status: 'stale' } },
  null: { ...p2p, official_buy: null, official_sell: null, official_mid: null },
  legacy: { ...p2p, ...values },
  mismatched: { ...p2p, ...values, official_observation: { ...observation, buy: 12.08, mid: 11.88 } },
};

beforeEach(() => { vi.clearAllMocks(); mocks.currency = 'USD'; mocks.card.mockResolvedValue(null); });
afterEach(cleanup);

for (const language of ['es', 'en']) describe(`Official source-aware displays (${language})`, () => {
  beforeEach(() => { mocks.language = language; });
  for (const [name, row] of Object.entries(rows)) it(`strip preserves ${name} status, numbers and independent dates`, () => {
    render(<MemoryRouter><RateTrioStrip buy={row.buy} sell={row.sell} officialBuy={row.official_buy} officialSell={row.official_sell} officialMid={row.official_mid} officialObservation={row.official_observation} language={language} cardRate={11.77} updatedAt={blueTime} /></MemoryRouter>);
    expect(screen.getByText('12.00')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('0.00 Bs');
    if (['current', 'stale'].includes(name)) {
      expect(screen.getByText('11.68')).toBeInTheDocument();
      expect(screen.getByText(boardDate)).toBeInTheDocument();
      expect(document.querySelector(`time[datetime="${originalTime}"]`)).toBeInTheDocument();
      expect(document.querySelector(`time[datetime="${blueTime}"]`)).not.toBeInTheDocument();
      const label = name === 'stale' ? (language === 'es' ? 'Último BCB verificado' : 'Last verified BCB') : (language === 'es' ? 'BCB (oficial)' : 'BCB (official)');
      expect(screen.getAllByText(label)).toHaveLength(2);
    } else {
      expect(screen.queryByText('11.68')).not.toBeInTheDocument();
      expect(screen.getByText(name === 'null' ? (language === 'es' ? 'Referencia oficial no disponible.' : 'Official reference unavailable.') : (language === 'es' ? 'Fuente no verificada; valor no disponible.' : 'Source unverified; value unavailable.'))).toBeInTheDocument();
      expect(document.querySelector('time')).not.toBeInTheDocument();
      expect(screen.queryByText(language === 'es' ? 'BCB (oficial)' : 'BCB (official)')).not.toBeInTheDocument();
    }
  });

  for (const Component of [RateCards, BlueRateCards]) for (const name of ['current', 'stale', 'null', 'legacy']) it(`${Component.name} shows ${name} with BCB dates instead of the P2P timestamp`, async () => {
    mocks.rate.mockResolvedValue(rows[name]);
    render(<Component showOfficial={true} setShowOfficial={() => {}} showTimestampInCards={false} />);
    const expected = ['current', 'stale'].includes(name)
      ? (name === 'stale' ? (language === 'es' ? 'Último BCB verificado' : 'Last verified BCB') : (language === 'es' ? 'BCB (oficial)' : 'BCB (official)'))
      : name === 'null' ? (language === 'es' ? 'Referencia oficial no disponible.' : 'Official reference unavailable.') : (language === 'es' ? 'Fuente no verificada; valor no disponible.' : 'Source unverified; value unavailable.');
    await screen.findAllByText(expected);
    if (['current', 'stale'].includes(name)) {
      expect(await screen.findAllByText('11.68')).toHaveLength(2);
      expect(document.querySelector(`time[datetime="${originalTime}"]`)).toBeInTheDocument();
      expect(screen.getByText(boardDate)).toBeInTheDocument();
    } else {
      expect(screen.queryByText('11.68')).not.toBeInTheDocument();
      expect(document.querySelector('time')).not.toBeInTheDocument();
    }
    expect(document.body).not.toHaveTextContent('0.00');
  });
});

it('official cards remain USD/BOB when another P2P currency is selected', async () => {
  mocks.language = 'en'; mocks.currency = 'COP';
  mocks.rate.mockResolvedValue({ ...rows.current, currency: 'COP', buy: .002, sell: .003 });
  render(<BlueRateCards showOfficial={true} setShowOfficial={() => {}} />);
  expect(await screen.findAllByText('11.68')).toHaveLength(2);
  expect(screen.getAllByText('Bs. per USD')).toHaveLength(2);
  expect(screen.queryByText('Bs. per COP')).not.toBeInTheDocument();
});

it('ages official data from original retrieval rather than a fresh P2P timestamp', () => {
  const old = '2026-10-01T12:00:00Z';
  const rate = officialRateModel({ ...rows.current, official_observation: { ...observation, source_date: '2026-10-01', observed_at: old } });
  expect(rate.official_status).toBe('stale');
  expect(rate.official_observed_at).toBe(old);
  expect(rate.official_buy).toBe(11.68);
});

for (const [range, count] of [['1D', 2], ['ALL', 1200]]) it(`${range} official chart does not substitute P2P or zero values when official data is unavailable`, () => {
  const data = Array.from({ length: count }, (_, i) => ({ t: new Date(Date.parse(blueTime) + i * 60000).toISOString(), buy: 12.02, sell: 11.98, official_buy: null, official_sell: null }));
  expect(transformToAreaChartData(data, range, true)).toEqual({ buyData: [], sellData: [] });
  expect(transformToAreaChartData(data, range, false).buyData.length).toBeGreaterThan(0);
});

// Cover the actual provider whitelist used by Home and other strip callers.
function ContextSnapshot() {
  const { rateData } = useRate();
  return <output data-testid="context-rate">{JSON.stringify(rateData)}</output>;
}
for (const name of ['current', 'stale', 'null', 'legacy']) it(`RateProvider retains normalized official provenance for ${name}`, async () => {
  mocks.rate.mockResolvedValue(rows[name]);
  render(<RateProvider><ContextSnapshot /></RateProvider>);
  const output = await screen.findByTestId('context-rate');
  await vi.waitFor(() => expect(output.textContent).not.toBe('null'));
  const result = JSON.parse(output.textContent);
  const expected = officialRateModel(rows[name]);
  for (const key of ['official_buy', 'official_sell', 'official_mid', 'official_observation', 'official_status', 'official_source', 'official_source_date', 'official_observed_at']) expect(result[key]).toEqual(expected[key]);
  expect(result.officialMid).toBe(expected.official_mid);
  expect(result.updated_at_iso).toBe(blueTime);
});
