const { DataTypes } = require('sequelize');
const sequelize = require(process.cwd() + '/src/config/database');

const Recipe = sequelize.define('recetas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ingredientes: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    instrucciones: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'Sin categoría'
    },
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    dificultad: {
        type: DataTypes.ENUM('Fácil', 'Moderada', 'Difícil', 'Extra Difícil'),
        allowNull: false,
        defaultValue: 'Moderada'
    },
    tiempoPreparacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    tiempoCoccion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    porciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4
    },
    imagenesAdicionales: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('imagenesAdicionales');
            if (rawValue) {
                try {
                    return JSON.parse(rawValue);
                } catch (e) {
                    return [];
                }
            }
            return [];
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('imagenesAdicionales', JSON.stringify(value));
            } else if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    this.setDataValue('imagenesAdicionales', value);
                } catch (e) {
                    this.setDataValue('imagenesAdicionales', '[]');
                }
            } else {
                this.setDataValue('imagenesAdicionales', '[]');
            }
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'recetas',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Añadir getter para la dificultad que incluya los estilos
Recipe.prototype.getDificultadConEstilo = function() {
    const estilos = {
        'Fácil': {
            clase: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
            bg: '#DEF7EC',
            color: '#03543F'
        },
        'Moderada': {
            clase: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
            bg: '#FDF6B2',
            color: '#723B13'
        },
        'Difícil': {
            clase: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
            bg: '#FDE8E8',
            color: '#9B1C1C'
        },
        'Extra Difícil': {
            clase: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
            bg: '#E9D8FD',
            color: '#553C9A'
        }
    };

    return {
        nombre: this.dificultad,
        estilo: estilos[this.dificultad]
    };
};

Recipe.associate = function(models) {
    Recipe.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'Category'
    });
};

module.exports = Recipe; 