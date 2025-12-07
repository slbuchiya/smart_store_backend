const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        // 👇 FIX: Ahia "|| 'change_this_secret'" add karvu padse
        // Jethi controller sathe match thay
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
        
        req.user = decoded; 

        if (decoded.storeId) {
            req.storeId = decoded.storeId;
        }

        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};

module.exports = auth;
