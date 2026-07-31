/**
 * Bolivia Blue embeddable rate widget.
 * Usage:
 * <div id="bolivia-blue-widget"></div>
 * <script src="https://boliviablue.com/embed.js" async></script>
 *
 * Options on the script tag:
 *   data-theme="light|dark"
 *   data-lang="es|en"
 *   data-target="bolivia-blue-widget"  (element id)
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var theme = (script.getAttribute('data-theme') || 'light').toLowerCase();
  var lang = (script.getAttribute('data-lang') || 'es').toLowerCase();
  var targetId = script.getAttribute('data-target') || 'bolivia-blue-widget';
  var api = script.getAttribute('data-api') || 'https://boliviablue.com/api/blue-rate';
  var home = 'https://boliviablue.com/';

  var el = document.getElementById(targetId);
  if (!el) {
    el = document.createElement('div');
    el.id = targetId;
    script.parentNode.insertBefore(el, script);
  }

  var dark = theme === 'dark';
  var bg = dark ? '#111827' : '#ffffff';
  var fg = dark ? '#f9fafb' : '#111827';
  var muted = dark ? '#9ca3af' : '#6b7280';
  var border = dark ? '#374151' : '#e5e7eb';
  var accent = '#2563eb';

  el.innerHTML =
    '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;border:1px solid ' +
    border +
    ';border-radius:12px;padding:14px 16px;background:' +
    bg +
    ';color:' +
    fg +
    ';max-width:360px;box-sizing:border-box">' +
    '<div style="font-size:12px;color:' +
    muted +
    ';margin-bottom:8px">' +
    (lang === 'en' ? 'Loading Bolivia blue rate…' : 'Cargando dólar blue Bolivia…') +
    '</div></div>';

  function fmt(n) {
    if (n == null || !isFinite(n)) return '—';
    return Number(n).toFixed(2);
  }

  function when(iso) {
    try {
      return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'es-BO', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (e) {
      return '';
    }
  }

  fetch(api, { credentials: 'omit' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      var buy = fmt(data.buy_bob_per_usd);
      var sell = fmt(data.sell_bob_per_usd);
      var title = lang === 'en' ? 'Bolivia Blue Dollar' : 'Dólar Blue Bolivia';
      var buyL = lang === 'en' ? 'Buy' : 'Compra';
      var sellL = lang === 'en' ? 'Sell' : 'Venta';
      var updated = lang === 'en' ? 'Updated' : 'Actualizado';
      var courtesy = lang === 'en' ? 'Data by' : 'Datos de';

      el.innerHTML =
        '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;border:1px solid ' +
        border +
        ';border-radius:12px;padding:14px 16px;background:' +
        bg +
        ';color:' +
        fg +
        ';max-width:360px;box-sizing:border-box">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:10px">' +
        '<strong style="font-size:15px">' +
        title +
        '</strong>' +
        '<span style="font-size:11px;color:#ef4444;font-weight:700">LIVE</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
        '<div style="background:' +
        (dark ? '#1f2937' : '#f3f4f6') +
        ';border-radius:8px;padding:10px">' +
        '<div style="font-size:11px;color:' +
        muted +
        '">' +
        buyL +
        '</div>' +
        '<div style="font-size:22px;font-weight:700;letter-spacing:-0.02em">' +
        buy +
        ' <span style="font-size:12px;font-weight:500;color:' +
        muted +
        '">BOB</span></div>' +
        '</div>' +
        '<div style="background:' +
        (dark ? '#1f2937' : '#f3f4f6') +
        ';border-radius:8px;padding:10px">' +
        '<div style="font-size:11px;color:' +
        muted +
        '">' +
        sellL +
        '</div>' +
        '<div style="font-size:22px;font-weight:700;letter-spacing:-0.02em">' +
        sell +
        ' <span style="font-size:12px;font-weight:500;color:' +
        muted +
        '">BOB</span></div>' +
        '</div></div>' +
        '<div style="font-size:11px;color:' +
        muted +
        ';margin-bottom:8px">' +
        updated +
        ': ' +
        when(data.updated_at_iso) +
        '</div>' +
        '<a href="' +
        home +
        '?utm_source=embed&utm_medium=widget" target="_blank" rel="noopener sponsored" style="font-size:12px;color:' +
        accent +
        ';text-decoration:none;font-weight:600">' +
        courtesy +
        ' boliviablue.com →</a>' +
        '</div>';
    })
    .catch(function () {
      el.innerHTML =
        '<div style="font-family:system-ui,sans-serif;border:1px solid ' +
        border +
        ';border-radius:12px;padding:14px;background:' +
        bg +
        ';color:' +
        fg +
        ';max-width:360px">' +
        '<a href="' +
        home +
        '" style="color:' +
        accent +
        '">' +
        (lang === 'en' ? 'See live rate on boliviablue.com' : 'Ver cotización en boliviablue.com') +
        '</a></div>';
    });
})();
