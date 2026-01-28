import React from 'react';
import SoftCard from '../ui/SoftCard';

export default function StatCard({ icon, value, label }) {
  return (
    <SoftCard className="flex items-center gap-4">
      <div 
        className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl text-[#6c5ce7]"
        style={{
          background: '#eef2f5',
          boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff'
        }}
      >
        <i className={icon}></i>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-[#2d3436]">{value}</h3>
        <span className="text-[#636e72]">{label}</span>
      </div>
    </SoftCard>
  );
}