const { z } = require('zod');

const createRecordSchema = z.object({
  pacienteId: z.string().uuid(),
  citaId: z.string().uuid().optional(),
  diagnostico: z.string().min(3),
  tratamiento: z.string().optional(),
  observaciones: z.string().optional(),
});

module.exports = { createRecordSchema };
