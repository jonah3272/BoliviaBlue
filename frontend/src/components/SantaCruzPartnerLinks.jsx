const MICASA_SANTA_CRUZ_URL = 'https://www.micasabolivia.com/barrios-santa-cruz/';
const BOLIVAMOS_THINGS_TO_DO_URL = 'https://bolivamos.com/things-to-do/';

const linkClass = 'text-blue-700 dark:text-blue-300 hover:underline font-medium';

/**
 * Reciprocal Santa Cruz guides (exact English anchors requested by partners).
 */
export default function SantaCruzPartnerLinks({ language = 'es', className = '' }) {
  const es = language === 'es';

  return (
    <p className={className}>
      {es
        ? 'Si estás en Santa Cruz por una compra o un viaje, estas dos guías locales ayudan: '
        : 'If you are in Santa Cruz for a purchase or a trip, these two local guides help: '}
      <a
        href={MICASA_SANTA_CRUZ_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        real estate in Santa Cruz
      </a>
      {' · '}
      <a
        href={BOLIVAMOS_THINGS_TO_DO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Things to do in Santa Cruz
      </a>
      .
    </p>
  );
}
