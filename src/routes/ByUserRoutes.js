const express = require('express');
const ByUserRoutes = express.Router();
const {
  EditByUser,
  UpdateByUser,
  ChangePassword,
  UpdatePasswordByUsr
} = require('../controllers/UserController');
const { changePasswordValidation } = require('../helper/UserValidator');

ByUserRoutes.get('/user/account/edit/:id', EditByUser);
ByUserRoutes.patch('/user/account/update/:id', UpdateByUser);
ByUserRoutes.get('/user/account/change-password/:id', ChangePassword);
ByUserRoutes.patch('/user/account/change-password/:id', changePasswordValidation, UpdatePasswordByUsr);

module.exports = ByUserRoutes;
