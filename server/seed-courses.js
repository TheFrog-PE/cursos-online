import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding courses...');

  // 1. Certificación Oficial en OCPD: Protección de Datos Personales
  await prisma.course.create({
    data: {
      title: 'Certificación Oficial en OCPD: Protección de Datos Personales',
      description: 'Obtén tu certificación oficial como Oficial de Datos Personales con nuestro curso especializado en protección de datos personales.',
      price: 99.00,
      lessons: 9
    }
  });

  // 2. Especialista en Compliance
  await prisma.course.create({
    data: {
      title: 'Especialista en Compliance',
      description: 'Conviértete en Especialista en Compliance, uno de los roles más demandados en Perú y LATAM. Obtén doble certificación acreditada por IPC.',
      price: 120.00,
      lessons: 7
    }
  });

  console.log('✅ Cursos generados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
