const prisma = require('../config/prisma');

async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map(({ password, ...u }) => u));
  } catch (err) {
    next(err);
  }
}

async function toggleActive(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const updated = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
    });
    res.json({ id: updated.id, active: updated.active });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const { nombre, telefono, direccion } = req.body;
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { nombre, telefono, direccion },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, toggleActive, updateMyProfile };
