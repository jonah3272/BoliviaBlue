/** Prefer the existing API's published_at_iso contract; support older stored rows. */
export function storedTweetDate(tweet) {
  for (const value of [tweet?.published_at_iso, tweet?.published_at]) {
    if (typeof value !== 'string') continue;
    const text = value.trim();
    // Database/API timestamps include a time and timezone; don't reinterpret
    // arbitrary numeric strings as calendar dates or invent a missing timezone.
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) continue;
    const [year, month, day] = text.slice(0, 10).split('-').map(Number);
    const monthDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > monthDays) continue;
    const time = Date.parse(text);
    if (Number.isFinite(time)) return new Date(time).toISOString();
  }
  return null;
}

export function newestStoredTweetDate(tweets) {
  const dates = (Array.isArray(tweets) ? tweets : []).map(storedTweetDate).filter(Boolean);
  return dates.length ? dates.reduce((latest, date) => Date.parse(date) > Date.parse(latest) ? date : latest) : null;
}

export function formatStoredTweetDate(isoString, language = 'es') {
  const iso = storedTweetDate({ published_at_iso: isoString });
  if (!iso) return language === 'en' ? 'Date unavailable' : 'Fecha no disponible';
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-BO', {
    timeZone: 'America/La_Paz', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}
