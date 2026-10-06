const { z } = require('zod');

const medicamentoSchema = z.object({
  nombre: z.string().min(2),
  dosis: z.string(),
  frecuencia: z.string(),
  duracion: z.string(),
});

const createPrescriptionSchema = z.object({
  pacienteId: z.string().uuid(),
  recordId: z.string().uuid().optional(),
  medicamentos: z.array(medicamentoSchema).min(1),
  indicaciones: z.string().optional(),
});

module.exports = { createPrescriptionSchema };
