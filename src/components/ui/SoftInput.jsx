import React from 'react';

export default function SoftInput({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-3.5 rounded-xl outline-none mb-4 text-[0.95rem] ${className}`}
      style={{
        background: '#eef2f5',
        border: 'none',
        boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        color: '#2d3436',
        ...style
      }}
      {...props}
    />
  );
}