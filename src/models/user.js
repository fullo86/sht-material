'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    manuf: DataTypes.STRING,
    account: DataTypes.STRING,
    empno: DataTypes.STRING,
    vname: DataTypes.STRING,
    passw: DataTypes.STRING,
    sex: DataTypes.STRING,
    dept_id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    tableName: 'users',
    timestamps: false,
    id: false
  });

  User.associate = (models) => {
    User.belongsTo(models.Dept, {
      foreignKey: 'dept_id',
      as: 'dept'
    });
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });
  };

  return User;
};
