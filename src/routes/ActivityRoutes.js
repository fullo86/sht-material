const express = require('express');
const GetActivityLog = require('../controllers/ActivityController');
const { isAdmin } = require('../middleware/AuthMiddleware');
const ActivityRoutes = express.Router();

ActivityRoutes.get('/activity-log' ,isAdmin ,GetActivityLog)

module.exports = ActivityRoutes
