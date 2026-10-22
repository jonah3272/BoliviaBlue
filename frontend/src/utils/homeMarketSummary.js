// This is a projection of a verified immutable report, never a live-rate estimate.
export function homeMarketSummary(report, language = 'es', now = Date.now()) {
  if (!report || !/^\d{4}-\d{2}-\d{2}$/.test(report.date) ||
      !Number.isSafeInteger(report.revision) || report.revision < 1 ||
      report.path !== `/prensa/informes/${report.date}/v${report.revision}` ||
      !Number.isFinite(report.median) || report.median <= 0 ||
      !Number.isFinite(Date.parse(report.generated_at)) || Date.parse(report.generated_at) > now ||
      !/^[a-f0-9]{64}$/.test(report.sha256)) return null;
  const start = Date.parse(`${report.date}T00:00:00-04:00`);
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== report.date || start + 86400000 > now) return null;
  const es = language !== 'en';
  const previousDate = new Date(start - 86400000).toISOString().slice(0, 10);
  const c = report.comparison;
  const comparison = c && c.date === previousDate && Number.isFinite(c.change) && Number.isFinite(c.change_percent) ? c : null;
  const signed = (n, digits) => `${n > 0 ? '+' : ''}${n.toFixed(digits)}`;
  return {
    heading: es ? `Resumen del día completo · ${report.date}` : `Completed-day summary · ${report.date}`,
    summary: es ? `Mediana diaria de puntos medios observados: ${report.median.toFixed(5)} BOB/USDT.` : `Daily median of observed midpoints: ${report.median.toFixed(5)} BOB/USDT.`,
    change: comparison ? (es ? `Frente al ${c.date}: ${signed(c.change, 5)} BOB/USDT (${signed(c.change_percent, 3)}%).` : `Compared with ${c.date}: ${signed(c.change, 5)} BOB/USDT (${signed(c.change_percent, 3)}%).`) : (es ? 'Sin comparación válida con el día anterior.' : 'No valid previous-day comparison.'),
    caveat: es ? 'Canasta fija: Binance + El Dorado + Bybit. Día America/La_Paz; referencia digital P2P, no cotización de dólares físicos.' : 'Fixed basket: Binance + El Dorado + Bybit. America/La_Paz day; digital P2P reference, not a physical-dollar quote.',
    href: report.path + (es ? '' : '?lang=en'),
    link: es ? `Ver informe y datos · v${report.revision}` : `View report and evidence · v${report.revision}`,
  };
}
