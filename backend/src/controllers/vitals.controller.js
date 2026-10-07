const prisma = require('../config/prisma');

async function createVitals(req, res, next) {
  try {
    const { citaId, presion, peso, talla, temperatura, frecuenciaCardiaca } = req.body;

    const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    const existing = await prisma.vitals.findUnique({ where: { citaId } });
    if (existing) {
      return res.status(409).json({ message: 'Ya existen signos vitales para esta cita' });
    }

    const vitals = await prisma.vitals.create({
      data: {
        citaId,
        auxiliarId: req.user.id,
        presion,
        peso,
        talla,
        temperatura,
        frecuenciaCardiaca,
      },
    });

    res.status(201).json(vitals);
  } catch (err) {
    next(err);
  }
}

async function getByCita(req, res, next) {
  try {
    const { citaId } = req.params;
    const vitals = await prisma.vitals.findUnique({ where: { citaId } });
    if (!vitals) return res.status(404).json({ message: 'No registrados' });
    res.json(vitals);
  } catch (err) {
    next(err);
  }
}

module.exports = { createVitals, getByCita };
