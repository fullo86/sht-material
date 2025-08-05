const fs = require('node:fs');
const path = require('node:path');
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
      departments,
      query: req.query       
    });
  } catch (error) {
    res.status(500).render('errors/500', { layout: false });
  }
};

const UpdateUser = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const departments = await Dept.findAll();

  if (!errors.isEmpty()) {
    return res.render('users/edit', {
      layout: 'layouts/template',
      title: 'Edit User',
      errors: errors.array(),
      user: { ...req.body, id },
      departments
    });
  }
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
    res.redirect(`/users/edit/${user.id}?status=success`);
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
    query: req.query,
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
        const image = "public\images\default.png"

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
        res.redirect('/users/create?status=success')
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

    const departments = await Dept.findAll();

    res.render('users/account', {
      layout: 'layouts/template',
      title: 'Edit User',
      user,
      departments,
      query: req.query             
    });
  } catch (error) {
    res.status(500).render('errors/500', { layout: false });
  }
};

const UpdateByUser = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const departments = await Dept.findAll();

  if (!errors.isEmpty()) {
    return res.render('users/account', {
      layout: 'layouts/template',
      title: 'Edit User',
      errors: errors.array(),
      user: { ...req.body, id },
      departments
    });
  }

    const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { vname, email } = req.body;
    const image = req.file.path;
    
    const user = await User.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction});
    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

      user.vname = vname;
      user.email = email
      removeFile(user.image);
      user.image = image;
      const result = await user.save({ transaction });    

    // const newImage = removeFile(user.image)
    // newImage = image
    // const result = await user.update({
    //               vname,
    //               email,
    //               newImage
    //             }, { transaction });

    if (!result) {
      await transaction.rollback();
      return res.render('users/account', { 
        layout: 'layouts/template', 
        errors: [{ msg: 'Failed update user' }] 
      });        
    }

    await transaction.commit();
    res.redirect(`/user/account/edit/${user.id}?status=success`)
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

const ChangePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id}});

    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

    res.render('users/change-password', {
      layout: 'layouts/template',
      title: 'Change Password',
      user,
      query: req.query       
    });
  } catch (error) {
    res.status(500).render('errors/500', { layout: false });
  }
}

const UpdatePasswordByUsr = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);
  const user = await User.findOne({where: {id}});

  if (!user) {
    return res.status(404).render('errors/404', { layout: false });
  }

  if (!errors.isEmpty()) {
    return res.render('users/change-password', {
      layout: 'layouts/template',
      title: 'Change Password',
      errors: errors.array(),
      user,
      query: {}
    });
  }

  const { oldPswd, newPswd } = req.body;

  try {
    const match = await bcrypt.compare(oldPswd, user.passw);
    if (!match) {
      return res.render('users/change-password', {
        layout: 'layouts/template',
        title: 'Change Password',
        errors: [{ msg: 'Old password is incorrect' }],
        user,
        query: {}
      });
    }

    const hashedNew = await bcrypt.hash(newPswd, 12);
    await user.update({ passw: hashedNew });

    return res.redirect(`/user/account/change-password/${id}?status=success`);
  } catch (err) {
    return res.render('users/change-password', {
      layout: 'layouts/template',
      title: 'Change Password',
      errors: [{ msg: err.message }],
      user,
      query: {}
    });
  }
};

const removeFile = (pathway) => {
  const fileName = path.basename(pathway); // ambil hanya 'default.png'

  if (fileName !== 'default.png') {
    const fullPath = path.join(__dirname, '../../', pathway);
    fs.unlink(fullPath, () => {}); // tidak perlu tangani error
  }
}
module.exports = { GetAllUser, CreateUser, EditUser, UpdateUser, UpdateByUser, StoreUser, RemoveUser, EditByUser, ChangePassword, UpdatePasswordByUsr }
