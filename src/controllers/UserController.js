const db = require('../models');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
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

    const user = await User.findOne({ where: { id }});
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
    roles,
    errors: [],
    oldData: {}
  });
};

const StoreUser = async (req, res) => {
    const departments = await Dept.findAll();
    const roles = await Role.findAll();

    try {
        const errors = validationResult(req);
        errors.throw();

        const { vname, account, email, storeh, sex, dept_id, role_id, passw } = req.body

        const manuf = 'J'
        const empno = account.slice(1, 6);
        const code = "YYYYYYYY"
        const image = "default.png"

        const saltRounds = 12;
        const hashedPassw = await bcrypt.hash(passw, saltRounds);        

        await User.create({
            manuf,
            account,
            empno,
            vname,              
            passw: hashedPassw,
            sex,
            dept_id,
            email,
            role_id,
            storeh,
            code,
            image,
          });

        res.redirect('/users?status=success')
    } catch (error) {
      let errors = [];

      if (error.errors) {
        errors = error.errors
      }
      res.render('users/create', {
        layout: 'layouts/template',
        title: 'Add User',
        departments,
        roles,
        errors,
        oldData: req.body
      });
    }    
}

  const RemoveUser = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ where: { id }});

      if (!user) {
        return res.status(404).render('errors/404', { layout: false });
      }

      await user.destroy();
      res.redirect('/users?status=success');
    } catch (error) {
      res.status(500).render('errors/500', { layout: false });
    }
}
module.exports = { GetAllUser, CreateUser, EditUser, UpdateUser, StoreUser, RemoveUser }
