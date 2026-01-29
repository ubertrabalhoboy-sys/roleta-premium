import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SoftCard from '../ui/SoftCard';

export default function ConversionChart({ data, type = 'line' }) {
  const hasData = data && data.length > 0 && data.some(d => d.conversion_rate > 0);
  
  if (!hasData) {
    return (
      <SoftCard>
        <h3 className="font-semibold text-[#2d3436] mb-4">Taxa de Conversão</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <i className="fas fa-percentage text-4xl text-[#636e72] opacity-30 mb-3"></i>
          <p className="text-[#636e72] font-semibold">Sem dados de conversão</p>
          <p className="text-[#636e72] text-sm mt-1">A taxa aparecerá quando houver acessos e leads</p>
        </div>
      </SoftCard>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;
  const SeriesComponent = type === 'area' ? Area : type === 'bar' ? Bar : Line;

  return (
    <SoftCard>
      <h3 className="font-semibold text-[#2d3436] mb-4">Taxa de Conversão (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            stroke="#636e72"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#636e72"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#fff', 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => `${value.toFixed(1)}%`}
          />
          <SeriesComponent 
            type="monotone" 
            dataKey="conversion_rate" 
            stroke="#e17055"
            fill={type === 'area' ? 'url(#colorConversion)' : '#e17055'}
            strokeWidth={3}
            name="Conversão"
            dot={type !== 'bar' ? { fill: '#e17055', r: 4 } : undefined}
          />
          {type === 'area' && (
            <defs>
              <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e17055" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e17055" stopOpacity={0}/>
              </linearGradient>
            </defs>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </SoftCard>
  );
}