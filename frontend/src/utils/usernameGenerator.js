/**
 * Generate anonymous username
 * This is a client-side helper, but actual generation happens on server
 */
export function generateAnonymousUsername() {
  const adjectives = ['Usuario', 'Anonimo', 'Visitante', 'Miembro'];
  const randomNum = Math.floor(Math.random() * 10000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${randomNum}`;
}
