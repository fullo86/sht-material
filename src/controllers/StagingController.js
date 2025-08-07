const db = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const Staging = db.Staging;
const StgLog = db.StgLog
const { v4: uuidv4 } = require('uuid');
const ActivityLog = require('../helper/ActivityLog');

const GetAllStaging = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereCondition = search
        ? {
            [Op.or]: [
                { purno: { [Op.like]: `%${search}%` } },
                { itncna: { [Op.like]: `%${search}%` } },
                { style: { [Op.like]: `%${search}%` } }
            ]
        }
        : {};

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

        const enhancedStages = stages.map((stage) => {
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

        res.render('storage/staging', {
            layout: "layouts/template",
            title: 'Storage Data',
            stages: enhancedStages,
            currentPage: page,
            totalPages,
            search,
        });
    } catch (error) {
        console.error('Error fetching storage data:', error);
        res.status(500).send("Internal server error.");
    }
};

const pullHPSystem = async (req, res) => {
  try {
    const data = await db.sequelize.query(`
      SELECT *
      FROM OPENQUERY([ondbs], '
          SELECT FIRST 1000
              u36.pgrpno,
              u06.purno,
              ''JS'' AS storeh,
              ''A01'' AS sheft,
              u36.typ,
              u36.style,
              u36.itncna,
              u36.scolor,
              u06.ex_unit,
              u06.pqty AS sqty,
              u06.vendno,
              '''',
              0 AS iqty,
              0 AS oqty,
              TODAY AS sdate
          FROM u04, u36, u06
          WHERE
              u04.kind = ''8''
              AND u06.manuf1 = ''J''
              AND u06.cdrdat >=''01/01/2025''
              AND u36.pgrpno = u06.pgrpno
              AND u06.pgrpno = u04.pgrpno
              AND u06.purno = u36.purno
              AND u06.manuf1 = u04.manuf
              AND u36.style <> ''null''
      ')
    `, {
      type: db.Sequelize.QueryTypes.SELECT
    });

    if (!data.length) {
      return res.status(404).send("0 Data pulled.");
    }

    const tempTable = data.map(item => ({
      pgrpno: item.pgrpno,
      purno: item.purno,
      storeh: item.storeh,
      sheft: item.sheft,
      typ: item.typ,
      style: item.style,
      itncna: item.itncna,
      scolor: item.scolor,
      unit: item.ex_unit,
      sqty: item.sqty,
      vendno: item.vendno,
      memo: item.memo || '',
      iqty: item.iqty || 0,
      oqty: item.oqty || 0,
      sdate: item.sdate
    }));

for (const row of tempTable) {
  const data = await Staging.findOne({where :{ pgrpno: row.pgrpno, purno: row.purno }})

    if (data) continue;

    const result = await Staging.create({
    id: uuidv4(),
    pgrpno: row.pgrpno,
    purno: row.purno,
    storeh: row.storeh || '',
    sheft: row.sheft || '',
    typ: row.typ || '',
    style: row.style,
    itncna: row.itncna,
    scolor: row.scolor,
    unit: row.unit,
    sqty: row.sqty,
    vendno: row.vendno,
    memo: row.memo || '',
    iqty: row.iqty || 0,
    oqty: row.oqty || 0,
    sdate: row.sdate
  })

      if (!result) {
      req.flash('error_msg', 'Failed create data');
      return res.redirect('/staging');
    }
}

    const empno = req.session.user.account || 'Unknown';
    const username = req.session.user.vname || 'Unknown';

    ActivityLog({
      empno,
      username,
      msgs: `Pull data from HPSystem`
    });

    res.redirect('/staging');
  } catch (err) {
    console.log(err)
    res.status(500).send("Failed to pull data from HP.");
  }
};
 
