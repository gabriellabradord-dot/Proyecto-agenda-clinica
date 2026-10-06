const { z } = require('zod');

const createMedicineSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  stock: z.number().int().nonnegative(),
  stockMinimo: z.number().int().nonnegative().optional(),
  fechaVencimiento: z.string().optional(),
});

const updateMedicineSchema = createMedicineSchema.partial();

module.exports = { createMedicineSchema, updateMedicineSchema };
