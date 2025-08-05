module.exports = (sequelize, DataTypes) => {
  const Staging = sequelize.define('Staging', {
 id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    autoIncrement: false
    },
    pgrpno: DataTypes.CHAR(11),
    purno: DataTypes.CHAR(10),
    storeh: DataTypes.CHAR(2),
    sheft: DataTypes.CHAR(3),
    typ: DataTypes.CHAR(3),
    style: DataTypes.STRING(255),
    itncna: DataTypes.STRING(255),
    scolor: DataTypes.STRING(50),
    unit: DataTypes.STRING(20),
    sqty: DataTypes.DECIMAL(18, 2),
    vendno: DataTypes.STRING(50),
    memo: DataTypes.STRING(255),
    iqty: DataTypes.DECIMAL(18, 2),
    oqty: DataTypes.DECIMAL(18, 2),
    sdate: DataTypes.DATE
  }, {
    tableName: 'staging_data',
    timestamps: false
  });

  Staging.associate = (models) => {
    Staging.hasMany(models.StgLog, {
      foreignKey: 'staging_id',
      sourceKey: 'id',
      as: 'logs'
    });
  };

  return Staging;
};
