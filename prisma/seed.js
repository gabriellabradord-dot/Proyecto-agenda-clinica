const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertUser({ email, password, role, nombre, cedula, telefono, direccion }) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hash,
      role,
      profile: {
        create: { nombre, cedula, telefono, direccion },
      },
    },
  });
}

async function main() {
  console.log('🌱 Sembrando datos...');

  await upsertUser({
    email: 'admin@clinica.com',
    password: 'admin123',
    role: 'ADMIN',
    nombre: 'Admin Principal',
    cedula: '0000000001',
  });

  await upsertUser({
    email: 'medico@clinica.com',
    password: 'medico123',
    role: 'MEDICO',
    nombre: 'Dr. Juan Pérez',
    cedula: '0000000002',
    telefono: '3001234567',
  });

  await upsertUser({
    email: 'auxiliar@clinica.com',
    password: 'aux123',
    role: 'AUXILIAR',
    nombre: 'Ana Auxiliar',
    cedula: '0000000003',
  });

  await upsertUser({
    email: 'recepcion@clinica.com',
    password: 'recep123',
    role: 'RECEPCION',
    nombre: 'Carla Recepción',
    cedula: '0000000004',
  });

  await upsertUser({
    email: 'farmacia@clinica.com',
    password: 'farm123',
    role: 'FARMACIA',
    nombre: 'Farma Farmacia',
    cedula: '0000000005',
  });

  await upsertUser({
    email: 'paciente@clinica.com',
    password: 'paciente123',
    role: 'PACIENTE',
    nombre: 'Pedro Paciente',
    cedula: '0000000006',
    telefono: '3009998877',
    direccion: 'Calle 123 #45-67',
  });

  // Medicamentos de ejemplo
  const meds = [
    { nombre: 'Paracetamol 500mg', stock: 100, stockMinimo: 10 },
    { nombre: 'Ibuprofeno 400mg', stock: 80, stockMinimo: 10 },
    { nombre: 'Amoxicilina 500mg', stock: 50, stockMinimo: 5 },
    { nombre: 'Omeprazol 20mg', stock: 60, stockMinimo: 10 },
  ];

  for (const m of meds) {
    await prisma.medicine.upsert({
      where: { nombre: m.nombre },
      update: {},
      create: m,
    });
  }

  console.log('✅ Seed completo');
  console.log('👤 admin@clinica.com / admin123');
  console.log('👨‍⚕️ medico@clinica.com / medico123');
  console.log('🩺 auxiliar@clinica.com / aux123');
  console.log('💼 recepcion@clinica.com / recep123');
  console.log('💊 farmacia@clinica.com / farm123');
  console.log('🧑 paciente@clinica.com / paciente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
