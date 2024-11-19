require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();

// Configuración básica
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Configuración específica para CSS
app.use('/css', express.static(path.join(__dirname, 'public/css'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'text/css');
    }
}));

// Configuración de fileupload
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
}));

// Sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para variables globales
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.error = null;
    res.locals.success = null;
    next();
});

// Rutas
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const recipeRoutes = require('./routes/recipes');
const categoryRoutes = require('./routes/categories');

const { isAuthenticated } = require('./middlewares/auth');

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/', isAuthenticated, homeRoutes);
app.use('/recipes', isAuthenticated, recipeRoutes);
app.use('/categories', isAuthenticated, categoryRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor
const sequelize = require('./config/database');
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar el servidor:', err);
    });