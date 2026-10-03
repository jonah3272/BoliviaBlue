export const ELDORADO_GUIDE_CHECKED = '2026-10-03';
export const ELDORADO_GUIDE_SOURCES = [
  ['buy', 'Comprar USDT', 'Buy USDT', 'https://faq.eldorado.io/es/articles/12372661-como-comprar-usdt-en-el-dorado-paso-a-paso'],
  ['sell', 'Vender USDT', 'Sell USDT', 'https://faq.eldorado.io/es/articles/12373683-como-vender-usdt-en-el-dorado-paso-a-paso'],
  ['qr', 'QR para una orden P2P en Bolivia', 'QR for a Bolivia P2P order', 'https://eldorado.io/blog/como-comprar-usdt-qr-bolivia-guia-paso-a-paso'],
  ['kyc', 'Registro y requisitos', 'Signup requirements', 'https://faq.eldorado.io/es/articles/12334724-preguntas-frecuentes-al-registrarse'],
  ['fees', 'Comisiones', 'Fees', 'https://eldorado.io/blog/comisiones-el-dorado-p2p'],
  ['limits', 'Límites y tiempos', 'Limits and timing', 'https://faq.eldorado.io/es/articles/12382059-limites-y-tiempos-de-las-transacciones-p2p'],
  ['payment', 'Titular del método de pago', 'Payment account ownership', 'https://eldorado.io/blog/metodos-de-pago-terceros-el-dorado-p2p'],
  ['help', 'Disputas y ayuda', 'Disputes and help', 'https://faq.eldorado.io/es/articles/12382040-que-hacer-si-tengo-un-problema-en-una-transaccion-p2p'],
];

export function getEldoradoGuide(language = 'es', direction = 'buy') {
  const es = language === 'es';
  const selling = direction === 'sell';
  return {
    direction: selling ? 'sell' : 'buy',
    title: selling
      ? (es ? 'Vender USDT y recibir bolivianos' : 'Sell USDT and receive bolivianos')
      : (es ? 'Comprar USDT pagando con bolivianos' : 'Buy USDT by paying with bolivianos'),
    summary: selling
      ? (es ? 'Entregás USDT de tu saldo y recibís BOB en tu cuenta o billetera admitida.' : 'You sell USDT from your balance and receive BOB in a supported account or wallet.')
      : (es ? 'Pagás BOB desde tu cuenta o billetera admitida y recibís USDT en El Dorado.' : 'You pay BOB from a supported account or wallet and receive USDT in El Dorado.'),
    steps: selling ? (es ? [
      ['Prepará tu saldo', 'Necesitás USDT disponibles en El Dorado. Revisá cualquier costo o red antes de depositar criptomonedas.'],
      ['Elegí la dirección', 'En P2P o Cambiar: Tengo USDT → Quiero BOB. Indicá el monto y medio de cobro.'],
      ['Compará compradores', 'Revisá historial, reputación, límites y condiciones del anuncio.'],
      ['Comprobá los totales', 'Antes de crear la orden, revisá los USDT debitados, los BOB a recibir y las comisiones.'],
      ['Esperá el pago', 'Abrí tu banco o billetera y verificá la acreditación real y el importe completo. Una captura no basta.'],
      ['Liberá solo después de cobrar', 'Una vez confirmado el dinero en tu cuenta, marcá Pago recibido y liberá los USDT. Ante diferencias, no liberes y pedí ayuda.'],
    ] : [
      ['Prepare your balance', 'You need available USDT in El Dorado. Check any fees and network before depositing crypto.'],
      ['Choose the direction', 'In P2P or Exchange: I have USDT → I want BOB. Enter the amount and receiving method.'],
      ['Compare buyers', 'Review history, reputation, limits and offer terms.'],
      ['Check the totals', 'Before creating the order, check USDT debited, BOB to receive and fees.'],
      ['Wait for payment', 'Open your bank or wallet and verify the actual credit and full amount. A screenshot is not enough.'],
      ['Release only after receiving payment', 'Once the money is confirmed in your account, mark payment received and release USDT. Do not release if anything differs; get help.'],
    ]) : (es ? [
      ['Abrí y verificá tu cuenta', 'Usá el enlace de El Dorado y completá la verificación de identidad en la app.'],
      ['Elegí la dirección', 'En P2P o Cambiar: Tengo BOB → Quiero USDT. Elegí monto y QR o transferencia admitida.'],
      ['Compará vendedores', 'Revisá historial, reputación, límites y condiciones del anuncio.'],
      ['Comprobá los totales', 'Revisá BOB a pagar, USDT netos y comisión antes de crear la orden.'],
      ['Pagá desde tu propia cuenta', 'Usá únicamente los datos y método de la orden. Para QR, descargalo de la orden y verificá el destinatario en tu banco.'],
      ['Marcá el pago después de transferir', 'Solo después de pagar, marcá Pagada o Pago realizado y conservá el comprobante.'],
      ['Verificá la llegada de USDT', 'El vendedor confirma el pago y los USDT llegan a tu billetera. Si hay un problema, usá la disputa de la orden.'],
    ] : [
      ['Open and verify your account', 'Use the El Dorado link and complete identity verification in the app.'],
      ['Choose the direction', 'In P2P or Exchange: I have BOB → I want USDT. Choose an amount and supported QR or transfer.'],
      ['Compare sellers', 'Review history, reputation, limits and offer terms.'],
      ['Check the totals', 'Review BOB payable, net USDT and fees before creating the order.'],
      ['Pay from your own account', 'Use only the order’s payment details and method. Download its QR and verify the recipient in your bank.'],
      ['Mark paid after transferring', 'Only after paying, mark the order paid and keep your receipt.'],
      ['Verify the USDT received', 'The seller confirms payment and USDT reaches your wallet. Use the order’s dispute option if there is a problem.'],
    ]),
  };
}
