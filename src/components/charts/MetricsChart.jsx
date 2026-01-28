import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SoftCard from '../ui/SoftCard';

export default function MetricsChart({ data, title, type = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <SoftCard>
        <h3 className="font-semibold text-[#2d3436] mb-4">{title}</h3>
        <div className="text-center py-10 text-[#636e72]">
          Sem dados para exibir
        </div>
      </SoftCard>
    );
  }

  const Chart = type === 'bar' ? BarChart : type === 'area' ? AreaChart : LineChart;
  const ChartElement = type === 'bar' ? Bar : type === 'area' ? Area : Line;

  return (
    <SoftCard>
      <h3 className="font-semibold text-[#2d3436] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            stroke="#636e72"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#636e72"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#fff', 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          
          {type === 'area' ? (
            <>
              <Area type="monotone" dataKey="access" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.3} name="Acessos" />
              <Area type="monotone" dataKey="spins" stroke="#00b894" fill="#00b894" fillOpacity={0.3} name="Giros" />
              <Area type="monotone" dataKey="leads" stroke="#fdcb6e" fill="#fdcb6e" fillOpacity={0.3} name="Leads" />
            </>
          ) : type === 'bar' ? (
            <>
              <Bar dataKey="access" fill="#6c5ce7" name="Acessos" />
              <Bar dataKey="spins" fill="#00b894" name="Giros" />
              <Bar dataKey="leads" fill="#fdcb6e" name="Leads" />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="access" stroke="#6c5ce7" strokeWidth={2} name="Acessos" />
              <Line type="monotone" dataKey="spins" stroke="#00b894" strokeWidth={2} name="Giros" />
              <Line type="monotone" dataKey="leads" stroke="#fdcb6e" strokeWidth={2} name="Leads" />
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </SoftCard>
  );
}