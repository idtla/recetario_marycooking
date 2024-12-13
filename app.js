require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload');

// Logs iniciales
console.log('Iniciando aplicación...');
console.log('Variables de entorno cargadas:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    PORT: process.env.PORT
});

const app = express();

// Configuración básica
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

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
app.set('views', path.join(__dirname, 'src', 'views'));

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
const apiRouter = require('./routes/api');
const userRoutes = require('./routes/users');

const { isAuthenticated } = require('./middlewares/auth');

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/', isAuthenticated, homeRoutes);
app.use('/recipes', isAuthenticated, recipeRoutes);
app.use('/categories', isAuthenticated, categoryRoutes);
app.use('/api', isAuthenticated, apiRouter);
app.use('/users', isAuthenticated, userRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detallado:', err);
    console.error('Stack:', err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor
const { sequelize } = require('./models');

console.log('Intentando conectar a la base de datos...');
sequelize.sync()
    .then(() => {
        console.log('Conexión a la base de datos establecida');
        app.listen(process.env.PORT, () => {
            console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar el servidor:', err);
    });