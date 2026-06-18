import React from 'react';

export const StudentFooter: React.FC = () => {


  return (
    <div className="admin-footer-card" style={{
      borderRadius: '24px',
      padding: '48px 64px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div className="admin-footer-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '40px',
        marginBottom: '48px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', fontFamily: 'var(--font-title)' }}>
            Instituto Peruano de Compliance
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6' }}>
            Te ayudaré a empezar a rentabilizar ahora.
          </p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '11px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>LEGAL</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0, margin: 0 }}>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Política de Privacidad</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Términos de Uso</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13.5px' }}>Libro de Reclamaciones</a></li>
          </ul>
        </div>

        <div style={{ textAlign: 'left' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '11px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>SÍGUEME</h4>

        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--overlay-light)',
        paddingTop: '28px',
        fontSize: '13px',
        color: 'var(--text-dim)',
        textAlign: 'left'
      }}>
        © 2022 - 2026 Instituto Peruano de Compliance. Todos los derechos reservados.
      </div>
    </div>
  );
};
