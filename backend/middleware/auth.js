const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // payload will have { user_id: ... }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
