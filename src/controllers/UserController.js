const db = require('../models');
const User = db.User;
const Dept = db.Dept;
const Role = db.Role;

const GetAllUser = async (req, res) => {
  const users = await User.findAll();

  res.render('users/read', {
    layout: 'layouts/template',
    title: 'List Users',
    users
  });
};

const formAddUser = async (req, res) => {
  const depts = await Dept.findAll();
  const roles = await Role.findAll();

  res.render('users/add', {
    layout: 'layouts/template',
    title: 'Add User',
    depts,
    roles
  });
};

const createUser = async (req, res) => {
  try {
    await User.create(req.body);
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menambahkan user.');
  }
};

module.exports = { GetAllUser, createUser, formAddUser };
