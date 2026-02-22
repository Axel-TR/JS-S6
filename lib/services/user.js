'use strict';

const { Service } = require('@hapipal/schmervice');
const Encryption = require('../utils/encryption');
const Jwt = require('@hapi/jwt');
const Boom = require('@hapi/boom');

module.exports = class UserService extends Service {

    async create(payload) {

        const { User } = this.server.models();
        const { emailService } = this.server.services();

        if (payload.password) {
            payload.password = Encryption.hashPassword(payload.password);
        }

        const user = await User.query().insert(payload);

        try {
            await emailService.sendWelcomeEmail(user);
        }
        catch (err) {
            this.server.log(['error', 'email'], 'Failed to send welcome email: ' + err.message);
        }

        return user;
    }

    findAll() {

        const { User } = this.server.models();
        return User.query();
    }

    findPage(query) {

        const { User } = this.server.models();
        const { limit, page } = query;

        return User.query()
            .page(page - 1, limit);
    }

    findById(id) {

        const { User } = this.server.models();
        return User.query().findById(id);
    }

    findByEmail(email) {

        const { User } = this.server.models();
        return User.query().findOne({ mail: email });
    }

    updateById(id, payload) {

        const { User } = this.server.models();

        if (payload.password) {
            payload.password = Encryption.hashPassword(payload.password);
        }

        return User.query().patchAndFetchById(id, payload);
    }

    deleteById(id) {

        const { User } = this.server.models();
        return User.query().deleteById(id);
    }

    async authenticate(email, password) {

        const user = await this.findByEmail(email);

        if (!user) {
            return null;
        }

        const isValid = Encryption.verifyPassword(password, user.password);

        if (!isValid) {
            return null;
        }

        // Générer un JWT
        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.mail,
                scope: user.scope
            },
            {
                key: 'random_string',
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400
            }
        );

        return { token, user };
    }

    async grantAdminRole(userId) {

        const { User } = this.server.models();

        const user = await User.query().findById(userId);

        if (!user) {
            throw Boom.notFound('User not found');
        }

        if (!user.scope.includes('admin')) {
            user.scope.push('admin');
            await user.$query().patch({ scope: user.scope });
        }

        return user;
    }
};
