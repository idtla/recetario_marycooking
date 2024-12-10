const { DataTypes } = require('sequelize');
const sequelize = require(process.cwd() + '/src/config/database');

const User = sequelize.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Activo'
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Editor'
    }
}, {
    timestamps: false,
    tableName: 'usuarios'
});

module.exports = User; 