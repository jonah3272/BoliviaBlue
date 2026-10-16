import officialProvenance from '../shared/officialProvenance.cjs';
import officialResolver from '../shared/officialRate.cjs';

/** Both collectors use the same BCB-only, provenance-preserving policy. */
export async function getOfficialRate(supabase, options = {}) {
  return officialResolver.resolveOfficialRate(supabase, options);
}

/** Compatibility for legacy schedulers: static official quotes are unavailable. */
export function getStaticOfficialRate() {
  return officialProvenance.officialPayload({});
}
