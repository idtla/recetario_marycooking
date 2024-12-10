const { Recipe, Category, User } = require('../models');

exports.getHome = async (req, res) => {
    try {
        let user = null;
        if (req.session.user) {
            user = await User.findByPk(req.session.user.id, {
                attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url']
            });
        }

        const recipes = await Recipe.findAll({
            include: [
                { 
                    model: Category, 
                    as: 'Category',
                    required: true 
                },
                { 
                    model: User, 
                    as: 'User' 
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 6
        });
        
        const categories = await Category.findAll({
            order: [
                ['name', 'ASC'],
                ['parentId', 'ASC']
            ]
        });
        
        res.render('home', {
            recipes,
            categories,
            user: user || req.session.user,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.render('home', {
            recipes: [],
            categories: [],
            user: req.session.user,
            error: 'Error al cargar la página principal'
        });
    }
}; 