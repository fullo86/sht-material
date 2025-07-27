'use strict';
module.exports = (sequelize, DataTypes) => {
  const StgLog = sequelize.define('StgLog', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
    },
    staging_id: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    kind: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    storeh: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    sqty: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    iqty: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    oqty: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'stgLog',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  StgLog.associate = (models) => {
    StgLog.belongsTo(models.Staging, {
      foreignKey: 'staging_id',
      targetKey: 'id',
      onDelete: 'CASCADE',
      as: 'staging'
    });
  };

  return StgLog;
};
