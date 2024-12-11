const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const userController = require('../controllers/userController');

router.get('/recipes/categories/render', async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{ 
                model: Category, 
                as: 'children' 
            }],
            where: { 
                parentId: null 
            }
        });
        
        res.render('partials/category-list', { 
            categories: categories,
            layout: false,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// Ruta para actualizar usuario
router.put('/users/:id', userController.updateUser);

module.exports = router; 