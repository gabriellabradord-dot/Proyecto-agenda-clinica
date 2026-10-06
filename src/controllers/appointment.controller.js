const prisma = require('../config/prisma');

async function listAppointments(req, res, next) {
  try {
    const { role, id } = req.user;
    const { fecha, estado } = req.query;

    const where = {};
    if (role === 'MEDICO') where.medicoId = id;
    if (role === 'PACIENTE') where.pacienteId = id;
    if (estado) where.estado = estado;
    if (fecha) {
      const start = new Date(fecha);
      const end = new Date(fecha);
      end.setDate(end.getDate() + 1);
      where.fecha = { gte: start, lt: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        paciente: { select: { id: true, email: true, profile: true } },
        medico: { select: { id: true, email: true, profile: true } },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

async function createAppointment(req, res, next) {
  try {
    const { pacienteId, medicoId, fecha, hora, motivo } = req.body;

    const medico = await prisma.user.findUnique({ where: { id: medicoId } });
    if (!medico || medico.role !== 'MEDICO') {
      return res.status(400).json({ message: 'Médico inválido' });
    }

    const paciente = await prisma.user.findUnique({ where: { id: pacienteId } });
    if (!paciente || paciente.role !== 'PACIENTE') {
      return res.status(400).json({ message: 'Paciente inválido' });
    }

    if (req.user.role === 'PACIENTE' && req.user.id !== pacienteId) {
      return res.status(403).json({ message: 'Solo puede agendar sus propias citas' });
    }

    const choque = await prisma.appointment.findFirst({
      where: {
        medicoId,
        fecha: new Date(fecha),
        hora,
        estado: { not: 'CANCELADA' },
      },
    });
    if (choque) {
      return res.status(409).json({ message: 'El médico ya tiene una cita en ese horario' });
    }

    const appointment = await prisma.appointment.create({
      data: { pacienteId, medicoId, fecha: new Date(fecha), hora, motivo },
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

    if (req.user.role === 'PACIENTE') {
      if (appointment.pacienteId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      if (estado !== 'CANCELADA') {
        return res.status(403).json({ message: 'Paciente solo puede cancelar' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { estado },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAppointments, createAppointment, updateStatus };
