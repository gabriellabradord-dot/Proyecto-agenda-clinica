const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function registerPatient(req, res, next) {
  try {
    const { email, password, nombre, cedula, telefono, direccion } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email ya registrado' });

    const cedulaExists = await prisma.profile.findUnique({ where: { cedula } });
    if (cedulaExists) return res.status(409).json({ message: 'Cédula ya registrada' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'PACIENTE',
        profile: { create: { nombre, cedula, telefono, direccion } },
      },
      include: { profile: true },
    });

    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
}

async function searchPatients(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const patients = await prisma.user.findMany({
      where: {
        role: 'PACIENTE',
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { profile: { nombre: { contains: q, mode: 'insensitive' } } },
          { profile: { cedula: { contains: q } } },
        ],
      },
      include: { profile: true },
      take: 20,
    });

    res.json(patients.map(({ password, ...p }) => p));
  } catch (err) {
    next(err);
  }
}

module.exports = { registerPatient, searchPatients };
