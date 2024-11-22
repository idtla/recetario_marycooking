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
            nombre: user.nombre
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
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.render('auth/register', { error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nombre,
            email,
            password: hashedPassword,
            created_at: new Date()
        });

        req.session.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre
        };

        res.redirect('/');
    } catch (error) {
        res.render('auth/register', { error: 'Error al crear la cuenta' });
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router; 