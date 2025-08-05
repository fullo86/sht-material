const express = require('express');
const deptRoutes = express.Router();
const { isAdmin } = require('../middleware/AuthMiddleware');
const { GetAllDepts, CreateDept, StoreDept, EditDept, UpdateDept, RemoveDept } = require('../controllers/DeptController');
const deptValidationRules = require('../helper/DeptValidator');

deptRoutes.get('/departments', isAdmin, GetAllDepts);
deptRoutes.get('/departments/create', isAdmin, CreateDept);
deptRoutes.post('/departments/store', isAdmin, deptValidationRules, StoreDept);
deptRoutes.get('/department/edit/:id', isAdmin, EditDept);
deptRoutes.patch('/department/update/:id', isAdmin, UpdateDept);
deptRoutes.delete('/department/remove/:id', isAdmin, RemoveDept);

module.exports = deptRoutes;
