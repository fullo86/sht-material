const express = require('express');
const UserRoutes = require('./UserRoutes');
const AuthRoutes = require('./AuthRoutes');
const DashboardRoutes = require('./DashboardRoutes');
const { isAuthenticated, isAdmin } = require('../middleware/AuthMiddleware');
const DeptRoutes = require('./DeptRoutes');
const StagingRoutes = require('./StagingRoutes');
const ActivityRoutes = require('./ActivityRoutes');
const ReportRoutes = require('./ReportRoutes');
const PICRoutes = require('./PICRoutes');
const ByUserRoutes = require('./ByUserRoutes');
const AllRoutes = express.Router();

AllRoutes.use('/', AuthRoutes);

AllRoutes.use(isAuthenticated);
AllRoutes.use('/', DashboardRoutes);
AllRoutes.use('/', ByUserRoutes);
AllRoutes.use('/', PICRoutes);
AllRoutes.use('/', StagingRoutes);
AllRoutes.use('/', ReportRoutes);

AllRoutes.use(isAdmin);
AllRoutes.use('/', isAdmin, DeptRoutes);
AllRoutes.use('/', isAdmin, UserRoutes);
AllRoutes.use('/', isAdmin, ActivityRoutes);

module.exports = AllRoutes;