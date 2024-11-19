const { Recipe, Category, User } = require('../models');

exports.getHome = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        { model: Category, as: 'Category' },
        { model: User, as: 'User' }
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
      user: req.session.user,
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