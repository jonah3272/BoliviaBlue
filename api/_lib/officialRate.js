const resolver = require('../../shared/officialRate.cjs');
const { officialPayload } = require('../../shared/officialProvenance.cjs');

// Reading a row never fetches/attaches today's BCB quote to a historical row,
// never fills an intentional unavailable value, and never writes historical data.
async function attachOfficial(data) {
  return data ? { ...data, ...officialPayload(data) } : data;
}
module.exports = { ...resolver, attachOfficial };
