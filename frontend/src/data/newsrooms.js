/**
 * Public newsroom targets for Bolivia Blue outreach.
 * Emails are only included when published on the outlet’s own site.
 * Jonah still has to hit Send — this file is the desk, not a mailer.
 */

export const SITE = 'https://www.boliviablue.com';
export const PRESS_EMAIL = 'info@boliviablue.com';

export function encodeMail(subject, body, to = '') {
  const params = new URLSearchParams();
  if (to) params.set('to', to);
  params.set('su', subject);
  params.set('body', body);
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { gmail, mailto };
}

export function whatsappShare(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function telegramShare(url, text) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function pitchFor(outlet, liveLine) {
  const cite = `${SITE}/dolar-blue-hoy`;
  const kit = `${SITE}/prensa`;
  const csv = `${SITE}/api/historical-data.csv?range=30d`;
  return `Hola ${outlet.greeting},

Soy de Bolivia Blue (${SITE}). Publicamos la cotización del dólar blue / paralelo en Bolivia como mediana P2P verificada (Binance, El Dorado, OKX), ~cada 15 min.

${liveLine}

Si les sirve para una nota, gráfico o boletín, pueden citar:
• Cotización de hoy: ${cite}
• Kit de prensa (HTML + CSV + widget): ${kit}
• CSV 30 días: ${csv}

${outlet.hook}

Quedo atento si necesitan una serie más larga o una captura para publicación.

Saludos
Bolivia Blue
${PRESS_EMAIL}`;
}

export const NEWSROOMS = [
  {
    id: 'cadecocruz',
    name: 'Cadecocruz',
    city: 'Santa Cruz',
    why: 'Ya citan “el portal Dólar Blue Bolivia”. Pedí que el enlace apunte a boliviablue.com.',
    greeting: 'equipo de indicadores / comunicaciones de Cadecocruz',
    hook: 'Vimos que su web y notas de prensa usan un portal del paralelo. Podemos darles la lectura verificada + CSV gratis a cambio de atribución con enlace.',
    contactUrl: 'https://www.cadecocruz.org.bo/index.php',
    email: 'info@cadecocruz.org.bo',
    priority: true,
  },
  {
    id: 'el-deber',
    name: 'El Deber',
    city: 'Santa Cruz',
    why: 'Redacción de economía de mayor alcance en el oriente. Una cita con enlace vale más que 100 directorios.',
    greeting: 'redacción de Economía de El Deber',
    hook: 'Ofrecemos “cierre del paralelo hoy + gráfico” listo para nota, con metodología pública.',
    contactUrl: 'https://eldeber.com.bo/',
    email: '',
    priority: true,
  },
  {
    id: 'los-tiempos',
    name: 'Los Tiempos',
    city: 'Cochabamba',
    why: 'Hub de valle. Encaja con /dolar-blue-cochabamba.',
    greeting: 'redacción de Economía de Los Tiempos',
    hook: 'Podemos mandar un cierre diario Cochabamba (misma mediana nacional P2P, explícito) + CSV.',
    contactUrl: 'https://www.lostiempos.com/',
    email: '',
    priority: true,
  },
  {
    id: 'opinion',
    name: 'Opinión',
    city: 'Cochabamba',
    why: 'Segundo diario de valle; cubren tipo de cambio con frecuencia.',
    greeting: 'redacción de Opinión',
    hook: 'Columna corta o recuadro de datos: blue vs BCB, con enlace a metodología.',
    contactUrl: 'https://www.opinion.com.bo/',
    email: '',
    priority: false,
  },
  {
    id: 'unitel',
    name: 'Unitel',
    city: 'Nacional',
    why: 'TV: un gráfico en el noticiero + “fuente Bolivia Blue” en pantalla.',
    greeting: 'mesa de Economía de Unitel',
    hook: 'Les armamos un recuadro de 15s: compra / venta / vs BCB. Widget o captura lista.',
    contactUrl: 'https://unitel.bo/',
    email: '',
    priority: true,
  },
  {
    id: 'red-uno',
    name: 'Red Uno',
    city: 'Nacional',
    why: 'TV nacional. Mismo pitch de recuadro en vivo.',
    greeting: 'mesa de Economía de Red Uno',
    hook: 'Recuadro en vivo del paralelo con atribución a boliviablue.com.',
    contactUrl: 'https://reduno.com.bo/',
    email: '',
    priority: false,
  },
  {
    id: 'eju',
    name: 'Eju.tv',
    city: 'Digital',
    why: 'Agrega rápido y linkea fuentes. Ideal para HTML de cita.',
    greeting: 'equipo de Eju',
    hook: 'Snippet HTML de una línea + badge SVG en vivo para sus notas de dólar.',
    contactUrl: 'https://eju.tv/',
    email: '',
    priority: true,
  },
  {
    id: 'la-razon',
    name: 'La Razón',
    city: 'La Paz',
    why: 'Alcance altiplano; encaja con /dolar-blue-la-paz.',
    greeting: 'redacción de Economía de La Razón',
    hook: 'Cierre La Paz + gráfico histórico 30 días, atribución a Bolivia Blue.',
    contactUrl: 'https://www.la-razon.com/',
    email: '',
    priority: false,
  },
  {
    id: 'radio-fides',
    name: 'Radio Fides',
    city: 'Nacional',
    why: 'Radio: pitch de 30s, “el paralelo según Bolivia Blue”.',
    greeting: 'producción de Radio Fides',
    hook: 'Les mandamos un cierre escrito de 30s cada mañana (blue vs BCB + link).',
    contactUrl: 'https://www.radiofides.com/',
    email: '',
    priority: false,
  },
  {
    id: 'cainco',
    name: 'CAINCO',
    city: 'Santa Cruz',
    why: 'Cámara empresarial: boletines y socios miran el paralelo.',
    greeting: 'área de estudios / comunicaciones de CAINCO',
    hook: 'CSV + widget para su boletín a cambio de mención con enlace.',
    contactUrl: 'https://www.cainco.org.bo/',
    email: '',
    priority: false,
  },
  {
    id: 'uagrm',
    name: 'UAGRM / tesis de economía',
    city: 'Santa Cruz',
    why: 'Citas académicas .edu son duras y duran años.',
    greeting: 'biblioteca / facultad de ciencias económicas',
    hook: 'CSV histórico gratis para tesis a cambio de citar boliviablue.com/datos-historicos.',
    contactUrl: 'https://www.uagrm.edu.bo/',
    email: '',
    priority: false,
  },
];

export const WEEKLY_ACTIONS = [
  { id: 'cadecocruz', label: 'Escribir a Cadecocruz (info@, ya citan un portal rival)' },
  { id: 'el-deber', label: 'Mandar cierre + gráfico a Economía de El Deber' },
  { id: 'tv', label: 'Ofrecer recuadro de 15s a Unitel o Red Uno' },
  { id: 'groups', label: 'Pegar cotización + link en 3 grupos de WhatsApp/Telegram' },
  { id: 'embed', label: 'Pedirle a 1 blog o newsletter que embeba el widget' },
];

export const GUEST_COLUMN_ES = `Cómo leer el dólar paralelo en Bolivia (sin confundirlo con el BCB)

Cuando alguien pregunta “¿a cuánto está el dólar?”, en Bolivia casi nunca habla del tipo oficial del Banco Central. Habla del paralelo: el precio al que se consiguen dólares (o USDT) fuera de ventanilla.

Bolivia Blue publica esa lectura como mediana de ofertas P2P (Binance, El Dorado, OKX y Bybit cuando hay mercado), actualizada cada ~15 minutos. No es el precio de una casa de cambio en la calle ni el tipo del BCB. Compra es cuántos bolivianos pagás para obtener 1 USD en P2P; venta es cuántos recibís al vender.

Por eso un recuadro serio muestra tres cosas juntas: paralelo (blue), oficial BCB, y la hora de la lectura. El histórico y el CSV están abiertos en ${SITE}/datos-historicos. Metodología: ${SITE}/fuente-de-datos.

Si vas a citar el paralelo en una nota, el enlace estable es ${SITE}/dolar-blue-hoy.

— Bolivia Blue`;

export const DIRECTORIES = [
  { name: 'AlternativeTo', url: 'https://alternativeto.net/', note: 'Listá Bolivia Blue vs otros monitores FX LatAm.' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/', note: 'Lanzamiento “Bolivia parallel dollar API + widget”.' },
  { name: 'GitHub Awesome', url: 'https://github.com/topics/awesome', note: 'PR a listas awesome-public-datasets / awesome-latin-america.' },
  { name: 'Indie Hackers', url: 'https://www.indiehackers.com/', note: 'Post de “open FX data for Bolivia” con API + CSV.' },
];
