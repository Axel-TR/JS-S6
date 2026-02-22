'use strict';

const Nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');

module.exports = class EmailService extends Service {

    constructor(server, options) {

        super(server, options);
        this.transporter = null;
        this._initTransporter();
    }

    _initTransporter() {

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            this.server.log(['warn', 'email'], 'Variables SMTP manquantes, les emails ne seront pas envoyés.');
            return;
        }

        this.transporter = Nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    _isReady(context) {

        if (!this.transporter) {
            this.server.log(['warn', 'email'], `Transporter non configuré, envoi ignoré (${context})`);
            return false;
        }

        return true;
    }

    sendWelcomeEmail(user) {

        if (!this._isReady('welcome')) {
            return Promise.resolve();
        }

        return this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@monapp.com',
            to: user.mail,
            subject: 'Bienvenue !',
            text: `Salut ${user.firstName},\n\nTon compte a bien été créé. Ton identifiant : ${user.username}.\n\nÀ bientôt !`,
            html: `
                <p>Salut <strong>${user.firstName}</strong>,</p>
                <p>Ton compte a bien été créé sur la plateforme.</p>
                <p>Ton identifiant : <strong>${user.username}</strong></p>
                <p>À bientôt !</p>
            `
        });
    }

    sendNewMovieNotification(user, movie) {

        if (!this._isReady('new-movie')) {
            return Promise.resolve();
        }

        return this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@monapp.com',
            to: user.mail,
            subject: `Nouveau film disponible : ${movie.title}`,
            text: `Bonjour ${user.firstName},\n\nUn nouveau film vient d'être ajouté :\n${movie.title} - réalisé par ${movie.director}\n\n${movie.description}`,
            html: `
                <p>Bonjour ${user.firstName},</p>
                <p>Un nouveau film vient d'être ajouté à la bibliothèque :</p>
                <h2>${movie.title}</h2>
                <p><strong>Réalisateur :</strong> ${movie.director}</p>
                <p><strong>Sortie :</strong> ${movie.releaseDate}</p>
                <p>${movie.description}</p>
            `
        });
    }

    sendMovieUpdateNotification(user, movie) {

        if (!this._isReady('movie-update')) {
            return Promise.resolve();
        }

        return this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@monapp.com',
            to: user.mail,
            subject: `Mise à jour : ${movie.title}`,
            text: `Bonjour ${user.firstName},\n\nLe film "${movie.title}" que tu as en favoris a été modifié.\n\n${movie.description}`,
            html: `
                <p>Bonjour ${user.firstName},</p>
                <p>Le film <strong>${movie.title}</strong> que tu as en favoris vient d'être mis à jour.</p>
                <p><strong>Réalisateur :</strong> ${movie.director}</p>
                <p>${movie.description}</p>
            `
        });
    }

    sendCsvExport(user, csvContent, filename) {

        if (!this._isReady('csv-export')) {
            return Promise.resolve();
        }

        return this.transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@monapp.com',
            to: user.mail,
            subject: 'Export CSV - Films',
            text: `Bonjour ${user.firstName},\n\nTu trouveras en pièce jointe l'export CSV des films.`,
            html: `
                <p>Bonjour ${user.firstName},</p>
                <p>Tu trouveras en pièce jointe l'export CSV de tous les films disponibles.</p>
            `,
            attachments: [{
                filename,
                content: csvContent
            }]
        });
    }
};
