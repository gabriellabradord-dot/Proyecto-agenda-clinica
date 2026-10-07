const router = require('express').Router();
const { login, register, me } = require('../controllers/auth.controller');
const { loginSchema, registerSchema } = require('../schemas/auth.schema');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/login', validate(loginSchema), login);
router.post(
  '/register',
  authenticate,
  authorize('ADMIN', 'RECEPCION'),
  validate(registerSchema),
  register
);
router.get('/me', authenticate, me);

module.exports = router;
