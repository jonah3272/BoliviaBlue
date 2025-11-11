import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchBlueHistory } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function BlueChart() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  const [range, setRange] = useState('1D');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAge, setDataAge] = useState(0);
  const [stats, setStats] = useState({ latestBuy: 0, latestSell: 0, change: 0 });
  
  // Define TIME_RANGES using useMemo to ensure t() is available
  const TIME_RANGES = useMemo(() => {
    if (!t || typeof t !== 'function') {
      // Return default English labels as fallback
      return [
        { value: '1D', label: '1 Day', minDays: 0 },
        { value: '1W', label: '1 Week', minDays: 7 },
        { value: '1M', label: '1 Month', minDays: 30 },
        { value: '1Y', label: '1 Year', minDays: 365 },
        { value: 'ALL', label: 'All', minDays: 0 }
      ];
    }
    try {
      return [
        { value: '1D', label: t('timeRanges.1D'), minDays: 0 },
        { value: '1W', label: t('timeRanges.1W'), minDays: 7 },
        { value: '1M', label: t('timeRanges.1M'), minDays: 30 },
        { value: '1Y', label: t('timeRanges.1Y'), minDays: 365 },
        { value: 'ALL', label: t('timeRanges.ALL'), minDays: 0 }
      ];
    } catch (err) {
      console.error('Error in TIME_RANGES translation:', err);
      return [
        { value: '1D', label: '1 Day', minDays: 0 },
        { value: '1W', label: '1 Week', minDays: 7 },
        { value: '1M', label: '1 Month', minDays: 30 },
        { value: '1Y', label: '1 Year', minDays: 365 },
        { value: 'ALL', label: 'All', minDays: 0 }
      ];
    }
  }, [t]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBlueHistory(range);
        
        // Calculate data age
        if (result.points.length > 0) {
          const firstPoint = new Date(result.points[0].t);
          const lastPoint = result.points[result.points.length - 1];
          const now = new Date();
          const ageInDays = Math.floor((now - firstPoint) / (1000 * 60 * 60 * 24));
          setDataAge(ageInDays);
          
          // Calculate stats
          const firstBuy = result.points[0].buy;
          const latestBuy = lastPoint.buy;
          const change = ((latestBuy - firstBuy) / firstBuy * 100).toFixed(2);
          
          setStats({
            latestBuy: latestBuy,
            latestSell: lastPoint.sell,
            change: parseFloat(change)
          });
        }
        
        // Transform data with better formatting
        const chartData = result.points.map((point, index) => {
          const date = new Date(point.t);
          let timeLabel = '';
          
          if (range === '1D') {
            timeLabel = date.toLocaleTimeString(language === 'es' ? 'es-BO' : 'en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else if (range === '1W' || range === '1M') {
            timeLabel = date.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          } else {
            timeLabel = date.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { 
              month: 'short', 
              year: '2-digit' 
            });
          }
          
          return {
            time: timeLabel,
            fullTime: date.toLocaleString(language === 'es' ? 'es-BO' : 'en-US'),
            blue_buy: point.buy,
            blue_sell: point.sell,
            blue_mid: point.mid,
            index
          };
        });
        
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [range, language]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const buyValue = data.blue_buy;
      const sellValue = data.blue_sell;
      const spread = buyValue && sellValue ? ((buyValue - sellValue) / sellValue * 100).toFixed(2) : 0;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">{data.fullTime}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'es' ? 'Compra' : 'Buy'}
                </span>
              </div>
              <span className="text-lg font-bold font-mono text-green-600 dark:text-green-400">
                {buyValue ? buyValue.toFixed(2) : 'N/A'} Bs
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('chartSell')}
                </span>
              </div>
              <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">
                {sellValue ? sellValue.toFixed(2) : 'N/A'} Bs
              </span>
            </div>
            {buyValue && sellValue && (
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('spread')}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {spread}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('historicalPriceChart')}
          </h2>
          {stats.latestBuy > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                {stats.latestBuy.toFixed(2)} Bs
              </span>
              <span className={`flex items-center gap-1 font-medium ${
                stats.change >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {stats.change >= 0 ? '↗' : '↘'}
                {Math.abs(stats.change).toFixed(2)}%
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({range})
                </span>
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map(({ value, label, minDays }) => {
            const isDisabled = minDays > 0 && dataAge < minDays;
            return (
              <button
                key={value}
                onClick={() => !isDisabled && setRange(value)}
                disabled={isDisabled}
                title={isDisabled ? `Disponible después de ${minDays} días de datos` : ''}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                  range === value
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : isDisabled
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer shadow-sm'
                }`}
              >
                {label}
                {isDisabled && <span className="ml-1 text-xs">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Cargando datos...</div>
        </div>
      )}

      {error && (
        <div className="h-80 flex items-center justify-center">
          <div className="text-red-500">Error al cargar el gráfico</div>
        </div>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Recopilando datos históricos...
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              El sistema actualiza cada 15 minutos. Los datos históricos se acumularán con el tiempo.
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && data.length > 0 && data.length < 5 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <span className="text-blue-700 dark:text-blue-300">
            📊 Datos recientes: {data.length} punto{data.length > 1 ? 's' : ''}. 
            El gráfico mejorará a medida que se acumulen más datos cada 15 minutos.
          </span>
        </div>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div className="relative">
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Compra' : 'Buy'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('chartSell')}
              </span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.2" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                className="dark:stroke-gray-700" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Inter' }}
                stroke="#D1D5DB"
                tickLine={false}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Space Mono' }}
                stroke="#D1D5DB"
                tickLine={false}
                axisLine={{ strokeWidth: 2 }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="blue_buy" 
                stroke="#10B981" 
                strokeWidth={3}
                fill="url(#colorBuy)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#10B981' }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Area 
                type="monotone" 
                dataKey="blue_sell" 
                stroke="#EF4444" 
                strokeWidth={3}
                fill="url(#colorSell)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#EF4444' }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BlueChart;

