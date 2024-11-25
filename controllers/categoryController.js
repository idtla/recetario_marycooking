const { Category, Recipe } = require('../models');
const slugify = require('slugify');

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
            order: [
                ['name', 'ASC']
            ]
        });
        
        res.render('categories/manage', { 
            categories, 
            error: null,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { 
            error: 'Error al cargar la página de gestión de categorías',
            user: req.session.user
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        
        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        await Category.create({
            name,
            slug,
            parentId: parentId || null
        });

        res.json({ 
            success: true, 
            message: 'Categoría creada correctamente' 
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ 
            error: 'Error al crear la categoría',
            details: error.message 
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const categoryId = req.params.id;
        
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ 
                error: 'Categoría no encontrada' 
            });
        }

        if (parentId && categoryId === parentId) {
            return res.status(400).json({ 
                error: 'Una categoría no puede ser su propia categoría padre' 
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true
        });

        await Category.update(
            { 
                name,
                slug,
                parentId: parentId || null 
            },
            { 
                where: { id: categoryId } 
            }
        );
        
        res.json({ 
            success: true, 
            message: 'Categoría actualizada correctamente' 
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ 
            error: 'Error al actualizar la categoría',
            details: error.message 
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/categories/manage');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
}; 