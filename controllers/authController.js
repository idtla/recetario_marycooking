const User = require('../models/User');
const bcrypt = require('bcrypt');

// Funciones de validación
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Método para validar contraseña
User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const authController = {
  showRegister: (req, res) => {
    res.render('pages/register');
  },

  register: async (req, res) => {
    try {
      const { nombre, email, password } = req.body;

      // Buscar usuario pre-registrado
      const existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        return res.render('auth/register', { 
          error: 'Este email no está autorizado para registrarse. Contacta con un administrador.' 
        });
      }

      if (existingUser.estado !== 'Pendiente') {
        return res.render('auth/register', { 
          error: 'Este email ya está registrado' 
        });
      }

      // Actualizar el usuario pre-registrado
      const hashedPassword = await bcrypt.hash(password, 10);
      await existingUser.update({
        nombre,
        password: hashedPassword,
        estado: 'Activo'
      });

      // Iniciar sesión
      req.session.user = {
        id: existingUser.id,
        email: existingUser.email,
        nombre: existingUser.nombre,
        rol: existingUser.rol,
        estado: existingUser.estado,
        imagen_url: existingUser.imagen_url
      };

      res.redirect('/');
    } catch (error) {
      console.error('Error en registro:', error);
      res.render('auth/register', {
        error: 'Error al crear la cuenta'
      });
    }
  },

  showLogin: (req, res) => {
    res.render('pages/login');
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      console.log('Datos recibidos:', { email }); // Para debugging
      
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      // Establecer la sesión
      req.session.user = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        estado: user.estado,
        imagen_url: user.imagen_url
      };

      // Asegurarnos de que la sesión se guarde antes de responder
      req.session.save((err) => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
          return res.status(500).json({ error: 'Error al iniciar sesión' });
        }
        
        console.log('Sesión guardada correctamente:', req.session); // Para debugging
        res.json({ success: true });
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
  }
};

module.exports = authController; 