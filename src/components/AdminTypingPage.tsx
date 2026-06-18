import React from 'react';
import { Keyboard } from 'lucide-react';

export const AdminTypingPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: 'rgba(0, 78, 187, )', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <Keyboard size={40} color="var(--primary)" />
      </div>
      <h1 style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--text-main)', margin: '0 0 16px 0', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        Mecanografía
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '400px', lineHeight: 1.6 }}>
        El módulo de práctica y evaluación de mecanografía está actualmente en desarrollo. Pronto podrás medir y mejorar tu velocidad de escritura aquí.
      </p>
    </div>
  );
};
