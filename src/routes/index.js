const express = require('express');
const userRoutes = require('./UserRoutes');
const AuthRoutes = require('./AuthRoutes');
const DashboardRoutes = require('./DashboardRoutes');
const { isAuthenticated } = require('../middleware/AuthMiddleware');
const deptRoutes = require('./DeptRoutes');
const StagingRoutes = require('./StagingRoutes');
const ActivityRoutes = require('./ActivityRoutes');
const allRoutes = express.Router();

allRoutes.use('/', AuthRoutes);

allRoutes.use(isAuthenticated);
allRoutes.use('/', DashboardRoutes);
allRoutes.use('/', deptRoutes);
allRoutes.use('/', userRoutes);
allRoutes.use('/', StagingRoutes);
allRoutes.use('/', ActivityRoutes);

module.exports = allRoutes;