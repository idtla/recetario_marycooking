module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/auth/login');
        }
    },
    isAdmin: (req, res, next) => {
        console.log('Verificando permisos de administrador');
        console.log('Sesión actual:', req.session);
        console.log('Usuario en sesión:', req.session.user);
        console.log('Rol del usuario:', req.session.user?.rol);
        
        if (!req.session.user || req.session.user.rol !== 'Admin') {
            console.log('Acceso denegado - No es administrador');
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
        }
        console.log('Acceso permitido - Es administrador');
        next();
    }
}; 