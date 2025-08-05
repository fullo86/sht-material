const express = require('express');
const userRoutes = express.Router();
const {
  GetAllUser,
  CreateUser,
  EditUser,
  UpdateUser,
  StoreUser,
  RemoveUser,
  EditByUser,
  UpdateByUser,
  ChangePassword,
  UpdatePasswordByUsr
} = require('../controllers/UserController');
const { isAdmin } = require('../middleware/AuthMiddleware');
const { userValidationRules, upsrValidationRules, upByusrValidationRules, changePasswordValidation } = require('../helper/UserValidator');

//Admin
userRoutes.get('/users', isAdmin, GetAllUser);
userRoutes.get('/users/create', isAdmin, CreateUser);
userRoutes.post('/users/store', isAdmin, userValidationRules, StoreUser);
userRoutes.get('/users/edit/:id', isAdmin, EditUser);
userRoutes.patch('/users/update/:id', isAdmin, upsrValidationRules, UpdateUser);
userRoutes.delete('/users/remove/:id', isAdmin, RemoveUser);

//User
userRoutes.get('/user/account/edit/:id', EditByUser);
userRoutes.patch('/user/account/update/:id', UpdateByUser);
userRoutes.get('/user/account/change-password/:id', ChangePassword);
userRoutes.patch('/user/account/change-password/:id', changePasswordValidation, UpdatePasswordByUsr);

module.exports = userRoutes;
