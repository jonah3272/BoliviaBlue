/** Neighbor-fiat landings: live USDT cross, never an invented multiplier. */
export const NEIGHBOR_FIATS = {
  PEN: {
    code: 'PEN',
    path: '/sol-a-boliviano',
    seoPage: 'sol',
    accent: 'green',
    thousandScale: false,
    defaultConvert: '100',
    convertAmounts: [20, 50, 100, 500, 1000, 5000],
    buyField: 'buy_bob_per_pen',
    sellField: 'sell_bob_per_pen',
    derivationField: 'pen_derivation',
    updatedField: 'pen_updated_at_iso',
    spotSymbol: 'USDTPEN',
    keywordsEs:
      'sol peruano a boliviano, pen a bob, tipo de cambio peru bolivia, sol a boliviano, desaguadero cambio, paralelo peru bolivia',
    keywordsEn:
      'peruvian sol to boliviano, pen to bob, peru bolivia exchange rate, sol a boliviano, desaguadero currency',
    h1Es: 'Sol peruano a boliviano – PEN a BOB (paralelo)',
    h1En: 'Peruvian sol to boliviano – PEN to BOB (parallel)',
    crumbEs: 'Sol a Boliviano',
    crumbEn: 'Sol to Boliviano',
    snapshotTitleEs: 'Tipo de cambio actual: sol peruano a boliviano',
    snapshotTitleEn: 'Current exchange rate: Peruvian sol to boliviano',
    convertLabelEs: 'Convertir PEN → BOB (compra de referencia)',
    convertLabelEn: 'Convert PEN → BOB (reference buy)',
    sectionTitleEs: 'PEN a BOB en Bolivia: sol peruano vía USDT',
    sectionTitleEn: 'PEN to BOB in Bolivia: Peruvian sol via USDT',
    introEs: (buyStr) =>
      `El sol peruano a boliviano no se cotiza en ventanilla como el dólar. Publicamos un cruce en vivo: BOB por USDT en P2P dividido por PEN por USDT (libro P2P de Binance o, si no hay ofertas, el spot USDTPEN). Un sol vale unos ${buyStr || '—'} bolivianos. Nunca usamos un tipo fijo inventado.`,
    introEn: (buyStr) =>
      `The Peruvian sol to boliviano is not quoted at cash desks the way the dollar is. We publish a live cross: BOB per USDT on P2P divided by PEN per USDT (Binance P2P book or, if that book is empty, USDTPEN spot). One sol is about ${buyStr || '—'} bolivianos. We never invent a fixed multiplier.`,
    usefulEs:
      'Sirve si cruzas Desaguadero, viajas Lima–La Paz, o recibes soles y necesitas una referencia en Bs. El BCB cotiza USD/BOB, no PEN/BOB; un cruce oficial de eso no es una cotización del banco de soles.',
    usefulEn:
      'Useful if you cross Desaguadero, travel Lima–La Paz, or receive soles and need a Bs reference. The BCB quotes USD/BOB, not PEN/BOB; an official cross of that is not a central-bank sol quote.',
    howEs:
      'Tomamos la mediana P2P de USDT/BOB (la misma del dólar blue) y la dividimos por PEN por USDT. Si Binance P2P no tiene libro PEN líquido, usamos el ticker spot USDTPEN. El resultado es Bs por 1 sol. No hay un mercado de efectivo PEN/BOB comparable al del dólar en Santa Cruz o La Paz.',
    howEn:
      'We take the P2P median of USDT/BOB (the same as the blue dollar) and divide by PEN per USDT. If Binance P2P has no liquid PEN book, we use the USDTPEN spot ticker. The result is Bs per 1 sol. There is no PEN/BOB cash market comparable to the dollar in Santa Cruz or La Paz.',
    vsBlueEs:
      'El paralelo en Bolivia se mueve con el dólar blue. El sol sigue esa misma escasez de dólares vía USDT: si el blue sube, PEN/BOB suele subir aunque el sol esté quieto frente al dólar en Lima.',
    vsBlueEn:
      'Bolivia’s parallel market moves with the blue dollar. The sol tracks that same dollar shortage via USDT: if blue rises, PEN/BOB usually rises even if the sol is quiet versus the dollar in Lima.',
    faqUnitEs: '¿Cuánto es 100 soles a bolivianos?',
    faqUnitEn: 'How much is 100 Peruvian soles to bolivianos?',
    faqCashEs: '¿El sol peruano blue se observa en efectivo en Bolivia?',
    faqCashEn: 'Is the Peruvian sol blue observed in cash in Bolivia?',
    faqCashAnswerEs:
      'No. Calculamos PEN/BOB cruzando USDT/BOB y USDT/PEN (o el spot USDTPEN si el P2P de soles no tiene liquidez). Es una referencia, no un precio de casa de cambio. Nunca usamos un tipo fijo inventado.',
    faqCashAnswerEn:
      'No. We cross USDT/BOB with USDT/PEN (or USDTPEN spot if sol P2P is thin). It is a reference, not an exchange-house price. We never use an invented fixed multiplier.',
  },
  ARS: {
    code: 'ARS',
    path: '/peso-argentino-a-boliviano',
    seoPage: 'peso-ars',
    accent: 'blue',
    thousandScale: true,
    defaultConvert: '10000',
    convertAmounts: [1000, 10000, 50000, 100000, 500000, 1000000],
    buyField: 'buy_bob_per_ars',
    sellField: 'sell_bob_per_ars',
    derivationField: 'ars_derivation',
    updatedField: 'ars_updated_at_iso',
    spotSymbol: 'USDTARS',
    keywordsEs:
      'peso argentino a boliviano, ars a bob, 1000 pesos argentinos en bolivia, tipo de cambio argentina bolivia, villazon la quiaca cambio',
    keywordsEn:
      'argentine peso to boliviano, ars to bob, 1000 argentine pesos in bolivia, argentina bolivia exchange rate',
    h1Es: 'Peso argentino a boliviano – ARS a BOB (paralelo)',
    h1En: 'Argentine peso to boliviano – ARS to BOB (parallel)',
    crumbEs: 'Peso argentino a Boliviano',
    crumbEn: 'Argentine peso to Boliviano',
    snapshotTitleEs: 'Tipo de cambio actual: peso argentino a boliviano',
    snapshotTitleEn: 'Current exchange rate: Argentine peso to boliviano',
    convertLabelEs: 'Convertir ARS → BOB (compra de referencia)',
    convertLabelEn: 'Convert ARS → BOB (reference buy)',
    sectionTitleEs: 'ARS a BOB en Bolivia: peso argentino vía USDT',
    sectionTitleEn: 'ARS to BOB in Bolivia: Argentine peso via USDT',
    introEs: (buyStr, thousandBuy) =>
      `El peso argentino a boliviano no se cotiza en ventanilla como el dólar. Publicamos un cruce en vivo: BOB por USDT en P2P dividido por ARS por USDT (libro P2P o, si no hay ofertas, el spot USDTARS). Un peso vale unos ${buyStr || '—'} bolivianos; por eso mostramos 1.000 ARS ≈ ${thousandBuy || '—'} Bs. Nunca un tipo fijo tipo “1.000 ARS = 1 USD”.`,
    introEn: (buyStr, thousandBuy) =>
      `The Argentine peso to boliviano is not quoted at cash desks the way the dollar is. We publish a live cross: BOB per USDT on P2P divided by ARS per USDT (P2P book or, if empty, USDTARS spot). One peso is about ${buyStr || '—'} bolivianos, so we also show 1,000 ARS ≈ ${thousandBuy || '—'} Bs. Never a fixed “1,000 ARS = 1 USD” multiplier.`,
    usefulEs:
      'Sirve si cruzas Villazón–La Quiaca, viajas Buenos Aires–Santa Cruz, o recibes pesos argentinos. El BCB no publica ARS/BOB; un cruce del oficial USD/BOB no es una cotización argentina ni boliviana de pesos.',
    usefulEn:
      'Useful if you cross Villazón–La Quiaca, travel Buenos Aires–Santa Cruz, or receive Argentine pesos. The BCB does not publish ARS/BOB; a cross of official USD/BOB is not an Argentine or Bolivian peso quote.',
    howEs:
      'Tomamos la mediana P2P de USDT/BOB y la dividimos por ARS por USDT. Si el libro P2P de pesos está seco, usamos USDTARS spot. Un peso vale menos de 1 Bs, por eso la escala de 1.000 ARS es la que Google y los viajeros pueden leer.',
    howEn:
      'We take the P2P median of USDT/BOB and divide by ARS per USDT. If the peso P2P book is thin, we use USDTARS spot. One peso is under 1 Bs, so the 1,000 ARS scale is what Google and travelers can actually read.',
    vsBlueEs:
      'El blue boliviano y el blue argentino no son el mismo mercado. Acá el cruce es USDT en Bolivia contra USDT en Argentina: dos paralelos distintos, un solo puente.',
    vsBlueEn:
      'Bolivia’s blue and Argentina’s blue are not the same market. The cross here is USDT in Bolivia against USDT in Argentina: two parallel markets, one bridge.',
    faqUnitEs: '¿Cuánto es 1000 pesos argentinos a bolivianos?',
    faqUnitEn: 'How much is 1,000 Argentine pesos to bolivianos?',
    faqCashEs: '¿El peso argentino blue se observa en efectivo en Bolivia?',
    faqCashEn: 'Is the Argentine peso blue observed in cash in Bolivia?',
    faqCashAnswerEs:
      'No. Calculamos ARS/BOB cruzando USDT/BOB y USDT/ARS (o el spot USDTARS). Es una referencia, no un precio de casa de cambio en Villazón. Nunca usamos un tipo fijo inventado.',
    faqCashAnswerEn:
      'No. We cross USDT/BOB with USDT/ARS (or USDTARS spot). It is a reference, not a cash-house price in Villazón. We never use an invented fixed multiplier.',
  },
  CLP: {
    code: 'CLP',
    path: '/peso-chileno-a-boliviano',
    seoPage: 'peso-clp',
    accent: 'purple',
    thousandScale: true,
    defaultConvert: '10000',
    convertAmounts: [1000, 10000, 50000, 100000, 500000, 1000000],
    buyField: 'buy_bob_per_clp',
    sellField: 'sell_bob_per_clp',
    derivationField: 'clp_derivation',
    updatedField: 'clp_updated_at_iso',
    spotSymbol: 'USDTCLP',
    keywordsEs:
      'peso chileno a boliviano, clp a bob, 1000 pesos chilenos en bolivia, tipo de cambio chile bolivia, pisiga colchane cambio, arica la paz',
    keywordsEn:
      'chilean peso to boliviano, clp to bob, 1000 chilean pesos in bolivia, chile bolivia exchange rate, pisiga colchane',
    h1Es: 'Peso chileno a boliviano – CLP a BOB (paralelo)',
    h1En: 'Chilean peso to boliviano – CLP to BOB (parallel)',
    crumbEs: 'Peso chileno a Boliviano',
    crumbEn: 'Chilean peso to Boliviano',
    snapshotTitleEs: 'Tipo de cambio actual: peso chileno a boliviano',
    snapshotTitleEn: 'Current exchange rate: Chilean peso to boliviano',
    convertLabelEs: 'Convertir CLP → BOB (compra de referencia)',
    convertLabelEn: 'Convert CLP → BOB (reference buy)',
    sectionTitleEs: 'CLP a BOB en Bolivia: peso chileno vía USDT',
    sectionTitleEn: 'CLP to BOB in Bolivia: Chilean peso via USDT',
    introEs: (buyStr, thousandBuy) =>
      `El peso chileno a boliviano no se cotiza en ventanilla como el dólar. Publicamos un cruce en vivo: BOB por USDT en P2P dividido por CLP por USDT (libro P2P o, si no hay ofertas, el spot USDTCLP). Un peso vale unos ${buyStr || '—'} bolivianos; por eso mostramos 1.000 CLP ≈ ${thousandBuy || '—'} Bs. Nunca un tipo fijo inventado.`,
    introEn: (buyStr, thousandBuy) =>
      `The Chilean peso to boliviano is not quoted at cash desks the way the dollar is. We publish a live cross: BOB per USDT on P2P divided by CLP per USDT (P2P book or, if empty, USDTCLP spot). One peso is about ${buyStr || '—'} bolivianos, so we also show 1,000 CLP ≈ ${thousandBuy || '—'} Bs. We never invent a fixed rate.`,
    usefulEs:
      'Sirve si cruzas Pisiga–Colchane, viajas Arica–La Paz, o comparas un sueldo en pesos chilenos con precios en Bs. El BCB no publica CLP/BOB.',
    usefulEn:
      'Useful if you cross Pisiga–Colchane, travel Arica–La Paz, or compare a Chilean-peso salary with Bs prices. The BCB does not publish CLP/BOB.',
    howEs:
      'Tomamos la mediana P2P de USDT/BOB y la dividimos por CLP por USDT. Si el libro P2P de pesos chilenos está seco, usamos USDTCLP spot. Un peso vale menos de 1 Bs; la escala de 1.000 CLP es la que se lee en el SERP.',
    howEn:
      'We take the P2P median of USDT/BOB and divide by CLP per USDT. If the Chilean-peso P2P book is thin, we use USDTCLP spot. One peso is under 1 Bs; the 1,000 CLP scale is what the SERP can read.',
    vsBlueEs:
      'Chile cotiza un tipo más “oficial” que Bolivia. El cruce acá no es el dólar observado en Santiago: es el paralelo boliviano (USDT/BOB) contra CLP/USDT. Si el blue boliviano se mueve, CLP/BOB se mueve aunque el peso chileno esté quieto.',
    vsBlueEn:
      'Chile quotes a more official dollar than Bolivia. This cross is not the dollar observed in Santiago: it is Bolivia’s parallel (USDT/BOB) against CLP/USDT. If Bolivian blue moves, CLP/BOB moves even if the Chilean peso is quiet.',
    faqUnitEs: '¿Cuánto es 1000 pesos chilenos a bolivianos?',
    faqUnitEn: 'How much is 1,000 Chilean pesos to bolivianos?',
    faqCashEs: '¿El peso chileno blue se observa en efectivo en Bolivia?',
    faqCashEn: 'Is the Chilean peso blue observed in cash in Bolivia?',
    faqCashAnswerEs:
      'No. Calculamos CLP/BOB cruzando USDT/BOB y USDT/CLP (o el spot USDTCLP). Es una referencia, no un precio de casa de cambio en Pisiga. Nunca usamos un tipo fijo inventado.',
    faqCashAnswerEn:
      'No. We cross USDT/BOB with USDT/CLP (or USDTCLP spot). It is a reference, not a cash-house price in Pisiga. We never use an invented fixed multiplier.',
  },
};

export const NEIGHBOR_FIAT_LIST = [NEIGHBOR_FIATS.PEN, NEIGHBOR_FIATS.ARS, NEIGHBOR_FIATS.CLP];
