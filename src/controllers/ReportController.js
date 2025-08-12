const db = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const Staging = db.Staging;
const StgLog = db.StgLog
const XLSX = require("xlsx");

const GetReports = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 100;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const month = req.query.month || '';
  const start = req.query.start || '';
  const end = req.query.end || '';

  let whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { purno: { [Op.like]: `%${search}%` } },
      { itncna: { [Op.like]: `%${search}%` } },
      { style: { [Op.like]: `%${search}%` } }
    ];
  }

  if (month) {
    const [year, m] = month.split("-");
    const firstDay = new Date(year, m - 1, 1);
    const lastDay = new Date(year, m, 0);
    whereCondition.sdate = { [Op.between]: [firstDay, lastDay] };
  } else if (start && end) {
    whereCondition.sdate = {
      [Op.between]: [new Date(start), new Date(end)]
    };
  }

  try {
    const { count, rows: stages } = await Staging.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: StgLog,
          as: 'logs',
          required: false,
          order: [['created_at', 'DESC']]
        }
      ],
      limit,
      offset,
      order: [['sdate', 'DESC']],
    });

    const enhancedStages = stages.map(stage => {
      const logs = stage.logs || [];
      const totalIqty = logs.reduce((sum, log) => sum + parseFloat(log.iqty || 0), 0);
      const totalOqty = logs.reduce((sum, log) => sum + parseFloat(log.oqty || 0), 0);

      return {
        ...stage.toJSON(),
        totalIqty,
        totalOqty,
      };
    });

    const totalPages = Math.ceil(count / limit);

    return res.render('report/report', {
      layout: "layouts/template",
      title: 'Report Data',
      stages: enhancedStages,
      currentPage: page,
      totalPages,
      search,
      month,
      start,
      end,
    });
  } catch (error) {
    console.error('Error fetching storage data:', error);
    return res.status(500).send("Internal server error.");
  }
};


const ExportExcel = async (req, res) => {
  const {
    search = '',
    month = '',
    start = '',
    end = '',
    action = '',
    email = ''
  } = req.query;

  let whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { purno: { [Op.like]: `%${search}%` } },
      { itncna: { [Op.like]: `%${search}%` } },
      { style: { [Op.like]: `%${search}%` } }
    ];
  }

  if (month) {
    const [year, m] = month.split("-");
    const firstDay = new Date(year, m - 1, 1);
    const lastDay = new Date(year, m, 0);
    whereCondition.sdate = { [Op.between]: [firstDay, lastDay] };
  } else if (start && end) {
    whereCondition.sdate = {
      [Op.between]: [new Date(start), new Date(end)]
    };
  }

  try {
    const stages = await Staging.findAll({
      where: whereCondition,
      include: [
        {
          model: StgLog,
          as: 'logs',
          required: false
        }
      ],
      order: [['sdate', 'DESC']],
    });

    const data = stages.map((stage, index) => {
      const logs = stage.logs || [];
      const totalIqty = logs.reduce((sum, log) => sum + parseFloat(log.iqty || 0), 0);
      const totalOqty = logs.reduce((sum, log) => sum + parseFloat(log.oqty || 0), 0);

      return {
        No: index + 1,
        'Purchase No': stage.purno,
        Style: stage.style,
        'Item Name': stage.itncna,
        'Stock Qty': stage.sqty,
        'In Qty': totalIqty,
        'Out Qty': totalOqty,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staging Report");

    let logsData = [];
    stages.forEach(stage => {
      (stage.logs || []).forEach(log => {
        logsData.push({
          'Purchase No': stage.purno,
          'Date': new Date(log.created_at).toLocaleDateString(),
          'Storeh': log.storeh || '',
          'Kind': log.kind || '',
          'In Qty': log.iqty || 0,
          'Out Qty': log.oqty || 0,
        });
      });
    });

    if (logsData.length > 0) {
      const logSheet = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(workbook, logSheet, "Staging Logs");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    if (action === "email") {
      if (!email) {
        req.flash('error_msg', 'Email address is required.');
        return res.redirect('/report');
      }

      const nodemailer = require("nodemailer");
      let transporter = nodemailer.createTransport({
        host: '10.1.0.23',
        port: 25,
        secure: false,
        auth: {
          user: 'SHT\\sht.mailer',
          pass: 'P@$$w0rd$$B$HT'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: '"System I/O Sample WH" <sht.mailer@sht.ssbshoes.com>',
        to: email,
        subject: "Report System I/O Sample WH",
        text: "Attached is the Excel report.",
        attachments: [
          {
            filename: "report.xlsx",
            content: buffer,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        ]
      });

      req.flash('status', 'success.');
      req.flash('msg', 'Email sent successfully.');
      return res.redirect('/report');
    }

    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    console.error("Error exporting excel:", err);
    return res.status(500).send("Failed to export Excel file.");
  }
};

module.exports = { GetReports, ExportExcel };
