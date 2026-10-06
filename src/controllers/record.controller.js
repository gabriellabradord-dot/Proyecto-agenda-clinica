const prisma = require('../config/prisma');

async function createRecord(req, res, next) {
  try {
    const { pacienteId, citaId, diagnostico, tratamiento, observaciones } = req.body;

    if (citaId) {
      const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
      if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        pacienteId,
        medicoId: req.user.id,
        citaId,
        diagnostico,
        tratamiento,
        observaciones,
      },
    });

    if (citaId) {
      await prisma.appointment.update({
        where: { id: citaId },
        data: { estado: 'COMPLETADA' },
      });
    }

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function listRecords(req, res, next) {
  try {
    const { role, id } = req.user;
    const where = {};
    if (role === 'MEDICO') where.medicoId = id;
    if (role === 'PACIENTE') where.pacienteId = id;

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        paciente: { select: { id: true, email: true, profile: true } },
        medico: { select: { id: true, email: true, profile: true } },
        prescriptions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function getRecord(req, res, next) {
  try {
    const { id } = req.params;
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, email: true, profile: true } },
        medico: { select: { id: true, email: true, profile: true } },
        prescriptions: true,
        cita: { include: { vitals: true } },
      },
    });

    if (!record) return res.status(404).json({ message: 'Historia no encontrada' });

    if (req.user.role === 'PACIENTE' && record.pacienteId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
}

module.exports = { createRecord, listRecords, getRecord };
