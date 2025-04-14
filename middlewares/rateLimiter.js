const setRateLimit = require('express-rate-limit');

const AnnonceRateLimiter = setRateLimit({
    windiwMs: 1000,
    max: 5,
    message: 'Trop de requêtes envoyées, veuillez réessayer plus tard',
    headers: true,
})

module.exports = AnnonceRateLimiter;