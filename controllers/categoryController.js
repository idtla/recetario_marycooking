const { Category, Recipe } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Category,
                    as: 'children',
                    include: [Recipe]
                },
                Recipe
            ],
            where: {
                parentId: null
            }
        });
        res.render('categories/index', { categories, error: null });
    } catch (error) {
        console.error(error);
        res.render('categories/index', { 
            categories: [], 
            error: 'Error al cargar las categorías' 
        });
    }
};

exports.manageCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Category,
                    as: 'children'
                }
            ],
            where: {
                parentId: null // Solo categorías principales
            }
        });
        res.render('categories/manage', { categories, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar las categorías');
    }
}; 