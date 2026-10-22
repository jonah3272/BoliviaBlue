// Loaded only on download; no screenshot service or additional library.
export async function downloadRateCard(model, language = 'es') {
  if (!model.available) throw new Error('No dated quote');
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
  const es = language !== 'en';
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#082f49'); gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = '#7dd3fc'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('BOLIVIA BLUE', 72, 100);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 62px sans-serif'; ctx.fillText(model.title, 72, 208);
  ctx.fillStyle = '#bae6fd'; ctx.font = '28px sans-serif'; ctx.fillText('P2P USDT / BOB', 72, 262);
  const panels = [{ x: 72, label: es ? 'COMPRA' : 'BUY', value: model.buy }, { x: 564, label: es ? 'VENTA' : 'SELL', value: model.sell }];
  for (const p of panels) {
    ctx.fillStyle = '#164e63'; ctx.fillRect(p.x, 330, 444, 270);
    ctx.fillStyle = '#a5f3fc'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(p.label, p.x + 32, 390);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 78px sans-serif'; ctx.fillText(p.value.toFixed(2), p.x + 32, 492);
    ctx.font = '26px sans-serif'; ctx.fillText('Bs / USDT', p.x + 32, 552);
  }
  ctx.fillStyle = '#e2e8f0'; ctx.font = '27px sans-serif'; ctx.fillText(model.time, 72, 680);
  if (model.status) { ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(model.status, 72, 738); }
  ctx.fillStyle = '#cbd5e1'; ctx.font = '26px sans-serif';
  ctx.fillText(es ? 'Referencia digital; confirmá la cotización de efectivo.' : 'Digital reference; confirm the physical cash quote.', 72, 820);
  ctx.fillText(es ? 'Lectura fechada. Consultá la última en:' : 'Dated snapshot. Check the latest at:', 72, 870);
  ctx.fillStyle = '#7dd3fc'; ctx.font = 'bold 40px sans-serif'; ctx.fillText('www.boliviablue.com', 72, 950);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error('Image unavailable');
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
  a.download = `bolivia-blue-${model.observedAt.replaceAll(':', '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
