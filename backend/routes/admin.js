const express = require('express');
const router = express.Router();
const { getSubmissions, getStats } = require('../controllers/adminController');

router.get('/submissions', getSubmissions);
router.get('/stats', getStats);

module.exports = router;
