import React from 'react';

const Input = ({ 
  type, 
  label, 
  value, 
  setValue, 
  placeholder, 
  required = false,
  error = null 
}) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{ 
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '10px',
          color: '#0F172A',
          letterSpacing: '-0.01em',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder || `Enter your ${label?.toLowerCase() || ''}`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: error ? '2px solid #DC2626' : '2px solid #E2E8F0',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.2s ease',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: '#0F172A',
          outline: 'none'
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = '#6B46C1';
            e.target.style.boxShadow = '0 0 0 3px rgba(107, 70, 193, 0.1)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.boxShadow = 'none';
          }
        }}
      />
      {error && (
        <p style={{ 
          fontSize: '13px', 
          color: '#DC2626', 
          marginTop: '6px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;