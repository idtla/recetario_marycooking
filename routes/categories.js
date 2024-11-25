const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/manage', categoryController.manageCategories);
router.post('/create', categoryController.createCategory);
router.post('/update/:id', categoryController.updateCategory);
router.get('/delete/:id', categoryController.deleteCategory);

module.exports = router; 