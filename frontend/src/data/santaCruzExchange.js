export const SANTA_CRUZ_PATH = '/dolar-blue-santa-cruz';
// Contact information checked against the provider's own website. No partnership
// or cash quote is implied by this directory entry.
export const SANTA_CRUZ_PROVIDERS = [{
  id: 'cambio-aleman', name: 'Cambio Alemán Transatlántico S.R.L.',
  website: 'https://www.cambioaleman.com/',
  address: 'Calle 24 de Septiembre, acera este, Shopping Bolívar, local 16A',
  phone: '+591 3 3324114', whatsapp: '59178055570',
  email: 'atencionalcliente@cambioaleman.com', contactChecked: '2026-10-22',
  cashQuote: null,
}];
export function santaCruzPage(language = 'es') {
  const es = language !== 'en';
  return {
    title: es ? 'Dólar en Santa Cruz: referencia blue y cambio de efectivo | Bolivia Blue' : 'Santa Cruz dollar exchange: blue reference and cash quotes | Bolivia Blue',
    description: es ? 'Consultá el dólar blue de referencia y un contacto de cambio en Santa Cruz. Compará tu oferta real de efectivo con la tarjeta, incluyendo comisiones.' : 'Check the national blue-dollar reference and a Santa Cruz exchange contact. Compare your actual cash offer with card costs, including fees.',
    heading: es ? 'Dólar en Santa Cruz: referencia y efectivo' : 'Dollar exchange in Santa Cruz: reference and cash',
    intro: es ? 'Primero mirá la referencia nacional P2P. Después confirmá cuánto te entregan por tus billetes en Santa Cruz: la cotización de efectivo, sus cargos y su vigencia pueden ser distintos.' : 'Start with the national P2P reference. Then confirm what a Santa Cruz provider will pay for your banknotes: its cash quote, fees and validity may differ.',
    providersHeading: es ? 'Dónde consultar una cotización de efectivo' : 'Where to request a physical cash quote',
    status: es ? 'Cotización de efectivo pendiente de verificación' : 'Physical cash quote awaiting verification',
    limits: es ? 'El sitio del proveedor publica estos datos de contacto, pero no una oferta de efectivo que hayamos podido verificar. No mostramos la referencia P2P como si fuera su precio. La ficha no implica recomendación ni acuerdo comercial.' : 'The provider publishes these contact details, but we could not verify an executable cash offer. We do not present the P2P reference as its price. Listing does not imply an endorsement or partnership.',
    request: es ? 'Hola, quisiera cotizar la venta de USD en billetes en Santa Cruz. ¿Cuántos Bs recibiría netos por USD 100 y USD 1.000? ¿Hay comisiones, requisitos de billetes o identificación? ¿Hasta qué hora vale la oferta y en qué sucursal?' : 'Hello, I would like to sell USD banknotes in Santa Cruz. How many BOB would I receive after all fees for USD 100 and USD 1,000? Are there banknote or ID requirements? Until what time is the quote valid, and at which branch?',
    checklistHeading: es ? 'Qué pedir antes de cambiar USD 100 o USD 1.000' : 'What to ask before exchanging USD 100 or USD 1,000',
    checklist: es ? ['Monto final en Bs que vas a recibir, después de todos los cargos.', 'Sentido de la operación: estás vendiendo USD en billetes y recibiendo Bs.', 'Fecha, hora, plazo de validez y sucursal de la oferta.', 'Denominaciones y estado de billetes admitidos; documentos y disponibilidad.', 'Si la tarifa cambia para USD 100 y USD 1.000.'] : ['Final BOB you will receive after every charge.', 'Trade direction: you are selling physical USD and receiving BOB.', 'Date, time, validity period and branch for the offer.', 'Accepted banknote denominations and condition, ID and availability.', 'Whether the quote changes between USD 100 and USD 1,000.'],
  };
}
