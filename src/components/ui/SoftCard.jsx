import React from 'react';

export default function SoftCard({ children, className = '' }) {
  return (
    <div 
      className={`rounded-[20px] p-6 mb-5 ${className}`}
      style={{
        background: '#eef2f5',
        boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        border: '1px solid rgba(255,255,255,0.4)'
      }}
    >
      {children}
    </div>
  );
}