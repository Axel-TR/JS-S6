'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(payload) {

        const { Movie } = this.server.models();
        const { emailService } = this.server.services();

        const movie = await Movie.query().insert(payload);

        try {
            await emailService.sendNewMovieNotification(null, movie);
        }
        catch (err) {
            this.server.log(['error', 'email'], 'Failed to send new movie notifications: ' + err.message);
        }

        return movie;
    }

    findAll() {

        const { Movie } = this.server.models();
        return Movie.query().orderBy('createdAt', 'desc');
    }

    findPage(query) {

        const { Movie } = this.server.models();
        const { limit, page } = query;

        return Movie.query()
            .orderBy('createdAt', 'desc')
            .page(page - 1, limit);
    }

    findById(id) {

        const { Movie } = this.server.models();
        return Movie.query().findById(id);
    }

    async updateById(id, payload) {

        const { Movie } = this.server.models();

        const movie = await Movie.query().patchAndFetchById(id, payload);

        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        try {
            await this.notifyMovieUpdate(movie);
        }
        catch (err) {
            this.server.log(['error', 'email'], 'Failed to send movie update notifications: ' + err.message);
        }

        return movie;
    }

    deleteById(id) {

        const { Movie } = this.server.models();
        return Movie.query().deleteById(id);
    }

    async notifyNewMovie(movie) {

        const { User } = this.server.models();
        const { emailService } = this.server.services();

        const users = await User.query().select('id', 'firstName', 'lastName', 'mail');

        for (const user of users) {
            try {
                await emailService.sendNewMovieNotification(user, movie);
            }
            catch (err) {
                this.server.log(['error', 'email'], `Failed to notify user ${user.id}: ` + err.message);
            }
        }
    }

    async notifyMovieUpdate(movie) {

        const { Favorite, User } = this.server.models();
        const { emailService } = this.server.services();

        const favorites = await Favorite.query().where('movieId', movie.id);

        for (const favorite of favorites) {
            const user = await User.query().findById(favorite.userId);
            if (user) {
                try {
                    await emailService.sendMovieUpdateNotification(user, movie);
                }
                catch (err) {
                    this.server.log(['error', 'email'], `Failed to notify user ${user.id}: ` + err.message);
                }
            }
        }
    }

    async addFavorite(userId, movieId) {

        const { Favorite, Movie } = this.server.models();

        const movie = await Movie.query().findById(movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        const existing = await Favorite.query().findOne({ userId, movieId });
        if (existing) {
            throw Boom.conflict('Movie already in favorites');
        }

        return Favorite.query().insert({ userId, movieId });
    }

    async getFavorites(userId) {

        const { Favorite, Movie } = this.server.models();

        const favorites = await Favorite.query().where('userId', userId);
        const movieIds = favorites.map((f) => f.movieId);

        if (movieIds.length === 0) {
            return [];
        }

        return Movie.query().whereIn('id', movieIds);
    }

    async removeFavorite(userId, movieId) {

        const { Favorite } = this.server.models();

        const existing = await Favorite.query().findOne({ userId, movieId });
        if (!existing) {
            throw Boom.notFound('Movie not in favorites');
        }

        return Favorite.query().deleteById(existing.id);
    }

    async isFavorite(userId, movieId) {

        const { Favorite } = this.server.models();
        const favorite = await Favorite.query().findOne({ userId, movieId });
        return !!favorite;
    }

    // Export CSV
    async exportToCsv() {

        const movies = await this.findAll();

        const headers = ['ID', 'Title', 'Description', 'Release Date', 'Director', 'Created At', 'Updated At'];
        const rows = movies.map((movie) => [
            movie.id,
            `"${(movie.title || '').replace(/"/g, '""')}"`,
            `"${(movie.description || '').replace(/"/g, '""')}"`,
            movie.releaseDate,
            `"${(movie.director || '').replace(/"/g, '""')}"`,
            movie.createdAt,
            movie.updatedAt
        ]);

        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }
};
