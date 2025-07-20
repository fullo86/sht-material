const express = require('express');
const StorageRoutes = express.Router();

const { GetAllStorage, createUser, pullHPSystem } = require('../controllers/StorageController');

StorageRoutes.get('/storage', GetAllStorage)
StorageRoutes.get('/storage/pull-hpsystem', pullHPSystem);

module.exports = StorageRoutes
