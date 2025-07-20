const express = require('express');
const AuthRoutes = express.Router();
const AuthController = require('../controllers/AuthController');
const { redirectIfAuthenticated } = require('../middleware/AuthMiddleware');

AuthRoutes.get('/login', redirectIfAuthenticated, AuthController.showLogin);
AuthRoutes.post('/login/auth', redirectIfAuthenticated, AuthController.login);
AuthRoutes.get('/logout', AuthController.logout);

module.exports = AuthRoutes;
