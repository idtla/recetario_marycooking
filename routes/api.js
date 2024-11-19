router.get('/categories/render', async (req, res) => {
    try {
        const allCategories = await Category.findAll({
            attributes: ['id', 'name', 'parentId'],
            raw: true
        });
        
        // Función para construir el árbol de categorías
        const buildCategoryTree = (categories, parentId = null, level = 0) => {
            if (level > 1) return [];
            
            return categories
                .filter(cat => cat.parentId === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildCategoryTree(categories, cat.id, level + 1)
                }));
        };

        const categories = buildCategoryTree(allCategories);
        
        res.render('partials/category-list', { 
            categories: categories,
            layout: false,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
}); 