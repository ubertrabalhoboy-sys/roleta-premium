import React from 'react';

const variants = {
  default: {
    background: '#eef2f5',
    color: '#6c5ce7',
    boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff'
  },
  primary: {
    background: '#6c5ce7',
    color: 'white',
    boxShadow: '0 4px 10px rgba(108, 92, 231, 0.4)'
  },
  whatsapp: {
    background: '#25D366',
    color: 'white',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
  },
  export: {
    background: '#00cec9',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0, 206, 201, 0.4)'
  },
  danger: {
    background: '#eef2f5',
    color: '#d63031',
    boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff'
  },
  warning: {
    background: '#eef2f5',
    color: '#fdcb6e',
    boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff'
  }
};

export default function SoftButton({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false,
  style = {}
}) {
  const variantStyle = variants[variant] || variants.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-semibold cursor-pointer transition-all duration-200 inline-flex items-center gap-2 justify-center text-sm ${className}`}
      style={{
        ...variantStyle,
        border: 'none',
        ...style,
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {})
      }}
    >
      {children}
    </button>
  );
}