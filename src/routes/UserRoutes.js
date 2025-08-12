const express = require('express');
const UserRoutes = express.Router();
const {
  GetAllUser,
  CreateUser,
  EditUser,
  UpdateUser,
  StoreUser,
  RemoveUser,
} = require('../controllers/UserController');
const { userValidationRules, upsrValidationRules } = require('../helper/UserValidator');

UserRoutes.get('/users', GetAllUser);
UserRoutes.get('/users/create', CreateUser);
UserRoutes.post('/users/store', userValidationRules, StoreUser);
UserRoutes.get('/users/edit/:id', EditUser);
UserRoutes.patch('/users/update/:id', upsrValidationRules, UpdateUser);
UserRoutes.delete('/users/remove/:id', RemoveUser);

module.exports = UserRoutes;
