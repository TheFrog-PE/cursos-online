import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding specific users...');
  
  const password = await bcrypt.hash('123456', 10);

  // 1. Administrador
  await prisma.user.upsert({
    where: { email: 'admin@ipdcompliance.com' },
    update: { password, name: 'Admin Principal' },
    create: {
      email: 'admin@ipdcompliance.com',
      name: 'Admin Principal',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Editor
  await prisma.user.upsert({
    where: { email: 'editor@ipdcompliance.com' },
    update: { password, name: 'Editor de Contenido' },
    create: {
      email: 'editor@ipdcompliance.com',
      name: 'Editor de Contenido',
      password,
      role: 'EDITOR',
    },
  });

  // 3. Estudiante
  await prisma.user.upsert({
    where: { email: 'estudiante@ipdcompliance.com' },
    update: { password, name: 'Estudiante Prueba' },
    create: {
      email: 'estudiante@ipdcompliance.com',
      name: 'Estudiante Prueba',
      password,
      role: 'STUDENT',
    },
  });

  console.log('✅ Usuarios generados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
