const sequelize = require('../config/database');
const Recipe = require('./Recipe');
const Category = require('./Category');
const User = require('./User');

// Definir relaciones con nombres diferentes para evitar colisiones
Recipe.belongsTo(Category, { 
    foreignKey: 'categoryId',
    as: 'Category'  // Cambiamos el nombre de la asociación
});
Category.hasMany(Recipe, { 
    foreignKey: 'categoryId',
    as: 'Recipes'   // Cambiamos el nombre de la asociación
});

Recipe.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'User'      // Cambiamos el nombre de la asociación
});
User.hasMany(Recipe, { 
    foreignKey: 'userId',
    as: 'Recipes'   // Cambiamos el nombre de la asociación
});

module.exports = {
    sequelize,
    Recipe,
    Category,
    User
}; 