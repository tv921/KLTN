const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search.controller');
const { autocomplete } = require('../controllers/autocomplete.controller');

router.get('/search', search);
router.get('/autocomplete', autocomplete);


module.exports = router;