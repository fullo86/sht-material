const express = require('express');
const deptRoutes = express.Router();
const { isAdmin } = require('../middleware/AuthMiddleware');
const { GetAllDepts } = require('../controllers/DeptController');

deptRoutes.get('/departments', isAdmin, GetAllDepts);

module.exports = deptRoutes;
