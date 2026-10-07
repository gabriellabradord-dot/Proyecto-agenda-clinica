const router = require('express').Router();
const ctrl = require('../controllers/appointment.controller');
const { createAppointmentSchema, updateStatusSchema } = require('../schemas/appointment.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', ctrl.listAppointments);
router.post(
  '/',
  authorize('ADMIN', 'RECEPCION', 'PACIENTE'),
  validate(createAppointmentSchema),
  ctrl.createAppointment
);
router.patch(
  '/:id/status',
  authorize('ADMIN', 'RECEPCION', 'MEDICO', 'PACIENTE'),
  validate(updateStatusSchema),
  ctrl.updateStatus
);

module.exports = router;
