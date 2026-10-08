/** A blank inquiry only. Preparing or copying it does not send a request. */
export const DATA_INQUIRY_EMAIL = 'info@boliviablue.com';
export const DATA_INQUIRY_PATH = '/contacto#data-request';

const COPY = {
  es: {
    heading: 'Datos para tu proyecto',
    introduction: '¿Necesitás otro período, una integración API o consultar condiciones de uso? Prepará una consulta con lo que buscás.',
    limitation: 'La disponibilidad, cobertura y condiciones requieren revisión manual. Preparar el correo no confirma acceso ni garantiza un conjunto de datos.',
    prepareLabel: 'Preparar correo',
    copyLabel: 'Copiar consulta',
    copyingLabel: 'Copiando…',
    previewLabel: 'Ver la consulta para copiar manualmente',
    templateLabel: 'Consulta completa',
    nextStep: 'Completá los campos en tu correo y revisalo antes de enviarlo. Si no se abre una aplicación de correo, copiá la consulta.',
    copied: 'Consulta copiada. Pegala en tu correo, completala y revisala antes de enviarla.',
    copyFailed: 'No se pudo copiar automáticamente. Seleccioná y copiá el texto de abajo.',
    subject: 'Consulta de datos - Bolivia Blue',
    toLabel: 'Para',
    subjectLabel: 'Asunto',
    body: 'Hola:\nQuisiera consultar la disponibilidad y las condiciones para este proyecto.\n\nPeríodo que necesito:\nFormato: CSV / JSON / API\nUso previsto:\nProyecto u organización (opcional):\n\n¿Qué cobertura y opciones de acceso podrían estar disponibles?'
  },
  en: {
    heading: 'Data for your project',
    introduction: 'Need another time period, an API integration, or information about usage terms? Prepare an inquiry describing what you need.',
    limitation: 'Availability, coverage, and terms require manual review. Preparing an email does not confirm access or guarantee a dataset.',
    prepareLabel: 'Prepare email',
    copyLabel: 'Copy inquiry',
    copyingLabel: 'Copying…',
    previewLabel: 'View the inquiry to copy manually',
    templateLabel: 'Full inquiry',
    nextStep: 'Fill in the fields in your email and review it before sending. If no email app opens, copy the inquiry.',
    copied: 'Inquiry copied. Paste it into your email, fill it in, and review it before sending.',
    copyFailed: 'Could not copy automatically. Select and copy the text below.',
    subject: 'Data inquiry - Bolivia Blue',
    toLabel: 'To',
    subjectLabel: 'Subject',
    body: 'Hello:\nI would like to ask about availability and terms for this project.\n\nTime period I need:\nFormat: CSV / JSON / API\nIntended use:\nProject or organization (optional):\n\nWhat coverage and access options might be available?'
  }
};

export function getDataInquiry(language = 'es') {
  const locale = language === 'en' ? 'en' : 'es';
  const copy = COPY[locale];
  return {
    ...copy,
    language: locale,
    email: DATA_INQUIRY_EMAIL,
    href: `/contacto${locale === 'en' ? '?lang=en' : ''}#data-request`,
    mailto: `mailto:${DATA_INQUIRY_EMAIL}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(copy.body)}`,
    fullText: `${copy.toLabel}: ${DATA_INQUIRY_EMAIL}\n${copy.subjectLabel}: ${copy.subject}\n\n${copy.body}`,
  };
}
