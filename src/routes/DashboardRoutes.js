const express = require('express');
const Dashboard = require('../controllers/DashboardController');
const DashboardRoutes = express.Router();

DashboardRoutes.get('/dashboard', Dashboard)

module.exports = DashboardRoutes
