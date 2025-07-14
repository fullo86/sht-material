const express = require('express');
const userRoutes = express.Router();
const {
  GetAllUser,
  createUser,
  formAddUser
} = require('../controllers/UserController');
const { isAdmin } = require('../middleware/AuthMiddleware');


userRoutes.get('/users', isAdmin, GetAllUser);         // List user
userRoutes.get('/users/add', isAdmin, formAddUser);    // Form tambah user
userRoutes.post('/users/add', isAdmin, createUser);    // Proses tambah user

module.exports = userRoutes;
