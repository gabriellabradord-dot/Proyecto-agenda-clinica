const router = require('express').Router();
const ctrl = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'RECEPCION'), ctrl.listBills);
router.post('/', authorize('ADMIN', 'RECEPCION'), ctrl.createBill);

module.exports = router;
