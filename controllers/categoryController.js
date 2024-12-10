const { Category, Recipe, User } = require('../models');

exports.getBySlug = async (req, res) => {
    try {
        // Obtener el usuario completo si está en sesión
        let user = null;
        if (req.session.user) {
            user = await User.findByPk(req.session.user.id, {
                attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url']
            });
        }

        const category = await Category.findOne({
            where: { slug: req.params.slug }
        });

        if (!category) {
            return res.redirect('/');
        }

        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });

        const childCategories = await Category.findAll({
            where: { parentId: category.id }
        });
        
        const categoryIds = [category.id, ...childCategories.map(cat => cat.id)];

        const recipes = await Recipe.findAll({
            where: { 
                categoryId: categoryIds 
            },
            include: [{ model: Category, as: 'Category' }]
        });

        res.render('home', {
            recipes,
            categories,
            currentCategory: category,
            user: user || req.session.user
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/');
    }
};

exports.manageCategories = async (req, res) => {
    try {
        // Obtener el usuario completo si está en sesión
        let user = null;
        if (req.session.user) {
            user = await User.findByPk(req.session.user.id, {
                attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url']
            });
        }

        const mainCategories = await Category.findAll({
            where: {
                parentId: null
            },
            include: [{
                model: Category,
                as: 'children',
                required: false
            }],
            order: [
                ['name', 'ASC'],
                [{ model: Category, as: 'children' }, 'name', 'ASC']
            ]
        });
        
        res.render('categories/manage', { 
            categories: mainCategories,
            error: null,
            user: user || req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar las categorías',
            user: req.session.user
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        const hasChildren = await Category.count({ where: { parentId: categoryId } });
        if (hasChildren > 0) {
            return res.status(400).json({ error: 'No se puede eliminar una categoría que tiene subcategorías' });
        }

        const hasRecipes = await Recipe.count({ where: { categoryId } });
        if (hasRecipes > 0) {
            return res.status(400).json({ error: 'No se puede eliminar una categoría que tiene recetas asociadas' });
        }

        await category.destroy();
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};

exports.editCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, parentId } = req.body;

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        if (parentId) {
            const hasChildren = await Category.count({ where: { parentId: categoryId } });
            if (hasChildren > 0) {
                return res.status(400).json({ error: 'No se puede convertir en subcategoría una categoría que ya tiene subcategorías' });
            }
        }

        await category.update({ 
            name,
            parentId: parentId || null
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error al editar categoría:', error);
        res.status(500).json({ error: 'Error al editar la categoría' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        if (parentId) {
            const parentCategory = await Category.findByPk(parentId);
            if (!parentCategory) {
                return res.status(400).json({ error: 'La categoría padre no existe' });
            }
            if (parentCategory.parentId) {
                return res.status(400).json({ error: 'No se puede asignar como padre una categoría que ya es hija' });
            }
        }

        const slug = name.toLowerCase()
            .replace(/[áäâà]/g, 'a')
            .replace(/[éëêè]/g, 'e')
            .replace(/[íïîì]/g, 'i')
            .replace(/[óöôò]/g, 'o')
            .replace(/[úüûù]/g, 'u')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const category = await Category.create({
            name,
            slug,
            parentId: parentId || null
        });

        res.json(category);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
}; 
