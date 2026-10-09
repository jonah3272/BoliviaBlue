/**
 * Bolivia Blue embeddable P2P reference. No dependencies; also used by embed.html.
 * <div id="bolivia-blue-widget"></div>
 * <script src="https://www.boliviablue.com/embed.js" async></script>
 * Script options: data-theme="light|dark", data-lang="es|en", data-target (id), data-api.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  // A removed async script must not create an orphan target after SPA navigation.
  if (!script || !script.isConnected) return;

  if (!window.BoliviaBlueWidget) {
    window.BoliviaBlueWidget = createRuntime();
  }
  var targetId = script.getAttribute('data-target') || 'bolivia-blue-widget';
  var el = document.getElementById(targetId);
  if (!el) {
    el = document.createElement('div');
    el.id = targetId;
    script.parentNode.insertBefore(el, script);
  }
  window.BoliviaBlueWidget.mount(el, {
    theme: script.getAttribute('data-theme'),
    lang: script.getAttribute('data-lang'),
    api: script.getAttribute('data-api'),
    medium: script.getAttribute('data-medium')
  });

  function createRuntime() {
    var API = 'https://www.boliviablue.com/api/blue-rate';
    var HOME = 'https://www.boliviablue.com/dolar-blue-hoy';
    var STALE_MS = 20 * 60 * 1000;
    var REFRESH_MS = 60 * 1000;
    var REQUEST_TIMEOUT_MS = 10 * 1000;
    var widgets = new Map();
    var sessions = new Map();
    var timer = null;
    var observer = null;
    var paused = false;

    // Match the site's dated-observation contract: explicit timezone, real date.
    function observedTime(value) {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
      var parts = value.slice(0, 19).split(/[-T:]/).map(Number);
      if (parts[1] < 1 || parts[1] > 12 || parts[2] < 1 || parts[2] > new Date(Date.UTC(parts[0], parts[1], 0)).getUTCDate() || parts[3] > 23 || parts[4] > 59 || parts[5] > 59) return null;
      var time = Date.parse(value);
      return Number.isFinite(time) && time <= Date.now() ? time : null;
    }

    function positive(value) {
      return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
    }

    function normalize(data) {
      data = data || {};
      var snapshot = {
        buy: positive(data.buy_bob_per_usd),
        sell: positive(data.sell_bob_per_usd),
        time: observedTime(data.updated_at_iso),
        stale: Boolean(data.is_stale)
      };
      snapshot.verified = snapshot.buy !== null && snapshot.sell !== null && snapshot.time !== null;
      return snapshot;
    }

    function render(widget) {
      var state = widget.session;
      var data = state.snapshot;
      var es = widget.lang === 'es';
      var dark = widget.theme === 'dark';
      var bg = dark ? '#111827' : '#ffffff';
      var fg = dark ? '#f9fafb' : '#111827';
      var muted = dark ? '#d1d5db' : '#4b5563';
      var border = dark ? '#374151' : '#e5e7eb';
      var status = !state.hasResult ? 'loading' : !data ? 'error' : !data.verified || data.time > Date.now() ? 'unknown' : data.stale || Date.now() - data.time > STALE_MS ? 'stale' : state.failed ? 'error' : 'fresh';
      var labels = es ? {
        loading: 'Cargando lectura…', fresh: 'Lectura reciente', stale: 'Lectura desactualizada',
        unknown: 'Lectura sin verificar', error: data ? 'Falló actualización · última lectura' : 'No se pudo cargar la lectura'
      } : {
        loading: 'Loading observation…', fresh: 'Recent observation', stale: 'Stale observation',
        unknown: 'Unverified observation', error: data ? 'Refresh failed · last observation' : 'Could not load observation'
      };
      var statusText = labels[status] + (status === 'stale' && state.failed ? (es ? ' · falló actualización' : ' · refresh failed') : '');
      var time = data && data.time !== null ? new Intl.DateTimeFormat(es ? 'es-BO' : 'en-GB', {
        timeZone: 'America/La_Paz', dateStyle: 'short', timeStyle: 'short', hourCycle: 'h23'
      }).format(new Date(data.time)) + ' (Bolivia, UTC−4)' : (es ? 'Hora no disponible' : 'Time unavailable');
      var color = status === 'fresh' ? (dark ? '#86efac' : '#166534') : status === 'loading' ? muted : (dark ? '#fcd34d' : '#92400e');
      var panel = dark ? '#1f2937' : '#f3f4f6';
      function cell(side, label) {
        var value = data && data[side] !== null ? data[side].toFixed(2) : '—';
        return '<div data-bb-cell style="background:' + panel + ';border-radius:8px;padding:8px 10px;min-width:0">' +
          '<div data-bb-label style="font-size:11px;color:' + muted + '">' + label + '</div>' +
          '<div data-bb-' + side + ' style="font-size:22px;font-weight:700;line-height:1.3;overflow-wrap:anywhere">' + value + '</div></div>';
      }
      widget.el.innerHTML = '<div data-bb-widget data-bb-status="' + status + '" lang="' + widget.lang + '" style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:12px;line-height:1.4;text-align:left;border:1px solid ' + border + ';border-radius:12px;padding:12px 14px;background:' + bg + ';color:' + fg + ';max-width:360px;box-sizing:border-box;overflow-wrap:anywhere">' +
        '<strong data-bb-heading style="display:block;font-size:15px">' + (es ? 'Dólar Blue Bolivia' : 'Bolivia Blue Dollar') + '</strong>' +
        '<div data-bb-source style="font-size:11px;color:' + muted + ';margin:2px 0 6px">P2P USDT/BOB · ' + (es ? 'BOB por USDT' : 'BOB per USDT') + '</div>' +
        '<div data-bb-status-text role="status" style="font-size:11px;font-weight:600;color:' + color + ';margin-bottom:8px">' + statusText + '</div>' +
        '<div data-bb-rates style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' + cell('buy', es ? 'Compra' : 'Buy') + cell('sell', es ? 'Venta' : 'Sell') + '</div>' +
        '<div data-bb-time style="font-size:11px;color:' + muted + ';margin-bottom:6px">' + (es ? 'Observación: ' : 'Observed: ') + time + '</div>' +
        '<div data-bb-caveat style="font-size:11px;color:' + muted + ';margin-bottom:8px">' + (es ? 'Referencia digital P2P; no es dólar en efectivo ni tipo oficial del BCB.' : 'Digital P2P reference; not a cash-dollar quote or the BCB official rate.') + '</div>' +
        '<a data-bb-attribution href="' + HOME + '?utm_source=embed&utm_medium=' + widget.medium + '" target="_blank" rel="noopener" style="font-size:12px;color:' + (dark ? '#93c5fd' : '#2563eb') + ';text-decoration:none;font-weight:600">' + (es ? 'Datos de' : 'Data by') + ' boliviablue.com →</a></div>';
    }

    function renderSession(session) {
      widgets.forEach(function (widget) { if (widget.session === session) render(widget); });
    }

    function cancelRequest(session) {
      var request = session.pending;
      if (!request) return;
      session.pending = null;
      clearTimeout(request.timeout);
      session.lastAttempt = null;
      request.controller.abort();
    }

    function refresh(session) {
      if (paused || document.hidden || session.pending || (session.lastAttempt !== null && Date.now() - session.lastAttempt < REFRESH_MS)) return;
      session.lastAttempt = Date.now();
      var request = { controller: new AbortController(), timeout: null };
      session.pending = request;
      var timeout = new Promise(function (_, reject) {
        request.timeout = setTimeout(function () {
          request.controller.abort();
          reject(new Error('Request timed out'));
        }, REQUEST_TIMEOUT_MS);
      });
      Promise.race([
        fetch(session.api, { credentials: 'omit', cache: 'no-store', signal: request.controller.signal }).then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        }), timeout
      ]).then(function (data) {
        if (session.pending !== request) return;
        var next = normalize(data);
        // Keep a known dated observation when a later response is incomplete.
        if (!next.verified && session.snapshot && session.snapshot.verified) {
          session.failed = true;
        } else {
          session.snapshot = next;
          session.failed = false;
        }
        session.hasResult = true;
      }).catch(function () {
        if (session.pending !== request) return;
        session.failed = true;
        session.hasResult = true;
      }).finally(function () {
        clearTimeout(request.timeout);
        if (session.pending !== request) return;
        session.pending = null;
        renderSession(session);
      });
    }

    function prune() {
      widgets.forEach(function (_, target) { if (!target.isConnected) unmount(target); });
    }

    function tick() {
      prune();
      if (paused || document.hidden) return;
      sessions.forEach(function (session) { renderSession(session); refresh(session); });
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      if (observer) observer.disconnect();
      observer = null;
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('pagehide', onPageHide);
      sessions.forEach(cancelRequest);
    }

    function onPageShow() {
      paused = false;
      prune();
      start();
      tick();
    }

    function onPageHide(event) {
      paused = true;
      stop();
      if (event.persisted) window.addEventListener('pageshow', onPageShow, { once: true });
      else { widgets.clear(); sessions.clear(); }
    }

    function start() {
      if (timer !== null || paused || !widgets.size) return;
      timer = setInterval(tick, 30 * 1000);
      observer = new MutationObserver(prune);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      document.addEventListener('visibilitychange', tick);
      window.addEventListener('pagehide', onPageHide);
    }

    function unmount(target) {
      var widget = widgets.get(target);
      if (!widget) return;
      widgets.delete(target);
      var inUse = false;
      widgets.forEach(function (other) { if (other.session === widget.session) inUse = true; });
      if (!inUse) {
        cancelRequest(widget.session);
        sessions.delete(widget.session.api);
      }
      if (!widgets.size) {
        stop();
        window.removeEventListener('pageshow', onPageShow);
      }
    }

    function mount(target, options) {
      if (!target || !target.isConnected) return;
      options = options || {};
      var api = options.api || API;
      var existing = widgets.get(target);
      // Re-evaluated script tags update options, without a second poll loop.
      if (existing && existing.session.api !== api) unmount(target);
      var session = sessions.get(api);
      if (!session) {
        session = { api: api, snapshot: null, failed: false, hasResult: false, lastAttempt: null, pending: null };
        sessions.set(api, session);
      }
      var widget = { el: target, session: session, theme: String(options.theme || '').toLowerCase() === 'dark' ? 'dark' : 'light', lang: String(options.lang || '').toLowerCase() === 'en' ? 'en' : 'es', medium: options.medium === 'iframe' ? 'iframe' : 'widget' };
      widgets.set(target, widget);
      render(widget);
      start();
      refresh(session);
    }

    return { mount: mount, unmount: unmount };
  }
})();
