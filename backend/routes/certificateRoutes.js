const router = require('express').Router();
const {
  generateCertificate,
  verifyCertificate,
  getCertificateData  // Make sure this is imported
} = require('../controllers/certificateController');

router.post('/generate', generateCertificate);
router.get('/verify/:id', verifyCertificate);
router.post('/data', getCertificateData);  // This route must exist

module.exports = router;