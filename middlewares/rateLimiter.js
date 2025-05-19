const setRateLimit = require('express-rate-limit');

const AnnonceRateLimiter = setRateLimit({
    windiwMs: 1 * 60 * 1000,
    max: 50,
    message: 'Trop de requêtes envoyées, veuillez réessayer plus tard',
    headers: true,
})

module.exports = AnnonceRateLimiter;