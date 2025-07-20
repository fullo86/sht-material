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

const EditUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id}, 
      include: [
        {
          model: Dept,
          as: 'dept'
        }
      ]});

    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    const departments = await Dept.findAll();

    res.render('users/edit', {
      layout: 'layouts/template',
      title: 'Edit User',
      user,
      departments
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('errors/500', { layout: false });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { account, empno, vname, email, dept_id, sex } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    await user.update({
      account,
      empno,
      vname,
      email,
      dept_id,
      sex
    });

    res.redirect('/users?status=success');
  } catch (error) {
    console.error(error);
    res.status(500).render('errors/500', { layout: false });
  }
};

const CreateUser = async (req, res) => {
  const departments = await Dept.findAll();
  const roles = await Role.findAll();

  res.render('users/create', {
    layout: 'layouts/template',
    title: 'Add User',
    departments,
    roles
  });
};

// const StoreUser = async (req, res) => {
//   // const { empno, vname, passw, sex, dept_id, email, role_id } = req.body;
// }
// const StoreUser = async (req, res) => {
//   try {
//     await User.create(req.body);
//     res.redirect('/users');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Gagal menambahkan user.');
//   }
// };

module.exports = { GetAllUser, CreateUser, EditUser, UpdateUser };
