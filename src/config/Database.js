const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT || 'mssql',
    dialectOptions: {
      options: {
        requestTimeout: 60000,
        encrypt: false,
        enableArithAbort: true
      }
    },
    logging: false
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Koneksi ke SQL Server berhasil.');
  } catch (error) {
    console.error('Gagal koneksi ke SQL Server:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase
};
