const db = require('../models');
const { Op } = require('sequelize');
const Storage = db.Storage;
const StorageLog = db.StorageLog;

const GetAllStorage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Kondisi pencarian
    const whereCondition = search
        ? {
            [Op.or]: [
                { kind: { [Op.like]: `%${search}%` } },
                { itncna: { [Op.like]: `%${search}%` } },
                { style: { [Op.like]: `%${search}%` } }
            ]
        }
        : {};

    try {
        const { count, rows: storage } = await Storage.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['sdate', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        res.render('storage/read', {
            layout: "layouts/template",
            title: 'Storage Data',
            storage,
            currentPage: page,
            totalPages,
            search,
        });
    } catch (error) {
        console.error('Error fetching storage data:', error);
        res.status(500).send("Internal server error.");
    }
};


const GetAllStorageLog = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Search di kolom username, ip_address, atau activity
  const whereCondition = search
    ? {
        [Op.or]: [
          { Username: { [Op.like]: `%${search}%` } },
          { IPAddress: { [Op.like]: `%${search}%` } },
          { Activity: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  try {
    const { count, rows: logs } = await StorageLog.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['Timestamp', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.render('storage/log', {
      title: 'Storage Activity Log',
      logs,
      currentPage: page,
      totalPages,
      search,
    });
  } catch (error) {
    console.error('Error fetching storage logs:', error);
    res.status(500).send('Internal server error.');
  }
};

// Contoh createUser sederhana
const createUser = async (req, res) => {
    const { item_name, vendor, style } = req.body;

    try {
        const newStorage = await Storage.create({ item_name, vendor, style });
        res.redirect('/storage'); // Redirect ke halaman storage setelah insert
    } catch (error) {
        console.error('Error creating new storage:', error);
        res.status(500).send("Internal server error.");
    }
};

const pullHPSystem = async (req, res) => {
  try {
    const data = await db.sequelize.query(`
      SELECT *
      FROM OPENQUERY([ondbs], '
        SELECT 
            ''A01'' AS storeh,
            '''' AS sheft,
            ''JS'' AS kind,            
            u36.typ AS style,
            u36.itncna,
            u36.scolor,
            u06.ex_unit AS unit,
            u06.pqty AS qty,
            u06.vendno,
            '''' AS memo,
            0 AS qty1,
            u06.cdrdat AS sdate
        FROM u04, u36, u06
        WHERE u04.kind = ''8''
          AND u06.manuf1 = ''J''
          AND u36.pgrpno = u06.pgrpno
          AND u06.pgrpno = u04.pgrpno
          AND u06.purno = u36.purno
          AND u06.manuf1 = u04.manuf
      ')
    `, {
      type: db.Sequelize.QueryTypes.SELECT
    });

    if (!data.length) {
      return res.status(404).send("Tidak ada data yang ditarik dari HPSystem.");
    }

    const mappedData = data.map(item => ({
      storeh: item.storeh || '',
      sheft: item.sheft || '',
      kind: item.kind,
      style: item.style,
      itncna: item.itncna,
      scolor: item.scolor,
      unit: item.unit,
      qty: item.qty,
      vendno: item.vendno,
      memo: item.memo || '',
      qty1: item.qty1 || 0,
      sdate: item.sdate
    }));

    await Storage.bulkCreate(mappedData, {
  validate: true,
  returning: false
});

      // === Tambahkan pencatatan log aktivitas ===
    const user = req.user?.username || 'Unknown'; // tergantung authentication
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await db.StorageLog.create({
      Username: user,
      IPAddress: ipAddress,
      Activity: 'Pull data from HPSystem'
    });

    res.redirect('/storage');
  } catch (err) {
    console.error("Gagal pull data HPSystem:", err.original || err);
    res.status(500).send("Gagal tarik dan simpan data dari HPSystem.");
  }
};

const getAllDetails = async (req, res) => {

}

module.exports = { GetAllStorage, createUser, pullHPSystem, GetAllStorageLog };
