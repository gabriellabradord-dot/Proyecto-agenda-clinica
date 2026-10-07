const router = require('express').Router();
const ctrl = require('../controllers/record.controller');
const { createRecordSchema } = require('../schemas/record.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MEDICO', 'PACIENTE'), ctrl.listRecords);
router.get('/:id', authorize('ADMIN', 'MEDICO', 'PACIENTE'), ctrl.getRecord);
router.post('/', authorize('MEDICO'), validate(createRecordSchema), ctrl.createRecord);

module.exports = router;
