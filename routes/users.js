const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/auth');

// Ruta del perfil
router.get('/profile', isAuthenticated, userController.profile);

// Ruta para actualizar el perfil
router.put('/profile', isAuthenticated, userController.updateProfile);

module.exports = router;