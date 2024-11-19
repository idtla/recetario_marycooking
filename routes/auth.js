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
        console.log('Iniciando proceso de login...');
        console.log('Body completo:', req.body);
        const { email, password } = req.body;

        console.log('Buscando usuario en la base de datos...');
        const user = await User.findOne({ 
            where: { email }
        });

        console.log('Usuario encontrado:', user ? 'Sí' : 'No');
        if (!user) {
            console.log('No se encontró el usuario');
            return res.render('auth/login', { 
                error: 'Email o contraseña incorrectos' 
            });
        }

        console.log('Verificando contraseña...');
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Contraseña válida:', validPassword);

        if (!validPassword) {
            console.log('Contraseña incorrecta');
            return res.render('auth/login', { 
                error: 'Email o contraseña incorrectos' 
            });
        }

        console.log('Contraseña correcta, creando sesión...');
        // Crear sesión
        req.session.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre
        };

        console.log('Sesión creada:', req.session.user);
        console.log('Redirigiendo a home...');
        
        res.redirect('/');

    } catch (error) {
        console.error('Error en el proceso de login:');
        console.error(error);
        console.error('Stack trace:', error.stack);
        res.render('auth/login', { 
            error: 'Error al iniciar sesión: ' + error.message 
        });
    }
});

// POST para registro
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.render('auth/register', {
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const user = await User.create({
            nombre,
            email,
            password: hashedPassword,
            created_at: new Date()
        });

        // Crear sesión
        req.session.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre
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