import { prisma } from '../utils/prisma.js';

export const resetDemoDatabase = async () => {
  try {
    console.log('[DEMO CLEANUP] Iniciando limpieza de datos de demostración...');

    // 1. Borrar todos los ticket messages
    await prisma.ticketMessage.deleteMany({});

    // 2. Borrar todos los tickets
    await prisma.supportTicket.deleteMany({});

    // 3. Borrar todos los pagos
    await prisma.payment.deleteMany({});

    // 4. Borrar todos los cursos no predefinidos
    await prisma.course.deleteMany({
      where: {
        title: {
          notIn: [
            'Especialista en Compliance',
            'Hacker Financiero',
            'ODPC',
            'Oficial de Datos Personales',
            'Certificación Oficial en OCPD: Protección de Datos Personales'
          ]
        }
      }
    });

    // 5. Borrar todos los usuarios no predefinidos
    await prisma.user.deleteMany({
      where: {
        email: {
          notIn: [
            'admin@demo.ipdcompliance',
            'editor@demo.ipdcompliance',
            'student@demo.ipdcompliance',
            'admin@ipdcompliance.com',
            'editor@ipdcompliance.com',
            'estudiante@ipdcompliance.com',
            'student@ipdcompliance.com'
          ]
        }
      }
    });

    console.log(`✓ Datos de demo limpiados - [${new Date().toISOString()}]`);
  } catch (err) {
    console.error('[DEMO CLEANUP ERROR] Error al limpiar los datos de demo:', err);
    throw err;
  }
};

export const startDemoCleanupJob = () => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  if (!isDemo) return;

  const SIX_HOURS = 6 * 60 * 60 * 1000;

  // Programar el intervalo
  setInterval(resetDemoDatabase, SIX_HOURS);
  console.log('[DEMO CLEANUP] Job de limpieza programado cada 6 horas.');
  
  // Ejecutar una limpieza inicial para mantener el estado de demo consistente al encender
  resetDemoDatabase();
};
