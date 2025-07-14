const express = require('express');
const StorageRoutes = express.Router();

const { GetAllStorage, createUser } = require('../controllers/StorageController');

StorageRoutes.get('/storage', GetAllStorage)

module.exports = StorageRoutes
