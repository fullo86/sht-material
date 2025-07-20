const express = require('express');
const userRoutes = express.Router();
const {
  GetAllUser,
  CreateUser,
  EditUser,
  UpdateUser
} = require('../controllers/UserController');
const { isAdmin } = require('../middleware/AuthMiddleware');


userRoutes.get('/users', isAdmin, GetAllUser);
userRoutes.get('/users/create', isAdmin, CreateUser);
userRoutes.get('/users/edit/:id', isAdmin, EditUser);
userRoutes.patch('/users/update/:id', isAdmin, UpdateUser);

module.exports = userRoutes;
