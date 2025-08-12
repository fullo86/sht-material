'use strict';

module.exports = (sequelize, DataTypes) => {
  const PIC = sequelize.define('PIC', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      autoIncrement: false
    },
    manuf: DataTypes.CHAR(1),
    empno: DataTypes.CHAR(5),
    vname: DataTypes.STRING,
    sex: DataTypes.CHAR(1),
    dept_id: DataTypes.INTEGER,
    storeh: DataTypes.CHAR(2),
    image: DataTypes.STRING,
  }, {
    paranoid: true,
    tableName: 'picusers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  PIC.associate = (models) => {
    PIC.belongsTo(models.Dept, {
      foreignKey: 'dept_id',
      as: 'dept'
    });
  };
  return PIC;
};
