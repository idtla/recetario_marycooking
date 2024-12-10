const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/auth');

// Ruta del perfil
router.get('/profile', userController.profile);

module.exports = router;