'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dept = sequelize.define('Dept', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      autoIncrement: false
    },
    dept_code: DataTypes.CHAR(3),
    dept_desc: DataTypes.STRING(20),
  }, {
    tableName: 'departments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Dept.associate = (models) => {
    Dept.hasMany(models.User, {
      foreignKey: 'dept_id',
      as: 'users'
    });
  };

  return Dept;
};
