const { Recipe, Category, User } = require('../models');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs').promises;

exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.findAll({
            include: [
                { model: Category, as: 'Category' },
                { model: User, as: 'User' }
            ]
        });
        res.render('recipes/index', { recipes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar las recetas');
    }
};

exports.getRecipeBySlug = async (req, res) => {
    try {
        let recipe;
        if (req.params.categorySlug === 'uncategorized') {
            recipe = await Recipe.findOne({
                where: { 
                    slug: req.params.slug,
                    categoryId: null  // Específicamente buscamos recetas sin categoría
                },
                include: [
                    { model: User, as: 'User' }
                ]
            });
        } else {
            // Mantener la búsqueda original para recetas con categoría
            recipe = await Recipe.findOne({
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        where: { slug: req.params.categorySlug }
                    },
                    { model: User, as: 'User' }
                ],
                where: { slug: req.params.slug }
            });
        }

        if (!recipe) {
            return res.redirect('/'); // Redirigir a home en lugar de intentar renderizar 404
        }

        res.render('recipes/show', { recipe });

    } catch (error) {
        console.error('Error:', error);
        res.redirect('/');
    }
};

exports.createForm = async (req, res) => {
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
        res.render('recipes/create', { categories, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Error al cargar el formulario' });
    }
};

exports.editForm = async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            where: { slug: req.params.slug },
            include: [{ model: Category, as: 'Category' }]
        });

        if (!recipe) {
            return res.status(404).send('Receta no encontrada');
        }

        // Convertir a JSON y asegurar que imagenesAdicionales sea un array
        const recipeData = recipe.toJSON();
        
        // Asegurarse de que imagenesAdicionales sea un array
        if (typeof recipeData.imagenesAdicionales === 'string') {
            try {
                recipeData.imagenesAdicionales = JSON.parse(recipeData.imagenesAdicionales);
            } catch (e) {
                recipeData.imagenesAdicionales = [];
            }
        }
        
        // Si imagenesAdicionales es null o undefined, inicializarlo como array vacío
        if (!Array.isArray(recipeData.imagenesAdicionales)) {
            recipeData.imagenesAdicionales = [];
        }

        const categories = await Category.findAll({
            include: [{ model: Category, as: 'children' }],
            where: { parentId: null }
        });

        res.render('recipes/edit', {
            recipe: recipeData,
            categories,
            error: null
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar el formulario de edición');
    }
};

exports.create = async (req, res) => {
    try {
        const { titulo, descripcion, ingredientes, instrucciones, categoria, dificultad, 
                tiempoPreparacion, tiempoCoccion, porciones } = req.body;

        const slug = slugify(titulo, { lower: true, strict: true });

        // Manejar la imagen destacada
        let imagen = null;
        if (req.files && req.files.imagenDestacada) {
            const file = req.files.imagenDestacada;
            const fileName = `${Date.now()}-${file.name}`;
            await file.mv(path.join(__dirname, '../public/uploads/recipes/', fileName));
            imagen = `/uploads/recipes/${fileName}`;
        }

        const recipe = await Recipe.create({
            titulo,
            descripcion,
            ingredientes,
            instrucciones,
            imagen,
            dificultad,
            tiempoPreparacion: parseInt(tiempoPreparacion),
            tiempoCoccion: parseInt(tiempoCoccion),
            porciones: parseInt(porciones),
            categoryId: categoria,
            userId: req.session.user.id,
            slug
        });

        // Obtener la receta recién creada con su categoría
        const createdRecipe = await Recipe.findOne({
            where: { id: recipe.id },
            include: [{ model: Category, as: 'Category' }]
        });

        // Construir la URL de redirección
        const redirectPath = createdRecipe.categoryId 
            ? `/recipes/${createdRecipe.Category.slug}/${createdRecipe.slug}`
            : `/recipes/uncategorized/${createdRecipe.slug}`;

        res.redirect(redirectPath);
    } catch (error) {
        console.error('Error al crear la receta:', error);
        const categories = await Category.findAll({
            include: [{ model: Category, as: 'children' }],
            where: { parentId: null }
        });
        res.render('recipes/create', { 
            error: 'Error al crear la receta',
            categories
        });
    }
};

exports.update = async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            where: { slug: req.params.slug },
            include: [{ model: Category, as: 'Category' }]
        });

        if (!recipe) {
            return res.status(404).render('404', { error: 'Receta no encontrada' });
        }

        const { 
            titulo, 
            descripcion, 
            ingredientes, 
            instrucciones, 
            categoria, 
            dificultad, 
            tiempoPreparacion, 
            tiempoCoccion, 
            porciones 
        } = req.body;

        // Manejar imagen (código existente...)

        // Actualizar campos
        recipe.titulo = titulo;
        recipe.descripcion = descripcion;
        recipe.ingredientes = ingredientes;
        recipe.instrucciones = instrucciones;
        recipe.categoryId = categoria ? parseInt(categoria) : null; // Modificación aquí
        recipe.dificultad = dificultad;
        recipe.tiempoPreparacion = parseInt(tiempoPreparacion);
        recipe.tiempoCoccion = parseInt(tiempoCoccion);
        recipe.tiempoTotal = parseInt(tiempoPreparacion) + parseInt(tiempoCoccion);
        recipe.porciones = parseInt(porciones);
        recipe.slug = slugify(titulo, { lower: true, strict: true });

        await recipe.save();

        // Obtener la categoría actualizada
        const updatedRecipe = await Recipe.findOne({
            where: { id: recipe.id },
            include: [{ model: Category, as: 'Category' }]
        });

        // Redireccionar a la página de la receta con la ruta correcta
        const categorySlug = updatedRecipe.Category ? updatedRecipe.Category.slug : 'uncategorized';
        res.redirect(`/recipes/${categorySlug}/${updatedRecipe.slug}`);

    } catch (error) {
        console.error('Error al actualizar la receta:', error);
        
        const categories = await Category.findAll({
            include: [{ model: Category, as: 'children' }],
            where: { parentId: null }
        });

        res.render('recipes/edit', { 
            error: 'Error al actualizar la receta',
            recipe: req.body,
            categories
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            where: { slug: req.params.slug }
        });

        if (!recipe) {
            return res.status(404).render('404', { error: 'Receta no encontrada' });
        }

        // Eliminar imagen si existe
        if (recipe.imagen) {
            const imagePath = path.join(__dirname, '../public', recipe.imagen);
            await fs.unlink(imagePath).catch(() => {});
        }

        await recipe.destroy();
        res.redirect('/');
    } catch (error) {
        console.error('Error al eliminar la receta:', error);
        res.status(500).render('error', { error: 'Error al eliminar la receta' });
    }
};

exports.edit = async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            where: { slug: req.params.slug },
            include: [{ model: Category, as: 'Category' }]
        });

        // Asegúrate de que la ruta de la imagen es correcta
        if (recipe.imagen && !recipe.imagen.startsWith('/')) {
            recipe.imagen = `/uploads/recipes/${recipe.imagen}`;
        }

        console.log('DATOS DE LA RECETA:', JSON.stringify(recipe, null, 2));

        res.render('recipes/edit', {
            recipe,
            categories: await Category.findAll(),
            error: null
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/');
    }
};

exports.getUncategorizedRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.findAll({
            where: {
                categoryId: null
            }
        });

        // Usamos la vista home pero sin categorías en el sidebar
        res.render('home', { 
            recipes,
            categories: [], // Enviamos un array vacío para que no muestre categorías
            title: 'Recetas sin categoría'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar las recetas sin categoría');
    }
}; 