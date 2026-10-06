const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { updateUserSchema } = require('../schemas/user.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN'), ctrl.listUsers);
router.patch('/:id/toggle', authorize('ADMIN'), ctrl.toggleActive);
router.patch('/me', validate(updateUserSchema), ctrl.updateMyProfile);

module.exports = router;
