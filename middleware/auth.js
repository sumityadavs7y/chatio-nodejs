const jwt = require('jsonwebtoken');

function notAuthorizedResponse() {
    const err = new Error('Not authenticated');
    err.statusCode = 401;
    return err;
}

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throw notAuthorizedResponse();
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        throw notAuthorizedResponse();
    }
    req.token = token;
    req.userId = decodedToken.userId;
    next();
}