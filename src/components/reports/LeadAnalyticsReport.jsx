import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SoftCard from '@/components/ui/SoftCard';

const COLORS = ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#00b894', '#74b9ff', '#e17055', '#00cec9'];

export default function LeadAnalyticsReport({ leads }) {
  
  const analytics = useMemo(() => {
    // Horários preferidos
    const timePrefs = {};
    leads.forEach(lead => {
      if (lead.time_pref) {
        timePrefs[lead.time_pref] = (timePrefs[lead.time_pref] || 0) + 1;
      }
    });
    const timeData = Object.entries(timePrefs).map(([name, value]) => ({ name, value }));

    // Dias preferidos
    const dayPrefs = {};
    leads.forEach(lead => {
      if (lead.day_pref) {
        dayPrefs[lead.day_pref] = (dayPrefs[lead.day_pref] || 0) + 1;
      }
    });
    const dayData = Object.entries(dayPrefs).map(([name, value]) => ({ name, value }));

    // Produtos favoritos
    const productPrefs = {};
    leads.forEach(lead => {
      if (lead.fav_product) {
        productPrefs[lead.fav_product] = (productPrefs[lead.fav_product] || 0) + 1;
      }
    });
    const productData = Object.entries(productPrefs).map(([name, value]) => ({ name, value }));

    // Prêmios distribuídos
    const prizeDistribution = {};
    leads.forEach(lead => {
      if (lead.prize) {
        prizeDistribution[lead.prize] = (prizeDistribution[lead.prize] || 0) + 1;
      }
    });
    const prizeData = Object.entries(prizeDistribution).map(([name, value]) => ({ name, value }));

    return { timeData, dayData, productData, prizeData };
  }, [leads]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-[#2d3436]">{payload[0].name}</p>
          <p className="text-sm text-[#636e72]">{payload[0].value} cliente(s)</p>
        </div>
      );
    }
    return null;
  };

  if (leads.length === 0) {
    return (
      <SoftCard>
        <div className="text-center py-8">
          <i className="fas fa-chart-bar text-4xl text-[#636e72] mb-3"></i>
          <p className="text-[#636e72]">Não há dados suficientes para gerar o relatório</p>
        </div>
      </SoftCard>
    );
  }

  return (
    <SoftCard>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#2d3436] mb-2">
          <i className="fas fa-chart-line mr-2 text-[#6c5ce7]"></i>
          Relatório Analítico de Leads
        </h3>
        <p className="text-[#636e72] text-sm">Insights sobre preferências e comportamento dos clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horários Preferidos */}
        {analytics.timeData.length > 0 && (
          <div 
            className="rounded-[15px] p-5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5'
            }}
          >
            <h4 className="font-semibold text-[#2d3436] mb-4 flex items-center">
              <i className="fas fa-clock mr-2 text-[#6c5ce7]"></i>
              Horários Preferidos
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#636e72" />
                <YAxis tick={{ fontSize: 12 }} stroke="#636e72" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6c5ce7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dias Preferidos */}
        {analytics.dayData.length > 0 && (
          <div 
            className="rounded-[15px] p-5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5'
            }}
          >
            <h4 className="font-semibold text-[#2d3436] mb-4 flex items-center">
              <i className="fas fa-calendar-day mr-2 text-[#fd79a8]"></i>
              Dias da Semana Preferidos
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.dayData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.dayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Produtos Favoritos */}
        {analytics.productData.length > 0 && (
          <div 
            className="rounded-[15px] p-5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5'
            }}
          >
            <h4 className="font-semibold text-[#2d3436] mb-4 flex items-center">
              <i className="fas fa-heart mr-2 text-[#00b894]"></i>
              Produtos Favoritos
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#636e72" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#636e72" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#00b894" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Prêmios Distribuídos */}
        {analytics.prizeData.length > 0 && (
          <div 
            className="rounded-[15px] p-5"
            style={{
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
              background: '#eef2f5'
            }}
          >
            <h4 className="font-semibold text-[#2d3436] mb-4 flex items-center">
              <i className="fas fa-gift mr-2 text-[#fdcb6e]"></i>
              Prêmios Mais Distribuídos
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.prizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#636e72" />
                <YAxis tick={{ fontSize: 12 }} stroke="#636e72" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#fdcb6e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div 
          className="p-4 rounded-[15px] text-center"
          style={{
            boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
            background: '#eef2f5'
          }}
        >
          <i className="fas fa-users text-2xl text-[#6c5ce7] mb-2"></i>
          <div className="text-2xl font-bold text-[#2d3436]">{leads.length}</div>
          <div className="text-xs text-[#636e72]">Total de Leads</div>
        </div>

        <div 
          className="p-4 rounded-[15px] text-center"
          style={{
            boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
            background: '#eef2f5'
          }}
        >
          <i className="fas fa-check-circle text-2xl text-[#00b894] mb-2"></i>
          <div className="text-2xl font-bold text-[#2d3436]">
            {leads.filter(l => l.day_pref && l.time_pref && l.fav_product).length}
          </div>
          <div className="text-xs text-[#636e72]">Leads Completos</div>
        </div>

        <div 
          className="p-4 rounded-[15px] text-center"
          style={{
            boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
            background: '#eef2f5'
          }}
        >
          <i className="fas fa-percentage text-2xl text-[#fdcb6e] mb-2"></i>
          <div className="text-2xl font-bold text-[#2d3436]">
            {leads.length > 0 ? Math.round((leads.filter(l => l.day_pref && l.time_pref && l.fav_product).length / leads.length) * 100) : 0}%
          </div>
          <div className="text-xs text-[#636e72]">Taxa de Completude</div>
        </div>

        <div 
          className="p-4 rounded-[15px] text-center"
          style={{
            boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
            background: '#eef2f5'
          }}
        >
          <i className="fas fa-phone-alt text-2xl text-[#fd79a8] mb-2"></i>
          <div className="text-2xl font-bold text-[#2d3436]">
            {leads.filter(l => l.sent_by_admin).length}
          </div>
          <div className="text-xs text-[#636e72]">Leads Contatados</div>
        </div>
      </div>
    </SoftCard>
  );
}