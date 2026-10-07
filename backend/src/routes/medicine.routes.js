const router = require('express').Router();
const ctrl = require('../controllers/medicine.controller');
const { createMedicineSchema, updateMedicineSchema } = require('../schemas/medicine.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'FARMACIA', 'MEDICO'), ctrl.listMedicines);
router.get('/alerts', authorize('ADMIN', 'FARMACIA'), ctrl.alerts);
router.post('/', authorize('ADMIN', 'FARMACIA'), validate(createMedicineSchema), ctrl.createMedicine);
router.patch('/:id', authorize('ADMIN', 'FARMACIA'), validate(updateMedicineSchema), ctrl.updateMedicine);

module.exports = router;
