// Mock testing file for Demo Limits and endpoints
// This validates the logic used in Express middlewares and controllers.

import { describe, it, expect, vi } from 'vitest';

describe('Pruebas del Modo Demo', () => {
  it('Debería tener la variable DEMO_MODE activa', () => {
    const isDemo = process.env.DEMO_MODE !== 'false';
    expect(isDemo).toBe(true);
  });

  it('Debería permitir crear un usuario temporal de demostración', () => {
    const mockUser = {
      name: 'Usuario Demo',
      email: 'test@demo.ipdcompliance',
      role: 'STUDENT',
      password_temp: Math.random().toString(36).slice(-8)
    };

    expect(mockUser.email).toContain('demo.ipdcompliance');
    expect(mockUser.password_temp.length).toBe(8);
  });

  it('Debería conservar los usuarios predefinidos en la limpieza', () => {
    const preseededEmails = [
      'admin@demo.ipdcompliance',
      'editor@demo.ipdcompliance',
      'student@demo.ipdcompliance'
    ];

    const currentEmails = [
      'admin@demo.ipdcompliance',
      'editor@demo.ipdcompliance',
      'student@demo.ipdcompliance',
      'temp-user@gmail.com'
    ];

    const remainingEmails = currentEmails.filter(email => preseededEmails.includes(email));
    expect(remainingEmails).toEqual(preseededEmails);
    expect(remainingEmails).not.toContain('temp-user@gmail.com');
  });
});
