const router = require('express').Router();
const ctrl = require('../controllers/vitals.controller');
const { createVitalsSchema } = require('../schemas/vitals.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.post('/', authorize('AUXILIAR', 'ADMIN'), validate(createVitalsSchema), ctrl.createVitals);
router.get('/:citaId', authorize('ADMIN', 'MEDICO', 'AUXILIAR'), ctrl.getByCita);

module.exports = router;
