const express = require('express');

const ReportRoutes = express.Router();
const { ExportExcel, GetReports } = require('../controllers/ReportController');

ReportRoutes.get('/report', GetReports)
ReportRoutes.get('/report/export-excel', ExportExcel);

module.exports = ReportRoutes
