'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {

        return 'movie';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().required().min(1).example('Cqrs 3').description('Title of the movie'),
            description: Joi.string().required().min(1).example('Huge film.').description('Description of the movie'),
            releaseDate: Joi.date().iso().required().example('2000-01-01').description('Release date of the movie'),
            director: Joi.string().required().min(1).example('Flash McQueen').description('Director of the movie'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }
};
