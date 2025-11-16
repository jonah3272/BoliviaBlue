import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

function Contact() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    // TODO: Replace with your actual form endpoint (Formspree, EmailJS, or backend API)
    // For now, this simulates a successful submission
    // To use Formspree: 
    // 1. Sign up at https://formspree.io
    // 2. Get your form ID
    // 3. Uncomment the fetch code below and replace YOUR_FORM_ID
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Uncomment when you have a form endpoint:
      // const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // if (response.ok) {
      //   setStatus('success');
      //   setFormData({ name: '', email: '', subject: '', message: '' });
      // } else {
      //   setStatus('error');
      // }
      
      // For now, show success (replace with actual API call above)
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Log form data for now (remove in production)
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' ? 'Contacto - Bolivia Blue con Paz' : 'Contact - Bolivia Blue with Paz'}
        description={language === 'es'
          ? "Contáctanos para preguntas, sugerencias o reportar problemas. Estamos aquí para ayudarte con todo lo relacionado al bolivia blue rate."
          : "Contact us for questions, suggestions, or to report issues. We're here to help with everything related to bolivia blue rate."}
        keywords={language === 'es'
          ? "contacto bolivia blue, soporte bolivia blue rate, ayuda tipo cambio bolivia"
          : "contact bolivia blue, support bolivia blue rate, help exchange rate bolivia"}
        canonical="/contact"
      />

      {/* Header */}
      <Header />

      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Contacto' : 'Contact', url: '/contact' }
          ]}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Contacto' : 'Contact Us'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {language === 'es'
              ? '¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte.'
              : 'Have questions, suggestions, or need help? We\'re here to help you.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es' ? 'Nombre' : 'Name'}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es' ? 'Email' : 'Email'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es' ? 'Asunto' : 'Subject'}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'es' ? 'Mensaje' : 'Message'}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {status === 'success' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  {language === 'es' ? '¡Mensaje enviado con éxito! Te responderemos pronto.' : 'Message sent successfully! We\'ll get back to you soon.'}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">
                  {language === 'es' ? 'Error al enviar el mensaje. Por favor, intenta de nuevo.' : 'Error sending message. Please try again.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending'
                ? (language === 'es' ? 'Enviando...' : 'Sending...')
                : (language === 'es' ? 'Enviar Mensaje' : 'Send Message')}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Otras Formas de Contacto' : 'Other Ways to Contact'}
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;

