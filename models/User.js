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
        type: DataTypes.ENUM('Admin', 'Editor', 'Usuario'),
        allowNull: false,
        defaultValue: 'Editor'
    },
    imagen_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '/assets/img/default-avatar.webp'
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'usuarios'
});

module.exports = User; 