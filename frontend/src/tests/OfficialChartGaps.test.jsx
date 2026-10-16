import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import HistoricalAreaChart, { toUniqueSeries } from '../components/HistoricalAreaChart';
import { transformToAreaChartData } from '../utils/areaChartTransformer';

const mocks = vi.hoisted(() => ({ series: [] }));
vi.mock('lightweight-charts', () => ({ AreaSeries: {}, createChart: () => ({
  addSeries: () => { const series = { setData: vi.fn() }; mocks.series.push(series); return series; },
  priceScale: () => ({ applyOptions: vi.fn() }), timeScale: () => ({ fitContent: vi.fn() }),
  subscribeCrosshairMove: vi.fn(), remove: vi.fn(), applyOptions: vi.fn(),
}) }));
afterEach(() => { cleanup(); mocks.series = []; vi.unstubAllGlobals(); });

it('switching an existing P2P chart to unavailable official data clears both old series', () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  const points = [{ time: '2026-10-16T12:00:00Z', value: 12 }];
  const { rerender } = render(<HistoricalAreaChart buyData={points} sellData={points} />);
  expect(mocks.series).toHaveLength(2);
  for (const series of mocks.series) expect(series.setData).toHaveBeenLastCalledWith([{ time: 1792152000, value: 12 }]);
  rerender(<HistoricalAreaChart buyData={[]} sellData={[]} />);
  for (const series of mocks.series) expect(series.setData).toHaveBeenLastCalledWith([]);
});

for (const range of ['1D', 'ALL']) it(`${range} preserves explicit official gaps through transformation and chart input`, () => {
  const count = range === 'ALL' ? 1200 : 5;
  const points = Array.from({ length: count }, (_, i) => ({ t: new Date(Date.UTC(2026, 9, 16, 12, i)).toISOString(), buy: 12, sell: 13, official_buy: i === 1 ? null : 11.68, official_sell: i === 1 ? null : 11.68 }));
  const result = transformToAreaChartData(points, range, true);
  for (const side of [result.buyData, result.sellData]) {
    expect(side).toContainEqual({ time: points[1].t });
    expect(side.every(point => point.value === undefined || point.value === 11.68)).toBe(true);
    const unique = toUniqueSeries(side);
    expect(unique).toContainEqual({ time: Date.parse(points[1].t) / 1000 });
  }
});
