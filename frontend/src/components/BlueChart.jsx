import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchBlueHistory } from '../utils/api';

const TIME_RANGES = [
  { value: '1D', label: '1D', minDays: 0 },
  { value: '1W', label: '1W', minDays: 7 },
  { value: '1M', label: '1M', minDays: 30 },
  { value: '1Y', label: '1Y', minDays: 365 },
  { value: 'ALL', label: 'Todo', minDays: 0 }
];

function BlueChart() {
  const [range, setRange] = useState('1D');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAge, setDataAge] = useState(0); // Days of data available

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBlueHistory(range);
        
        // Calculate data age (days since first data point)
        if (result.points.length > 0) {
          const firstPoint = new Date(result.points[0].t);
          const now = new Date();
          const ageInDays = Math.floor((now - firstPoint) / (1000 * 60 * 60 * 24));
          setDataAge(ageInDays);
        }
        
        // Transform data for Recharts
        const chartData = result.points.map(point => ({
          time: new Date(point.t).toLocaleDateString('es-BO', { 
            month: 'short', 
            day: 'numeric',
            hour: range === '1D' ? '2-digit' : undefined,
            minute: range === '1D' ? '2-digit' : undefined
          }),
          blue_buy: point.buy,
          blue_sell: point.sell,
          blue_mid: point.mid,
          official_buy: point.official_buy,
          official_sell: point.official_sell,
          official_mid: point.official_mid
        }));
        
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
  }, [range]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.time}</p>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mercado Paralelo:</p>
            {payload.filter(e => e.dataKey.startsWith('blue')).map((entry, index) => (
              <p key={index} className="text-xs ml-2" style={{ color: entry.color }}>
                {entry.name}: {entry.value ? entry.value.toFixed(2) : 'N/A'} Bs.
              </p>
            ))}
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">Oficial:</p>
            {payload.filter(e => e.dataKey.startsWith('official')).map((entry, index) => (
              <p key={index} className="text-xs ml-2" style={{ color: entry.color }}>
                {entry.name}: {entry.value ? entry.value.toFixed(2) : 'N/A'} Bs.
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gráfico de precios histórico
        </h2>
        
        <div className="flex gap-2">
          {TIME_RANGES.map(({ value, label, minDays }) => {
            const isDisabled = minDays > 0 && dataAge < minDays;
            return (
              <button
                key={value}
                onClick={() => !isDisabled && setRange(value)}
                disabled={isDisabled}
                title={isDisabled ? `Disponible después de ${minDays} días de datos` : ''}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range === value
                    ? 'bg-blue-500 text-white'
                    : isDisabled
                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Space Mono' }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Space Mono' }}
              stroke="#9CA3AF"
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="blue_buy" 
              name="Blue Compra"
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="blue_sell" 
              name="Blue Venta"
              stroke="#EF4444" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="official_buy" 
              name="Oficial Compra"
              stroke="#6B7280" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="official_sell" 
              name="Oficial Venta"
              stroke="#9CA3AF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BlueChart;

