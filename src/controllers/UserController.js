const { sequelize } = require('../models');
const db = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
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
    res.status(500).render('errors/500', { layout: false });
  }
};

const UpdateUser = async (req, res) => {
    const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { account, vname, email, dept_id, sex } = req.body;
    
    const user = await User.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction});
    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    let empno = user.empno
    if (user.account != account) {
        empno = account.slice(1, 6);
    }

    const result = await user.update({
                  account,
                  empno,
                  vname,
                  email,
                  dept_id,
                  sex
                }, { transaction });

    if (!result) {
      await transaction.rollback();
      return res.render('users/read', { 
        layout: 'layouts/template', 
        errors: [{ msg: 'Failed update user' }] 
      });        
    }

    await transaction.commit();
    res.redirect('/users?status=success');
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      const departments = await Dept.findAll();
      return res.render('users/edit', { 
        layout: 'layouts/template', 
        title: 'Edit User',
        errors: [{ msg: error }],
        user: req.body,
        departments
      });
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
    const transaction = await sequelize.transaction();

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

        const result = await User.create({
                      id: uuidv4(),
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
                    }, { transaction });

        if (!result) {
          await transaction.rollback();
          return res.render('users/create', { 
            layout: 'layouts/template', 
            errors: [{ msg: 'Failed create user' }] 
          });            
        }

        await transaction.commit();
        res.redirect('/users?status=success')
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

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
    const transaction = await sequelize.transaction();
    try {
      const id = req.params.id;
      const user = await User.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction });

      if (!user) {
        return res.status(404).render('errors/404', { layout: false });
      }

      const result = await user.destroy({ transaction });

      if (!result) {
        await transaction.rollback();
        return res.render('users/read', { 
          layout: 'layouts/template', 
          errors: [{ msg: 'Failed delete user' }] 
        });        
      }

      await transaction.commit();
      res.redirect('/users?status=success');
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.render('users/read', { 
        layout: 'layouts/template', 
        errors: [{ msg: error }] 
      });
    }
}

const EditByUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id},
      include: [{ model: Dept, as: 'dept', attributes: ['dept_code', 'dept_desc'] }]
    });

    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    res.render('users/account', {
      layout: 'layouts/template',
      title: 'Edit User',
      user
    });
  } catch (error) {
    res.status(500).render('errors/500', { layout: false });
  }
};

const UpdateByUser = async (req, res) => {
    const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { vname, email } = req.body;
    
    const user = await User.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction});
    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    const result = await user.update({
                  vname,
                  email,
                }, { transaction });

    if (!result) {
      await transaction.rollback();
      return res.render('users/account', { 
        layout: 'layouts/template', 
        errors: [{ msg: 'Failed update user' }] 
      });        
    }

    await transaction.commit();
    return res.render('users/account', { 
            layout: 'layouts/template', 
            title: 'Edit User',
            success: 'User updated successfully!',
            user: { id, vname, email }, 
        });   
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      const departments = await Dept.findAll();
      return res.render('users/account', { 
        layout: 'layouts/template', 
        title: 'Edit User',
        errors: [{ msg: error }],
        user: req.body,
        departments
      });
  }
};

module.exports = { GetAllUser, CreateUser, EditUser, UpdateUser, UpdateByUser, StoreUser, RemoveUser, EditByUser }
