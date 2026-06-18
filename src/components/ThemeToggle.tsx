import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button 
      onClick={toggleTheme} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '12px 16px', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        color: 'var(--text-muted)', 
        borderRadius: '8px', 
        cursor: 'pointer',
        width: '100%', 
        fontSize: '13px', 
        fontWeight: 500,
        transition: 'all 0.2s',
        marginTop: '12px'
      }} 
      className="hover-nav"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
    </button>
  );
};
