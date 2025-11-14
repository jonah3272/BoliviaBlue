import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchBlueRate } from '../utils/api';

function ShareRate({ compact = false }) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [currentRate, setCurrentRate] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data && data.buy && data.sell) {
          setCurrentRate(data);
        }
      } catch (error) {
        console.error('Error loading rate for sharing:', error);
      }
    };
    loadRate();
    // Update every 15 minutes
    const interval = setInterval(loadRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getShareUrl = () => {
    return typeof window !== 'undefined' 
      ? window.location.href.replace(/^https?:\/\/(www\.)?/, 'https://')
      : 'https://boliviablue.com';
  };

  const getShareText = () => {
    if (!currentRate) {
      return language === 'es'
        ? 'Bolivia Blue Rate - Tipo de Cambio en Tiempo Real'
        : 'Bolivia Blue Rate - Real-Time Exchange Rate';
    }
    
    const buyRate = currentRate.buy?.toFixed(2) || 'N/A';
    const sellRate = currentRate.sell?.toFixed(2) || 'N/A';
    
    return language === 'es'
      ? `💰 Bolivia Blue Rate: Compra ${buyRate} BOB | Venta ${sellRate} BOB - Actualizado en tiempo real`
      : `💰 Bolivia Blue Rate: Buy ${buyRate} BOB | Sell ${sellRate} BOB - Updated in real-time`;
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        const fullText = `${text} ${url}`;
        navigator.clipboard.writeText(fullText).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare('copy')}
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          title={language === 'es' ? 'Copiar tasa' : 'Copy rate'}
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          title={language === 'es' ? 'Compartir en WhatsApp' : 'Share on WhatsApp'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {language === 'es' ? 'Compartir Tasa Actual' : 'Share Current Rate'}
          </h3>
          {currentRate && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {language === 'es' 
                ? `Compra: ${currentRate.buy?.toFixed(2)} BOB | Venta: ${currentRate.sell?.toFixed(2)} BOB`
                : `Buy: ${currentRate.buy?.toFixed(2)} BOB | Sell: ${currentRate.sell?.toFixed(2)} BOB`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShare('copy')}
            className={`p-2 rounded-lg transition-colors ${
              copied
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={language === 'es' ? 'Copiar' : 'Copy'}
          >
            {copied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title={language === 'es' ? 'Compartir en Twitter' : 'Share on Twitter'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title={language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            title={language === 'es' ? 'Compartir en WhatsApp' : 'Share on WhatsApp'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareRate;

