require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
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

// Configuración del store de sesiones MySQL
const options = {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(options);

// Configuración de sesiones con MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // cambiar a true si usas https
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
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