const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/manage', categoryController.manageCategories);
router.get('/:slug', categoryController.getBySlug);
router.post('/create', categoryController.createCategory);
router.post('/update/:id', categoryController.editCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;