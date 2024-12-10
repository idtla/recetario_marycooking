const { Recipe, Category, User } = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.search = async (req, res) => {
  const query = req.query.q;
  
  try {
    // Obtener el usuario completo si está en sesión
    let user = null;
    if (req.session.user) {
      user = await User.findByPk(req.session.user.id, {
        attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url']
      });
    }

    const [recipes, categories] = await Promise.all([
      Recipe.findAll({
        where: {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('BINARY', Sequelize.col('titulo')), 'LIKE', `%${query}%`),
            Sequelize.where(Sequelize.fn('BINARY', Sequelize.col('descripcion')), 'LIKE', `%${query}%`)
          ]
        },
        include: [{
          model: Category,
          as: 'Category'
        }],
        order: [['created_at', 'DESC']]
      }),
      Category.findAll()
    ]);

    res.render('search', {
      recipes,
      categories,
      searchQuery: query,
      user: user || req.session.user
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.redirect('/?error=search');
  }
};
