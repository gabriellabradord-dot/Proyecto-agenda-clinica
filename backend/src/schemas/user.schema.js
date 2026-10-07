const { z } = require('zod');

const updateUserSchema = z.object({
  nombre: z.string().min(2).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

module.exports = { updateUserSchema };
