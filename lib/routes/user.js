'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');

const createUser = {
    method: 'post',
    path: '/user',
    options: {
        auth: false,
        tags: ['api'],
        validate: {
            payload: Joi.object({
                firstName: Joi.string().required().min(3).example('John').description('Firstname of the user'),
                lastName: Joi.string().required().min(3).example('Doe').description('Lastname of the user'),
                username: Joi.string().required().min(3).example('johndoe').description('Username of the user'),
                mail: Joi.string().email().required().example('john.doe@example.com').description('Email of the user'),
                password: Joi.string().required().min(8).example('MPD').description('Password of the user (minimum 8 characters)')
            })
        }
    },
    handler: (request, h) => {

        const { userService } = request.services();

        return userService.create(request.payload);
    }
};


const getUsers = {
    method: 'get',
    path: '/users',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        validate: {
            query: Joi.object({
                limit: Joi.number().integer().min(1).max(100).default(20),
                page: Joi.number().integer().min(1).default(1)
            })
        }
    },
    handler: (request, h) => {

        const { userService } = request.services();

        return userService.findPage(request.query);
    }
};


const getUserById = {
    method: 'get',
    path: '/user/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Récupère un utilisateur par son identifiant',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();

        const user = await userService.findById(request.params.id);

        if (!user) {
            throw Boom.notFound('User not found');
        }

        return user;
    }
};


const updateUser = {
    method: 'patch',
    path: '/user/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Modifie les informations d\'un utilisateur',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            }),
            payload: Joi.object({
                firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                username: Joi.string().min(3).example('johndoe').description('Username of the user'),
                mail: Joi.string().email().example('john.doe@example.com').description('Email of the user'),
                password: Joi.string().min(8).example('SecurePass123').description('Password of the user (minimum 8 characters)')
            }).min(1)
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();

        const user = await userService.findById(request.params.id);

        if (!user) {
            throw Boom.notFound('User not found');
        }

        return userService.updateById(request.params.id, request.payload);
    }
};


const loginUser = {
    method: 'post',
    path: '/user/login',
    options: {
        auth: false,
        tags: ['api'],
        description: 'Authentifie un utilisateur',
        validate: {
            payload: Joi.object({
                mail: Joi.string().email().required().example('john.doe@example.com').description('Email of the user'),
                password: Joi.string().required().min(8).example('SecurePass123').description('Password of the user')
            })
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();
        const { mail, password } = request.payload;

        const user = await userService.authenticate(mail, password);

        if (!user) {
            throw Boom.unauthorized('Invalid email or password');
        }

        return { token: user.token, login: 'successful' };
    }
};


const deleteUser = {
    method: 'delete',
    path: '/user/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Supprime un utilisateur',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required().default(0)
            })
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();

        await userService.deleteById(request.params.id);

        return '';
    }
};


const grantAdminRole = {
    method: 'post',
    path: '/user/{id}/grant-admin',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Donne le rôle admin à un utilisateur (réservé aux admins)',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: (request, h) => {

        const { userService } = request.services();

        return userService.grantAdminRole(request.params.id);
    }
};


module.exports = [createUser, getUserById, getUsers, updateUser, loginUser, deleteUser, grantAdminRole];
