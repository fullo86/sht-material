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
    pic_id: {
      type: DataTypes.CHAR(36),
      allowNull: true, // atau false tergantung kebutuhan
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

    StgLog.belongsTo(models.PIC, {
      foreignKey: 'pic_id',
      targetKey: 'id',
      onDelete: 'SET NULL',
      as: 'pic'
    });
  };

  return StgLog;
};
