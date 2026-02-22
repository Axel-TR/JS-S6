# Projet NodeJS - API Films

API REST faite avec Hapi.js pour gérer des utilisateurs et une bibliothèque de films.

## Fonctionnalités

- Création de compte + login JWT
- Gestion des rôles (user / admin)
- CRUD films (admin seulement)
- Système de favoris pour les users
- Envoi de mails (bienvenue, notifications films)
- Export CSV de la liste des films envoyé par mail
**

- Node.js
- Docker (pour MySQL)

## Installation

Cloner le repo puis :

```bash
npm install
```

Lancer MySQL avec Docker :

```bash
docker run -d --name mysql-hapi \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=hapi \
  -e MYSQL_DATABASE=user \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password
```

Créer un fichier `.env` à la racine (voir section suivante), puis lancer les migrations :

```bash
npx knex migrate:latest
```

## Variables d'environnement

Créer un `.env` avec :

```
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=hapi
DB_DATABASE=user
DB_PORT=3306
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
SMTP_FROM=noreply@monapp.com
```

Pour les variables SMTP, créer un compte sur [https://ethereal.email](https://ethereal.email) qui génère les credentials automatiquement.

## Lancer le projet

```bash
npm start
```


`http://localhost:3000`

`http://localhost:3000/documentation`

## Routes principales

### Users
| Méthode | Route | Description |
|--------|-------|-------------|
| POST | `/user` | Créer un compte |
| POST | `/user/login` | Se connecter |
| GET | `/users` | Liste des users |
| PATCH | `/user/{id}` | Modifier un user |
| DELETE | `/user/{id}` | Supprimer un user |

### Films
| Méthode | Route | Description |
|--------|-------|-------------|
| GET | `/movies` | Liste des films |
| POST | `/movie` | Ajouter un film (admin) |
| PATCH | `/movie/{id}` | Modifier un film (admin) |
| DELETE | `/movie/{id}` | Supprimer un film (admin) |
| POST | `/movies/export-csv` | Export CSV par mail (admin) |

### Favoris
| Méthode | Route | Description |
|--------|-------|-------------|
| GET | `/favorites` | Mes favoris |
| POST | `/movie/{id}/favorite` | Ajouter aux favoris |
| DELETE | `/movie/{id}/favorite` | Retirer des favoris |

