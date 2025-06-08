const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search.controller');
const { autocomplete } = require('../controllers/autocomplete.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/search', verifyToken, search);
router.get('/autocomplete', autocomplete);


module.exports = router;