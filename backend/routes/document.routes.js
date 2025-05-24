const express = require('express');
const router = express.Router();
const { getDocument } = require('../controllers/document.controller');
const  uploadDocument  = require('../controllers/uploadDocument.controller');  // Đảm bảo đã import đúng

router.get('/document/:id', getDocument);
router.post('/upload', uploadDocument); // Đăng ký route upload

module.exports = router;
