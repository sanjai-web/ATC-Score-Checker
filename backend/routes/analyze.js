const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResume } = require('../controllers/analyzeController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('resume'), analyzeResume);

module.exports = router;
