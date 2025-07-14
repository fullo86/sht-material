const express = require('express');
const userRoutes = require('./UserRoutes');
const StorageRoutes = require('./StorageRoutes');
const AuthRoutes = require('./AuthRoutes');
const DashboardRoutes = require('./DashboardRoutes');
const { isAuthenticated } = require('../middleware/AuthMiddleware');
const allRoutes = express.Router();

allRoutes.use('/', AuthRoutes);

allRoutes.use(isAuthenticated);
allRoutes.use('/', DashboardRoutes);
allRoutes.use('/', userRoutes);
allRoutes.use('/', StorageRoutes);

module.exports = allRoutes;