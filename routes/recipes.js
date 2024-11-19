const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Rutas de creación
router.get('/create', recipeController.createForm);
router.post('/create', recipeController.create);

// Rutas de edición y eliminación
router.get('/:categorySlug/:slug/edit', recipeController.editForm);
router.post('/:categorySlug/:slug/update', recipeController.update);
router.post('/:categorySlug/:slug/delete', recipeController.delete);

// Rutas de visualización
router.get('/:categorySlug/:slug', recipeController.getRecipeBySlug);
router.get('/', recipeController.getAllRecipes);

module.exports = router; 