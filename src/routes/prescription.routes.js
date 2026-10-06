const router = require('express').Router();
const ctrl = require('../controllers/prescription.controller');
const { createPrescriptionSchema } = require('../schemas/prescription.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MEDICO', 'PACIENTE'), ctrl.listPrescriptions);
router.get('/pending', authorize('FARMACIA', 'ADMIN'), ctrl.listPending);
router.post('/', authorize('MEDICO'), validate(createPrescriptionSchema), ctrl.createPrescription);
router.patch('/:id/dispense', authorize('FARMACIA', 'ADMIN'), ctrl.dispense);

module.exports = router;
