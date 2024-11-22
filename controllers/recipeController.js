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
        console.log('Buscando receta:', req.params);
        const recipe = await Recipe.findOne({
            where: { 
                slug: req.params.slug 
            },
            include: [
                { 
                    model: Category, 
                    as: 'Category',
                    where: { slug: req.params.categorySlug }
                },
                { 
                    model: User, 
                    as: 'User' 
                }
            ]
        });

        if (!recipe) {
            console.log('Receta no encontrada');
            return res.status(404).render('404', { error: 'Receta no encontrada' });
        }

        recipe.instrucciones = recipe.instrucciones
            .replace(/&ntilde;/g, 'ñ')
            .replace(/&aacute;/g, 'á')
            .replace(/&eacute;/g, 'é')
            .replace(/&iacute;/g, 'í')
            .replace(/&oacute;/g, 'ó')
            .replace(/&uacute;/g, 'ú')
            .replace(/&Aacute;/g, 'Á')
            .replace(/&Eacute;/g, 'É')
            .replace(/&Iacute;/g, 'Í')
            .replace(/&Oacute;/g, 'Ó')
            .replace(/&Uacute;/g, 'Ú')
            .replace(/<p>/g, '<p class="mb-4">')
            .replace(/<strong>/g, '<strong class="font-bold">');

        console.log('Receta encontrada:', recipe.titulo);
        res.render('recipes/show', { recipe });
    } catch (error) {
        console.error('Error al cargar la receta:', error);
        res.status(500).render('error', { error: 'Error al cargar la receta' });
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

        // Crear el slug
        const slug = slugify(titulo, { lower: true, strict: true });

        // Manejar la imagen destacada
        let imagen = null;
        if (req.files && req.files.imagenDestacada) {
            const file = req.files.imagenDestacada;
            const fileName = `${Date.now()}-${file.name}`;
            await file.mv(path.join(__dirname, '../public/uploads/recipes/', fileName));
            imagen = `/uploads/recipes/${fileName}`;
        }

        // Crear la receta
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

        res.redirect(`/recipes/${recipe.Category.slug}/${recipe.slug}`);
    } catch (error) {
        console.error('Error al crear la receta:', error);
        res.render('recipes/create', { 
            error: 'Error al crear la receta',
            categories: await Category.findAll()
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

        // Extraer datos del body
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

        // Manejar nueva imagen si se proporciona
        if (req.files && req.files.imagenDestacada) {
            const file = req.files.imagenDestacada;
            const fileName = `${Date.now()}-${file.name}`;
            await file.mv(path.join(__dirname, '../public/uploads/recipes/', fileName));
            
            // Eliminar imagen anterior si existe
            if (recipe.imagen) {
                const oldImagePath = path.join(__dirname, '../public', recipe.imagen);
                await fs.unlink(oldImagePath).catch(() => {});
            }
            
            recipe.imagen = `/uploads/recipes/${fileName}`;
        }

        // Actualizar campos
        recipe.titulo = titulo;
        recipe.descripcion = descripcion;
        recipe.ingredientes = ingredientes;
        recipe.instrucciones = instrucciones;
        recipe.categoryId = categoria || recipe.categoryId; // Mantener categoría actual si no se proporciona una nueva
        recipe.dificultad = dificultad;
        recipe.tiempoPreparacion = parseInt(tiempoPreparacion);
        recipe.tiempoCoccion = parseInt(tiempoCoccion);
        recipe.tiempoTotal = parseInt(tiempoPreparacion) + parseInt(tiempoCoccion);
        recipe.porciones = parseInt(porciones);
        recipe.slug = slugify(titulo, { lower: true, strict: true });

        await recipe.save();

        // Redireccionar a la página de la receta
        res.redirect(`/recipes/${recipe.Category.slug}/${recipe.slug}`);

    } catch (error) {
        console.error('Error al actualizar la receta:', error);
        
        // Obtener categorías para el formulario
        const categories = await Category.findAll({
            include: [{ model: Category, as: 'children' }],
            where: { parentId: null }
        });

        // Renderizar formulario con error
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