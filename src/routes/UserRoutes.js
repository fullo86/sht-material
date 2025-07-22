const express = require('express');
const userRoutes = express.Router();
const {
  GetAllUser,
  CreateUser,
  EditUser,
  UpdateUser,
  StoreUser,
  RemoveUser
} = require('../controllers/UserController');
const { isAdmin } = require('../middleware/AuthMiddleware');
const userValidationRules = require('../helper/UserValidator');


userRoutes.get('/users', isAdmin, GetAllUser);
userRoutes.get('/users/create', isAdmin, CreateUser);
userRoutes.post('/users/store', isAdmin, userValidationRules, StoreUser);
userRoutes.get('/users/edit/:id', isAdmin, EditUser);
userRoutes.patch('/users/update/:id', isAdmin, UpdateUser);
userRoutes.delete('/users/remove/:id', isAdmin, RemoveUser);

module.exports = userRoutes;
