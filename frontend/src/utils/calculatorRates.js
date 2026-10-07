// The collector stores P2P sides from the visitor's perspective:
// buy = BOB paid to buy USDT; sell = BOB received when selling USDT.
// USD and USDC are estimates using that same USDT reference, not cash quotes.
export const isP2PReferenceCurrency = (currency) => ['USD', 'USDT', 'USDC'].includes(currency);

export function calculatorRate(rateData, currency = 'USD', official = false, fromBOB = false, exchangeRates = {}) {
  if (!rateData) return 0;
  const usdBuy = Number(rateData.buy_bob_per_usd ?? rateData.buy);
  const usdSell = Number(rateData.sell_bob_per_usd ?? rateData.sell);
  const usdOfficial = Number(fromBOB ? rateData.official_sell : rateData.official_buy);
  let result;
  if (isP2PReferenceCurrency(currency)) {
    result = official ? usdOfficial : fromBOB ? usdBuy : usdSell;
  } else {
    // Fiat crosses have their own derivation. Preserve their existing sides and
    // the matching USD denominator used for the official cross estimate.
    const usdBlue = fromBOB ? usdSell : usdBuy;
    const fiatBlue = Number(rateData[`${fromBOB ? 'sell' : 'buy'}_bob_per_${currency.toLowerCase()}`]);
    if (Number.isFinite(fiatBlue) && fiatBlue > 0) {
      result = official ? usdOfficial * (fiatBlue / usdBlue) : fiatBlue;
    } else {
      const currencyToUSD = Number(exchangeRates[currency]);
      if (Number.isFinite(currencyToUSD) && currencyToUSD > 0) {
        result = (official ? usdOfficial : usdBlue) / currencyToUSD;
      }
    }
  }
  return Number.isFinite(result) && result > 0 ? result : 0;
}
