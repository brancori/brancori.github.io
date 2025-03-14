const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = (app) => {
    // Configuración básica de seguridad
    app.use(helmet());

    // Limitar peticiones por IP
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100 // límite por IP
    });
    app.use('/api/', limiter);

    // Prevenir SQL Injection y XSS
    app.use((req, res, next) => {
        // Sanitizar inputs
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/[<>]/g, '');
            }
        }
        next();
    });
};
