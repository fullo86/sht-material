const express = require('express');
const DeptRoutes = express.Router();
const { GetAllDepts, CreateDept, StoreDept, EditDept, UpdateDept, RemoveDept } = require('../controllers/DeptController');
const deptValidationRules = require('../helper/DeptValidator');

DeptRoutes.get('/departments', GetAllDepts);
DeptRoutes.get('/departments/create', CreateDept);
DeptRoutes.post('/departments/store', deptValidationRules, StoreDept);
DeptRoutes.get('/department/edit/:id', EditDept);
DeptRoutes.patch('/department/update/:id', UpdateDept);
DeptRoutes.delete('/department/remove/:id', RemoveDept);

module.exports = DeptRoutes;
