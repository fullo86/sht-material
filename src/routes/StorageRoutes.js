const express = require('express');
const StorageRoutes = express.Router();

const { GetAllStorage, createUser, pullHPSystem, GetAllStorageLog } = require('../controllers/StorageController');

StorageRoutes.get('/storage', GetAllStorage)
StorageRoutes.get('/storage/pull-hpsystem', pullHPSystem);
StorageRoutes.get('/storage/log', GetAllStorageLog);

module.exports = StorageRoutes