const GetLogsByStagingId = async (req, res) => {
  const stagingId = req.query.staging_id;

  if (!stagingId) {
    return res.status(400).json({ error: "Staging_id not found" });
  }

  try {
    const logs = await StgLog.findAll({
      where: { staging_id: stagingId },
      order: [['created_at', 'DESC']],
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching stgLog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const GetStagingDetail = async (req, res) => {
  const stagingId = req.params.id;  

  try {
    const maxInQty = await StgLog.max('iqty', {
      where: {
        staging_id: stagingId,
        kind: 'I',
      },
    });

    const maxOutQty = await StgLog.max('oqty', {
      where: {
        staging_id: stagingId,
        kind: 'O',
      },
    });

    const maxInDate = await StgLog.findOne({
      where: {
        staging_id: stagingId,
        kind: 'I',
        iqty: maxInQty,
      },
      attributes: ['created_at', 'storeh'], 
    });

    const maxOutDate = await StgLog.findOne({
      where: {
        staging_id: stagingId,
        kind: 'O',
        oqty: maxOutQty,
      },
      attributes: ['created_at', 'storeh'], 
    });
    res.json({
      maxInQty: maxInQty || 0,
      maxOutQty: maxOutQty || 0,
      storehIn: maxInDate ? maxInDate.storeh : 'N/A',
      storehOut: maxOutDate ? maxOutDate.storeh: 'N/A',
      maxInDate: maxInDate ? maxInDate.created_at : 'N/A', 
      maxOutDate: maxOutDate ? maxOutDate.created_at : 'N/A',
      stagingId: stagingId,
    });

  } catch (error) {
    console.error('Error fetching top qty:', error);
    res.status(500).send("Internal server error.");
  }
};

const stockInQty = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id, iqty } = req.body;

    if (!id || !iqty) {
      req.flash('error_msg', 'Field required');
      return res.redirect('/staging');
    }

    const inQty = parseFloat(iqty);
    if (isNaN(inQty) || inQty <= 0) {
      req.flash('error_msg', 'Qty at least > 0');
      return res.redirect('/staging');
    }

    const record = await Staging.findOne({
      where: { id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!record) {
      req.flash('error_msg', 'Data not found');
      return res.redirect('/staging');
    }

    const newQty = record.sqty + inQty;

    const resOqty = await StgLog.create({
      id: uuidv4(),
      staging_id: record.id,
      kind: 'I',
      storeh: record.storeh,
      sqty: newQty,
      iqty: inQty,
      oqty: record.outQty
    }, { transaction });

    if (!resOqty) {
      await transaction.rollback();
      req.flash('error_msg', 'Failed to create the data');
      return res.redirect('/staging');
    }

    const total = await StgLog.sum('iqty', {
      where: { staging_id: id },
      transaction
    });
    const totalOqty = parseFloat(total || 0);

    const result = await record.update({
      sqty: newQty,
      iqty: totalOqty
    }, { transaction });

    if (!result) {
      await transaction.rollback();
      req.flash('error_msg', 'Failed update storage stock');
      return res.redirect('/staging');
    }

    await transaction.commit();

    const empno = req.session?.user?.account || 'Unknown';
    const username = req.session?.user?.vname || 'Unknown';

    ActivityLog({
      empno,
      username,
      msgs: `Stock-In ${inQty} for Purchase no ${record.purno}`
    });

    req.flash('success_msg', `Stock-In ${inQty} success!`);
    return res.redirect('/staging');
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

    return res.status(500).json({ message: "Interal server error" });
  }
};

const stockOutQty = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id, oqty } = req.body;

    if (!id || !oqty) {
      req.flash('error_msg', 'Field required');
      return res.redirect('/staging');
    }

    const outQty = parseFloat(oqty);
    if (isNaN(outQty) || outQty <= 0) {
      req.flash('error_msg', 'Qty at least > 0');
      return res.redirect('/staging');
    }

    const record = await Staging.findOne({
      where: { id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!record) {
      req.flash('error_msg', 'Data not found');
      return res.redirect('/staging');
    }

    const newQty = record.sqty - outQty;
    if (record.sqty < outQty) {
      req.flash('error_msg', 'Outqty > stock qty');
      return res.redirect('/staging');
    }

    const resOqty = await StgLog.create({
      id: uuidv4(),
      staging_id: record.id,
      kind: 'O',
      storeh: record.storeh,
      sqty: newQty,
      iqty: record.inQty,
      oqty: outQty
    }, { transaction });

    if (!resOqty) {
      await transaction.rollback();
      req.flash('error_msg', 'Failed to create the data');
      return res.redirect('/staging');
    }

    const total = await StgLog.sum('oqty', {
      where: { staging_id: id },
      transaction
    });
    const totalOqty = parseFloat(total || 0);

    const result = await record.update({
      sqty: newQty,
      oqty: totalOqty
    }, { transaction });

    if (!result) {
      await transaction.rollback();
      req.flash('error_msg', 'Failed update storage data');
      return res.redirect('/staging');
    }

    await transaction.commit();

    const empno = req.session?.user?.account || 'Unknown';
    const username = req.session?.user?.vname || 'Unknown';

    ActivityLog({
      empno,
      username,
      msgs: `Stock-Out ${outQty} for Purchase no ${record.purno}`
    });

    req.flash('success_msg', `Stock-Out ${outQty} success`);
    return res.redirect('/staging');
  } catch (error) {
    await transaction.rollback();
    console.error("Error stockOutQty:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { GetAllStaging, pullHPSystem, GetLogsByStagingId, GetStagingDetail, stockOutQty, stockInQty };
