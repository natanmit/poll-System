const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) return res.status(403).send('Access denied. No token provided.');

        try {
            const verified = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
            req.user = verified;

            // Proceed to the next middleware/function or route handler
            next();
        } catch (err) {
            // If there's an error during verification (token is invalid or expired)
            res.status(401).send('Invalid or expired authentication token.');
        }
    } else {
        // If the authorization header is missing or not in the correct format
        return res.status(401).send('Authentication token missing or malformed.');
    }
};
