import officialProvenance from '../../../shared/officialProvenance.cjs';

export const { officialPayload } = officialProvenance;

/** Presentation always starts from the same bound provenance as API readers. */
export function officialRateModel(row, language = 'es') {
  const payload = officialPayload(row);
  const es = language === 'es';
  const status = payload.official_status;
  const available = status === 'verified' || status === 'stale';
  return {
    ...payload,
    available,
    stale: status === 'stale',
    label: status === 'stale'
      ? (es ? 'Último BCB verificado' : 'Last verified BCB')
      : available ? (es ? 'BCB (oficial)' : 'BCB (official)')
        : (es ? 'Referencia oficial' : 'Official reference'),
    message: status === 'unverified'
      ? (es ? 'Fuente no verificada; valor no disponible.' : 'Source unverified; value unavailable.')
      : !available ? (es ? 'Referencia oficial no disponible.' : 'Official reference unavailable.') : null,
  };
}
