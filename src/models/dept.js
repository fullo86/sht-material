'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dept = sequelize.define('Dept', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
