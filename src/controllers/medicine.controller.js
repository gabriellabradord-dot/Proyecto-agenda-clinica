const prisma = require('../config/prisma');

async function listMedicines(req, res, next) {
  try {
    const meds = await prisma.medicine.findMany({ orderBy: { nombre: 'asc' } });
    res.json(meds);
  } catch (err) {
    next(err);
  }
}

async function createMedicine(req, res, next) {
  try {
    const { nombre, descripcion, stock, stockMinimo, fechaVencimiento } = req.body;
    const med = await prisma.medicine.create({
      data: {
        nombre,
        descripcion,
        stock,
        stockMinimo: stockMinimo ?? 5,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
      },
    });
    res.status(201).json(med);
  } catch (err) {
    next(err);
  }
}

async function updateMedicine(req, res, next) {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.fechaVencimiento) data.fechaVencimiento = new Date(data.fechaVencimiento);

    const med = await prisma.medicine.update({ where: { id }, data });
    res.json(med);
  } catch (err) {
    next(err);
  }
}

async function alerts(req, res, next) {
  try {
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);

    const meds = await prisma.medicine.findMany();
    const lowStock = meds.filter((m) => m.stock <= m.stockMinimo);
    const expiring = meds.filter(
      (m) => m.fechaVencimiento && m.fechaVencimiento <= in30 && m.fechaVencimiento >= now
    );
    const expired = meds.filter(
      (m) => m.fechaVencimiento && m.fechaVencimiento < now
    );

    res.json({ lowStock, expiring, expired });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMedicines, createMedicine, updateMedicine, alerts };
