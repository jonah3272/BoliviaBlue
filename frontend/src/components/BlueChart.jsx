import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchBlueHistory } from '../utils/api';

const TIME_RANGES = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '1Y', label: '1Y' },
  { value: 'ALL', label: 'Todo' }
];

function BlueChart() {
  const [range, setRange] = useState('1W');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBlueHistory(range);
        
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
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
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
          <div className="text-gray-500 dark:text-gray-400">No hay datos disponibles</div>
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

