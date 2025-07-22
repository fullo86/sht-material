'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    manuf: DataTypes.CHAR(1),
    account: DataTypes.CHAR(6),
    empno: DataTypes.CHAR(5),
    vname: DataTypes.STRING,
    passw: DataTypes.STRING,
    sex: DataTypes.CHAR(1),
    dept_id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    storeh: DataTypes.CHAR(2),
    code: DataTypes.CHAR(30),
    image: DataTypes.STRING
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
