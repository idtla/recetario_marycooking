const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

// Rutas GET
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// POST para login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render('auth/login', { error: 'Email o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render('auth/login', { error: 'Email o contraseña incorrectos' });
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            estado: user.estado,
            imagen_url: user.imagen_url
        };

        res.redirect('/');
    } catch (error) {
        res.render('auth/login', { error: 'Error al iniciar sesión: ' + error.message });
    }
});

// POST para registro
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el email está pre-registrado
        const existingUser = await User.findOne({ where: { email } });

        if (!existingUser) {
            return res.render('auth/register', { 
                error: 'Este correo no está autorizado para registrarse. Contacta con un administrador.' 
            });
        }

        if (existingUser.estado !== 'Pendiente') {
            return res.render('auth/register', { 
                error: 'Este correo ya está registrado' 
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
            estado: 'Activo',
            imagen_url: existingUser.imagen_url
        };

        res.redirect('/');
    } catch (error) {
        console.error('Error en registro:', error);
        res.render('auth/register', {
            error: 'Error al crear la cuenta'
        });
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router; 