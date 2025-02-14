"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateRequest = (req, res, next) => {
    console.log('Incoming Request Body:', req.body);
    const { email, phoneNumber } = req.body;
    console.log('Email:', email);
    console.log('Phone Number:', phoneNumber);
    if (!email && !phoneNumber) {
        res.status(400).json({ error: 'Either email or phoneNumber is required.' });
        return;
    }
    next();
};
exports.default = validateRequest;
