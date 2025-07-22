'use strict';
module.exports = (sequelize, DataTypes) => {
  const StorageLog = sequelize.define('StorageLog', {
    Username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IPAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Activity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'StorageLog',
    timestamps: false
  });

  return StorageLog;
};
