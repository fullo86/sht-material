'use strict';
module.exports = (sequelize, DataTypes) => {
  const Storage = sequelize.define('Storage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    storeh: DataTypes.STRING,
    sheft: DataTypes.STRING,
    kind: DataTypes.STRING,
    style: DataTypes.STRING,
    itncna: DataTypes.STRING,
    scolor: DataTypes.STRING,
    unit: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    vendno: DataTypes.STRING,
    memo: DataTypes.STRING,
    qty1: DataTypes.INTEGER,
    sdate: DataTypes.DATE
  }, {
    tableName: 'storage',
    timestamps: false
  });

  // Jika ada relasi, tambahkan di sini
  Storage.associate = (models) => {
    // Contoh:
    // Storage.belongsTo(models.Vendor, { foreignKey: 'vendno', as: 'vendor' });
  };

  return Storage;
};
