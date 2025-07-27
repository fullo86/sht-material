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
  UpdateByUser
} = require('../controllers/UserController');
const { isAdmin } = require('../middleware/AuthMiddleware');
const userValidationRules = require('../helper/UserValidator');

//Admin
userRoutes.get('/users', isAdmin, GetAllUser);
userRoutes.get('/users/create', isAdmin, CreateUser);
userRoutes.post('/users/store', isAdmin, userValidationRules, StoreUser);
userRoutes.get('/users/edit/:id', isAdmin, EditUser);
userRoutes.patch('/users/update/:id', isAdmin, UpdateUser);
userRoutes.delete('/users/remove/:id', isAdmin, RemoveUser);

//User
userRoutes.get('/user/account/edit/:id', EditByUser);
userRoutes.patch('/user/account/update/:id', UpdateByUser);

module.exports = userRoutes;
