const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/search', searchController.searchDocuments);
router.post('/documents', searchController.addDocument);

module.exports = router;