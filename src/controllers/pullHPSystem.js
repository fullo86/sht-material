// // controllers/pullHPSystem.js
// const { v4: uuidv4 } = require('uuid');
// const dayjs = require('dayjs');
// const fs = require('fs');
// const path = require('path');
// const db = require('../models');
// const Staging = db.Staging;
// const StgLog = db.StgLog;

// const AutopullHPSystem = async (req = null, res = null, isScheduled = false) => {
//   try {
//     const data = await db.sequelize.query(`
//       SELECT *
//       FROM OPENQUERY([ondbs], '
//         SELECT FIRST 50
//           u36.pgrpno,
//           u06.purno,
//           ''JS'' AS storeh,
//           ''A01'' AS sheft,
//           u36.typ,
//           u36.style,
//           u36.itncna,
//           u36.scolor,
//           u06.ex_unit,
//           u06.pqty,
//           u06.vendno,
//           '''',0 AS oqty,
//           TODAY AS sdate
//         FROM u04, u36, u06
//         WHERE
//           u04.kind = ''8''
//           AND u06.manuf1 = ''J''
//           AND u36.pgrpno = u06.pgrpno
//           AND u06.pgrpno = u04.pgrpno
//           AND u06.purno = u36.purno
//           AND u06.manuf1 = u04.manuf
//       ')
//     `, { type: db.Sequelize.QueryTypes.SELECT });

//     if (!data.length) {
//       if (!isScheduled) return res.status(404).send("0 Data pulled.");
//       return;
//     }

//     const tempTable = data.map(item => ({
//       pgrpno: item.pgrpno,
//       purno: item.purno,
//       storeh: item.storeh,
//       sheft: item.sheft,
//       typ: item.typ,
//       style: item.style,
//       itncna: item.itncna,
//       scolor: item.scolor,
//       unit: item.ex_unit,
//       qty: item.pqty,
//       vendno: item.vendno,
//       memo: item.memo || '',
//       oqty: item.oqty || 0,
//       sdate: item.sdate
//     }));

//     for (const row of tempTable) {
//       const exists = await Staging.findOne({ where: { pgrpno: row.pgrpno, purno: row.purno } });
//       if (exists) continue;

//       const result = await Staging.create({
//         id: uuidv4(),
//         kind: 'I',
//         ...row
//       });

//       await StgLog.create({
//         id: uuidv4(),
//         staging_id: result.id,
//         kind: 'A',
//         totalqty: result.qty
//       });
//     }

//     // Simpan waktu sinkronisasi terakhir
//     const lastSyncTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
//     const syncPath = path.join(__dirname, '../last_sync.json');
//     fs.writeFileSync(syncPath, JSON.stringify({ lastSyncTime }, null, 2));

//     if (!isScheduled) return res.redirect('/storage');
//   } catch (err) {
//     console.error('Gagal tarik data HPSystem:', err);
//     if (!isScheduled) res.status(500).send('Gagal tarik data HPSystem');
//   }
// };

// module.exports = { AutopullHPSystem };
