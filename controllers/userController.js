const { User, Recipe, Category } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const userController = {
  // Vista del perfil
  profile: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }

      const user = await User.findByPk(req.session.user.id, {
        attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url']
      });

      if (!user) {
        return res.redirect('/auth/login');
      }

      // Solo obtener recetas si es Editor o Admin
      let recipes = [];
      if (user.rol !== 'Usuario') {
        recipes = await Recipe.findAll({
          where: { UserId: user.id },
          include: [{ model: Category, as: 'Category' }],
          order: [['created_at', 'DESC']]
        });
      }

      // Solo obtener usuarios si es Admin
      let allUsers = null;
      if (user.rol === 'Admin') {
        allUsers = await User.findAll({
          attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'imagen_url', 'created_at'],
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
      // Verificar si es admin
      if (!req.session.user || req.session.user.rol !== 'Admin') {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const userId = req.params.id;
      const { email, rol, password } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Preparar datos de actualización
      const updateData = {};
      if (email) updateData.email = email;
      if (rol) updateData.rol = rol;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Actualizar usuario
      await user.update(updateData);

      res.json({ 
        message: 'Usuario actualizado correctamente',
        user: {
          id: user.id,
          email: user.email,
          rol: user.rol,
          estado: user.estado
        }
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
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
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { nombre, email, currentPassword, newPassword } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Manejar la subida de imagen si existe
      let imagen_url = user.imagen_url;
      if (req.files && req.files.imagen) {
        const imagen = req.files.imagen;
        const extensionesPermitidas = ['.png', '.jpg', '.jpeg', '.webp'];
        const extension = path.extname(imagen.name).toLowerCase();
        
        if (!extensionesPermitidas.includes(extension)) {
          return res.status(400).json({ message: 'Formato de imagen no permitido' });
        }

        const nombreArchivo = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
        const rutaGuardado = path.join(process.cwd(), 'public', 'uploads', 'avatars', nombreArchivo);
        
        // Crear directorio si no existe
        const dirPath = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        // Mover la imagen
        await imagen.mv(rutaGuardado);
        imagen_url = `/uploads/avatars/${nombreArchivo}`;

        // Si hay una imagen anterior y no es la default, la eliminamos
        if (user.imagen_url && user.imagen_url !== '/assets/img/default-avatar.webp') {
          const rutaImagenAnterior = path.join(process.cwd(), 'public', user.imagen_url);
          if (fs.existsSync(rutaImagenAnterior)) {
            fs.unlinkSync(rutaImagenAnterior);
          }
        }
      }

      // Verificar si se está intentando cambiar la contraseña
      if (newPassword && currentPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'La contraseña actual no es correcta' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
      }

      // Actualizar usuario con todos los campos
      await user.update({ 
        nombre: nombre || user.nombre,
        email: email || user.email,
        imagen_url
      });

      // Actualizar la sesión con los nuevos datos
      req.session.user = {
        ...req.session.user,
        nombre: user.nombre,
        email: user.email,
        imagen_url: user.imagen_url
      };

      res.json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
  },

  preRegisterUser: async (req, res) => {
    try {
      console.log('Iniciando pre-registro de usuario');
      console.log('Datos recibidos:', req.body);
      
      const { email, rol } = req.body;

      if (!email || !rol) {
        return res.status(400).json({ message: 'Email y rol son requeridos' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Crear usuario en estado pendiente
      const user = await User.create({
        email,
        rol,
        estado: 'Pendiente',
        password: await bcrypt.hash(Math.random().toString(36), 10),
        imagen_url: '/assets/img/default-avatar.webp'
      });

      console.log('Usuario pre-registrado exitosamente:', user.id);
      res.status(201).json({ message: 'Usuario pre-registrado correctamente' });
    } catch (error) {
      console.error('Error al pre-registrar usuario:', error);
      res.status(500).json({ message: 'Error al pre-registrar usuario' });
    }
  }
};

module.exports = userController;

