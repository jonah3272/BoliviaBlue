/** Adapt the chart API contract without claiming its downsampled points are a full export. */
export function historicalTableData(payload) {
  const rows = payload?.history || payload?.points || [];
  return {
    ...payload,
    history: rows.filter((row) => row && Number.isFinite(Number(row.buy)) && Number.isFinite(Number(row.sell)) && row.buy != null && row.sell != null)
      .map((row) => ({ ...row, timestamp: row.timestamp || row.t, buy: Number(row.buy), sell: Number(row.sell) }))
      .filter((row) => row.timestamp && Number.isFinite(Date.parse(row.timestamp))),
  };
}

/** Availability check only; never submits an email, token or registration. */
export async function checkExtendedExportService(baseUrl, { fetcher = fetch, signal } = {}) {
  if (!baseUrl) return false;
  try {
    const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/api/health`, { method: 'GET', credentials: 'omit', signal });
    if (!response.ok) return false;
    const health = await response.json();
    return health?.ok === true;
  } catch { return false; }
}
