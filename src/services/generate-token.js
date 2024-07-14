import config from '../config';
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

export const generateEmailToken = (email) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const resetToken = jwt.sign({ token, email }, config.SECRET_KEY, { expiresIn: '1h' });
        return resetToken;
    } catch (error) {
        return '';
    }
};
