'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');

const createMovie = {
    method: 'post',
    path: '/movie',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Créer un nouveau film (admin uniquement)',
        validate: {
            payload: Joi.object({
                title: Joi.string().required().min(1).example('Cqrs 3').description('Title of the movie'),
                description: Joi.string().required().min(1).example('Huge film.').description('Description of the movie'),
                releaseDate: Joi.date().iso().required().example('2000-01-01').description('Release date of the movie'),
                director: Joi.string().required().min(1).example('Flash McQueen').description('Director of the movie'),
            })
        }
    },
    handler: (request, h) => {

        const { movieService } = request.services();

        return movieService.create(request.payload);
    }
};


const getMovies = {
    method: 'get',
    path: '/movies',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Récupérer la liste des films',
        validate: {
            query: Joi.object({
                limit: Joi.number().integer().min(1).max(100).default(20),
                page: Joi.number().integer().min(1).default(1)
            })
        }
    },
    handler: (request, h) => {

        const { movieService } = request.services();

        return movieService.findPage(request.query);
    }
};


const getMovieById = {
    method: 'get',
    path: '/movie/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Récupérer un film par son identifiant',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        const movie = await movieService.findById(request.params.id);

        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        return movie;
    }
};


const updateMovie = {
    method: 'patch',
    path: '/movie/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Modifier un film (admin uniquement)',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            }),
            payload: Joi.object({
                title: Joi.string().min(1).example('Inception').description('Title of the movie'),
                description: Joi.string().min(1).example('A thief who steals corporate secrets through dream-sharing technology.').description('Description of the movie'),
                releaseDate: Joi.date().iso().example('2010-07-16').description('Release date of the movie'),
                director: Joi.string().min(1).example('Christopher Nolan').description('Director of the movie')
            }).min(1)
        }
    },
    handler: (request, h) => {

        const { movieService } = request.services();

        return movieService.updateById(request.params.id, request.payload);
    }
};


const deleteMovie = {
    method: 'delete',
    path: '/movie/{id}',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Supprimer un film (admin uniquement)',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        await movieService.deleteById(request.params.id);

        return '';
    }
};


// Routes pour les favoris
const getFavorites = {
    method: 'get',
    path: '/favorites',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Récupérer la liste des films favoris de l\'utilisateur connecté'
    },
    handler: (request, h) => {

        const { movieService } = request.services();
        const userId = request.auth.credentials.id;

        return movieService.getFavorites(userId);
    }
};


const addFavorite = {
    method: 'post',
    path: '/movie/{id}/favorite',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Ajouter un film aux favoris de l\'utilisateur connecté',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: (request, h) => {

        const { movieService } = request.services();
        const userId = request.auth.credentials.id;

        return movieService.addFavorite(userId, request.params.id);
    }
};


const removeFavorite = {
    method: 'delete',
    path: '/movie/{id}/favorite',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['user', 'admin']
        },
        tags: ['api'],
        description: 'Supprimer un film des favoris de l\'utilisateur connecté',
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();
        const userId = request.auth.credentials.id;

        await movieService.removeFavorite(userId, request.params.id);

        return '';
    }
};


// Route pour l'export CSV
const exportMoviesCsv = {
    method: 'post',
    path: '/movies/export-csv',
    options: {
        auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
        tags: ['api'],
        description: 'Exporter tous les films en CSV et envoyer par email à l\'admin (admin uniquement)'
    },
    handler: async (request, h) => {

        const { movieService, emailService } = request.services();
        const user = request.auth.credentials;

        // Générer le CSV
        const csvContent = await movieService.exportToCsv();

        // Envoyer par email
        const filename = `movies-export-${new Date().toISOString().split('T')[0]}.csv`;
        await emailService.sendCsvExport(user, csvContent, filename);

        return { message: 'CSV export will be sent to your email shortly' };
    }
};


module.exports = [createMovie, getMovies, getMovieById, updateMovie, deleteMovie, getFavorites, addFavorite, removeFavorite, exportMoviesCsv];
