const express = require('express');
const AuthRoutes = express.Router();
const AuthController = require('../controllers/AuthController');

AuthRoutes.get('/login', AuthController.showLogin);
AuthRoutes.post('/login/auth', AuthController.login);
AuthRoutes.get('/logout', AuthController.logout);

module.exports = AuthRoutes;
