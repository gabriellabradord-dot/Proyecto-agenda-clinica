const prisma = require('../config/prisma');

async function createPrescription(req, res, next) {
  try {
    const { pacienteId, recordId, medicamentos, indicaciones } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        medicoId: req.user.id,
        pacienteId,
        recordId,
        medicamentos,
        indicaciones,
      },
    });

    res.status(201).json(prescription);
  } catch (err) {
    next(err);
  }
}

async function listPrescriptions(req, res, next) {
  try {
    const { role, id } = req.user;
    const where = {};
    if (role === 'MEDICO') where.medicoId = id;
    if (role === 'PACIENTE') where.pacienteId = id;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        medico: { select: { id: true, email: true, profile: true } },
        paciente: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
}

async function listPending(req, res, next) {
  try {
    const pending = await prisma.prescription.findMany({
      where: { estadoDespacho: 'PENDIENTE' },
      include: {
        medico: { select: { id: true, profile: true } },
        paciente: { select: { id: true, profile: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pending);
  } catch (err) {
    next(err);
  }
}

async function dispense(req, res, next) {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe enviar items a despachar' });
    }

    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) return res.status(404).json({ message: 'Receta no encontrada' });
    if (prescription.estadoDespacho === 'DESPACHADA') {
      return res.status(409).json({ message: 'Receta ya despachada' });
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const med = await tx.medicine.findUnique({ where: { id: item.medicineId } });
        if (!med) {
          throw Object.assign(
            new Error(`Medicamento no encontrado: ${item.medicineId}`),
            { status: 404 }
          );
        }
        if (med.stock < item.cantidad) {
          throw Object.assign(
            new Error(`Stock insuficiente de ${med.nombre}`),
            { status: 400 }
          );
        }

        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.cantidad } },
        });

        await tx.dispensation.create({
          data: {
            prescriptionId: id,
            medicineId: item.medicineId,
            cantidad: item.cantidad,
            farmaceuticoId: req.user.id,
          },
        });
      }

      return tx.prescription.update({
        where: { id },
        data: { estadoDespacho: 'DESPACHADA' },
      });
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createPrescription, listPrescriptions, listPending, dispense };
