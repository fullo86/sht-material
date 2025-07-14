'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dept = sequelize.define('Dept', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dept_code: DataTypes.STRING,
    dept_desc: DataTypes.STRING,
  }, {
    tableName: 'departments',
    timestamps: false
  });

  Dept.associate = (models) => {
    Dept.hasMany(models.User, {
      foreignKey: 'dept_id',
      as: 'users'
    });
  };

  return Dept;
};
