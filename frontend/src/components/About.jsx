function About() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Acerca de Bolivia Blue con Paz
      </h2>
      
      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Metodología</h3>
          <p className="text-sm leading-relaxed mb-3">
            Este sitio rastrea dos tipos de cambio en Bolivia:
          </p>
          <ul className="text-sm space-y-2 ml-4">
            <li><strong>Mercado Paralelo (Dólar Blue):</strong> Datos de ofertas públicas de Binance P2P 
            para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener 
            una estimación representativa del mercado informal.</li>
            <li><strong>Tipo de Cambio Oficial:</strong> Tasa controlada por el Banco Central de Bolivia 
            (BCB), utilizada por bancos y casas de cambio autorizadas. Esta tasa es típicamente fija 
            o se ajusta con muy poca frecuencia.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fuentes de datos</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Dólar Blue: Binance P2P API (USDT/BOB)</li>
            <li>Tipo de Cambio Oficial: Banco Central de Bolivia / APIs de mercado</li>
            <li>Noticias: Medios bolivianos verificados (El Deber, Página Siete, La Razón, etc.)</li>
            <li>Frecuencia de actualización: cada 15 minutos</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advertencias importantes</h3>
          <p className="text-sm leading-relaxed bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3">
            <strong>El dólar blue refleja el mercado informal.</strong> Los tipos de cambio del mercado 
            paralelo pueden variar significativamente del tipo de cambio oficial del Banco Central de Bolivia. 
            La diferencia (spread) entre ambos indica la presión del mercado y puede reflejar escasez de 
            divisas, expectativas de devaluación, o restricciones cambiarias. Use esta información únicamente 
            como referencia. No nos hacemos responsables de decisiones financieras tomadas con base en estos datos.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transparencia</h3>
          <p className="text-sm leading-relaxed">
            Este es un proyecto de código abierto creado para proporcionar visibilidad sobre el mercado 
            cambiario boliviano durante la presidencia de Rodrigo Paz. El código fuente está disponible 
            públicamente para revisión y auditoría.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última actualización del sistema: Noviembre 2025
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;

