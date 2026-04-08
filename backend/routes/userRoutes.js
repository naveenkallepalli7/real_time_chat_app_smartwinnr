const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.route('/').get(protect, getUsers);

module.exports = router;
