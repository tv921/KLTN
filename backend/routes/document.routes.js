const express = require('express');
const router = express.Router();
const { getDocument } = require('../controllers/document1.controller');

router.get('/document/:id', getDocument);

module.exports = router;