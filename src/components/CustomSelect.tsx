import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = "Seleccionar...", style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 'fit-content', minWidth: '160px', ...style }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          backgroundColor: 'var(--overlay-light)',
          color: 'var(--text-main)',
          border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border-color)'}`,
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '11px',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(0, 78, 187, 0.2)' : 'none'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--overlay-medium)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.1s'
                }}
              >
                {option.label}
                {isSelected && <Check size={14} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
