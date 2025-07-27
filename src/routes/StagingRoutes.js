const express = require('express');
const StagingRoutes = express.Router();
// const { AutopullHPSystem } = require('../controllers/pullHPSystem');
// const cron = require('node-cron');
const { pullHPSystem, GetAllStaging, GetLogsByStagingId, stockOutQty, stockInQty, GetStagingDetail } = require('../controllers/StagingController');

StagingRoutes.get('/staging', GetAllStaging)
StagingRoutes.get('/storage/pull-hpsystem', pullHPSystem);
// StagingRoutes.get('/storage/autopull-hpsystem', AutopullHPSystem);
StagingRoutes.patch('/storage/stock-out/:id', stockOutQty);
StagingRoutes.patch('/storage/stock-in/:id', stockInQty);
StagingRoutes.get('/api/stglog', GetLogsByStagingId);
StagingRoutes.get('/api/staging/detail/:id', GetStagingDetail);

// // Schedule untuk jalan setiap 1 jam
// cron.schedule('0 * * * *', async () => {
//   console.log(`[${new Date().toISOString()}] Running scheduled pullHPSystem`);
//   await AutopullHPSystem(null, null, true);
// });

module.exports = StagingRoutes
