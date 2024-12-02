const { Category, Recipe } = require('../models');

exports.getBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.slug }
        });

        if (!category) {
            return res.redirect('/');
        }

        // Obtener todas las categorías para el sidebar
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });

        // Obtener IDs de categorías hijas
        const childCategories = await Category.findAll({
            where: { parentId: category.id }
        });
        
        const categoryIds = [category.id, ...childCategories.map(cat => cat.id)];

        // Obtener recetas de la categoría y sus hijas
        const recipes = await Recipe.findAll({
            where: { 
                categoryId: categoryIds 
            },
            include: [{ model: Category, as: 'Category' }]
        });

        res.render('home', {
            recipes,
            categories,
            currentCategory: category
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/');
    }
};

exports.manageCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [
                ['name', 'ASC'],
                ['parentId', 'ASC']
            ]
        });
        
        res.render('categories/manage', { categories });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar las categorías'
        });
    }
}; 