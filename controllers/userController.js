const { User, Recipe, Category } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const userController = {
  // Vista del perfil
  profile: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }

      const user = await User.findByPk(req.session.user.id, {
        attributes: ['id', 'email', 'nombre', 'rol', 'estado']
      });

      if (!user) {
        return res.redirect('/auth/login');
      }

      const recipes = await Recipe.findAll({
        where: { UserId: user.id },
        include: [{ model: Category, as: 'Category' }],
        order: [['created_at', 'DESC']]
      });

      let allUsers = null;
      if (user.rol === 'Admin') {
        allUsers = await User.findAll({
          attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'created_at'],
          order: [['created_at', 'DESC']]
        });
      }

      res.render('users/profile', {
        user,
        recipes,
        allUsers
      });

    } catch (error) {
      console.error('Error al acceder al perfil:', error);
      res.status(500).send('Error interno del servidor');
    }
  },

  // API Endpoints
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'created_at'],
        order: [['created_at', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { nombre, email, password, rol } = req.body;
      const hashedPassword = await bcrypt.hash(password || 'temporal123', 10);
      
      const user = await User.create({
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'Editor',
        estado: 'Activo'
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { nombre, email, rol, estado } = req.body;
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await user.update({ nombre, email, rol, estado });
      res.json(user);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await user.update({ estado: 'Inactivo' });
      res.status(200).json({ message: 'Usuario desactivado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = userController;