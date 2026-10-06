const { z } = require('zod');

const createAppointmentSchema = z.object({
  pacienteId: z.string().uuid(),
  medicoId: z.string().uuid(),
  fecha: z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  motivo: z.string().optional(),
});

const updateStatusSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA']),
});

module.exports = { createAppointmentSchema, updateStatusSchema };
