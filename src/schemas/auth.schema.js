const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MEDICO', 'AUXILIAR', 'PACIENTE', 'RECEPCION', 'FARMACIA']),
  nombre: z.string().min(2),
  cedula: z.string().min(5),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

module.exports = { loginSchema, registerSchema };
