const db = require('../models');
const StorageLog = db.StorageLog;

const GetActivityLog = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

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

module.exports = GetActivityLog