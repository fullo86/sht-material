const express = require('express');
const { GetAllPic, CreatePic, StorePic, EditPic, UpdatePIC, RemovePic } = require('../controllers/PICController');
const { picValidationRules } = require('../helper/UserValidator');
const PICRoutes = express.Router();

PICRoutes.get('/pic', GetAllPic)
PICRoutes.get('/pic/create', CreatePic)
PICRoutes.post('/pic/store', picValidationRules, StorePic);
PICRoutes.get('/pic/edit/:id', EditPic);
PICRoutes.patch('/pic/update/:id', UpdatePIC);
PICRoutes.delete('/pic/remove/:id', RemovePic);

module.exports = PICRoutes;
