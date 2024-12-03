const { Recipe, Category } = require('../models');
const { Op } = require('sequelize');

exports.search = async (req, res) => {
  const query = req.query.q;
  
  try {
    const [recipes, categories] = await Promise.all([
      Recipe.findAll({
        where: {
          [Op.or]: [
            { titulo: { [Op.like]: `%${query}%` } },
            { descripcion: { [Op.like]: `%${query}%` } }
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
      searchQuery: query
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.redirect('/?error=search');
  }
};
