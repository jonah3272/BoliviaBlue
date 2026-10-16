import { officialRateModel } from '../utils/officialRate';

/** BCB publication and retrieval dates are independent from the P2P timestamp. */
export default function OfficialRateNote({ rate, language = 'es' }) {
  const official = officialRateModel(rate, language);
  const es = language === 'es';
  if (!official.available) return <span>{official.message}</span>;
  return <>
    <span>{official.label}</span>
    {' · '}
    <span>{es ? 'Fecha BCB' : 'BCB board date'}: <time dateTime={official.official_source_date}>{official.official_source_date}</time></span>
    <span className="block">
      {es ? 'Consulta original' : 'Original retrieval'}: <time dateTime={official.official_observed_at}>{new Date(official.official_observed_at).toLocaleString(es ? 'es-BO' : 'en-GB', { timeZone: 'America/La_Paz' })}</time>
      {es ? ' (hora de Bolivia)' : ' (Bolivia time)'}
    </span>
  </>;
}
