const express = require('express');
const GetActivityLog = require('../controllers/ActivityController');
const ActivityRoutes = express.Router();

ActivityRoutes.get('/activity-log', GetActivityLog)

module.exports = ActivityRoutes
