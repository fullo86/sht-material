'use strict';
module.exports = (sequelize, DataTypes) => {
  const Storage = sequelize.define('Storage', {
 id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    autoIncrement: false
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
