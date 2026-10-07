const crypto = require('crypto');
const prisma = require('../config/prisma');

async function createBill(req, res, next) {
  try {
    const { citaId, monto, metodoPago } = req.body;

    const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    const existing = await prisma.bill.findUnique({ where: { citaId } });
    if (existing) return res.status(409).json({ message: 'Esta cita ya tiene factura' });

    const comprobante = `FAC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const bill = await prisma.bill.create({
      data: {
        citaId,
        recepcionId: req.user.id,
        monto,
        metodoPago,
        comprobante,
      },
    });

    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
}

async function listBills(req, res, next) {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        cita: {
          include: {
            paciente: { select: { profile: true } },
            medico: { select: { profile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bills);
  } catch (err) {
    next(err);
  }
}

module.exports = { createBill, listBills };
