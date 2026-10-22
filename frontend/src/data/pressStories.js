export function pressStories(language='es') {
  return language==='en' ? [
    { title:'A daily reference with auditable sources', text:'Use a completed-day report with the fixed Binance, El Dorado and Bybit basket. Each dated edition links its chart, exact observations and methodology. Check coverage and any corrections before citing a trend.', href:'/prensa#informes-diarios', label:'Daily reports and evidence' },
    { title:'What does paying by QR or card really cost?', text:'Compare the same BOB purchase using the QR app’s final quote or stated rate and fees, alongside the card reference or the reader’s own rate. The input assumptions stay visible.', href:'/comparar-qr-tarjeta', label:'QR and card calculator' },
    { title:'Cash prices and the digital reference are different', text:'Start with the national P2P reference, request a dated physical-cash quote in Santa Cruz, then compare the net amount after fees. A directory contact is not a verified cash price.', href:'/dolar-blue-santa-cruz', label:'Santa Cruz cash comparison' },
  ] : [
    { title:'Una referencia diaria con fuentes auditables', text:'Usá un informe de día completo con la canasta fija Binance, El Dorado y Bybit. Cada edición fechada enlaza su gráfico, observaciones exactas y metodología. Revisá cobertura y correcciones antes de citar una tendencia.', href:'/prensa#informes-diarios', label:'Informes diarios y evidencia' },
    { title:'¿Cuánto cuesta realmente pagar por QR o tarjeta?', text:'Compará la misma compra en Bs con el total final de la app QR o su tasa y comisiones, junto con la referencia de tarjeta o la tasa que ingrese el lector. Los supuestos quedan visibles.', href:'/comparar-qr-tarjeta', label:'Comparador QR y tarjeta' },
    { title:'Efectivo y referencia digital no son el mismo precio', text:'Partí de la referencia nacional P2P, pedí una oferta fechada de billetes en Santa Cruz y compará el monto neto después de cargos. Un contacto del directorio no acredita una cotización.', href:'/dolar-blue-santa-cruz', label:'Comparar efectivo en Santa Cruz' },
  ];
}
export function renderPressStories(language='es') {
 const en=language==='en';return `<section data-press-stories class="rounded-2xl border border-sky-200 p-6 space-y-5"><h2 class="text-2xl font-bold">${en?'Resources for your next story':'Recursos para tu próxima nota'}</h2>${pressStories(language).map(p=>`<article><h3 class="text-lg font-semibold">${p.title}</h3><p>${p.text}</p><a href="${p.href}${en&&!p.href.includes('#')?'?lang=en':''}">${p.label} →</a></article>`).join('')}<p>${en?'Free editorial use. Attribution is welcome; there is no required link or paid placement.':'Uso editorial gratuito. Agradecemos la atribución; no exigimos enlaces ni ubicaciones pagadas.'}</p></section>`;
}
