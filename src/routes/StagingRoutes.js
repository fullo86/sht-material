const express = require('express');
const StagingRoutes = express.Router();
const { pullHPSystem, GetAllStaging, GetLogsByStagingId, stockOutQty, stockInQty, GetStagingDetail, CheckPIC } = require('../controllers/StagingController');

StagingRoutes.get('/staging', GetAllStaging)
StagingRoutes.get('/storage/pull-hpsystem', pullHPSystem);
StagingRoutes.patch('/storage/stock-out/:id', stockOutQty);
StagingRoutes.patch('/storage/stock-in/:id', stockInQty);
StagingRoutes.get('/api/stglog', GetLogsByStagingId);
StagingRoutes.get('/api/staging/detail/:id', GetStagingDetail);
StagingRoutes.get('/api/pic/:empno', CheckPIC);

module.exports = StagingRoutes
