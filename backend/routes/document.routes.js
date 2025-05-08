const express = require('express');
const router = express.Router();
const { getDocument } = require('../controllers/document.controller');

router.get('/document/:id', getDocument);

module.exports = router;