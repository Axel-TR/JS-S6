'use strict';

const Crypto = require('crypto');

module.exports = {

    hashPassword(password) {

        const salt = Crypto.randomBytes(16).toString('hex');
        const hash = Crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        return `${salt}:${hash}`;
    },

    verifyPassword(password, hashedPassword) {

        const [salt, originalHash] = hashedPassword.split(':');
        const hash = Crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        return hash === originalHash;
    }
};

