const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/appointments', require('./appointment.routes'));
router.use('/vitals', require('./vitals.routes'));
router.use('/records', require('./record.routes'));
router.use('/prescriptions', require('./prescription.routes'));
router.use('/medicines', require('./medicine.routes'));
router.use('/patients', require('./patient.routes'));
router.use('/billing', require('./billing.routes'));

module.exports = router;
