'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get jsonAttributes() {

        return ['scope'];
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            username: Joi.string().min(3).example('johndoe').description('Username of the user'),
            mail: Joi.string().email().example('john.doe@example.com').description('Email of the user'),
            password: Joi.string().min(8).example('MPD').description('Password of the user (encrypted)'),
            scope: Joi.array().items(Joi.string().valid('user', 'admin')).default(['user']).description('User scopes/roles'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;

        if (!this.scope || this.scope.length === 0) {
            this.scope = ['user'];
        }
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }

};
