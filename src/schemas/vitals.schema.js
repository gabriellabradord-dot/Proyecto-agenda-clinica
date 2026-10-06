const { z } = require('zod');

const createVitalsSchema = z.object({
  citaId: z.string().uuid(),
  presion: z.string().optional(),
  peso: z.number().positive().optional(),
  talla: z.number().positive().optional(),
  temperatura: z.number().optional(),
  frecuenciaCardiaca: z.number().int().positive().optional(),
});

module.exports = { createVitalsSchema };
