const router = require('express').Router();
const ctrl = require('../controllers/patient.controller');
const { registerSchema } = require('../schemas/auth.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.post(
  '/register',
  authorize('RECEPCION', 'ADMIN'),
  validate(registerSchema),
  ctrl.registerPatient
);
router.get('/search', authorize('RECEPCION', 'ADMIN', 'MEDICO', 'AUXILIAR'), ctrl.searchPatients);

module.exports = router;
