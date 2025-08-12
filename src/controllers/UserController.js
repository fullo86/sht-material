const fs = require('node:fs');
const path = require('node:path');
const { sequelize } = require('../models');
const db = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { resizeImage } = require('../helper/ResizeImage');
const ActivityLog = require('../helper/ActivityLog');
const User = db.User;
const Dept = db.Dept;
const Role = db.Role;

const GetAllUser = async (req, res) => {
  const users = await User.findAll();

  return res.render('users/read', {
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

    return res.render('users/edit', {
      layout: 'layouts/template',
      title: 'Edit User',
      user,
      departments,
      query: req.query       
    });
  } catch (error) {
    return res.status(500).render('errors/500', { layout: false });
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
      req.flash("status", "failed");    
      req.flash("msg", "Failed Update User.");      
      return res.redirect(`/users/edit/${user.id}`);
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `User Update Data for (${result.dataValues.empno}) ${result.dataValues.vname}`
    });

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "User Successfully Updated.");
    return res.redirect(`/users`);
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

  return res.render('users/create', {
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
                    }, { transaction });

        if (!result) {
          await transaction.rollback();
          req.flash("status", "failed");    
          req.flash("msg", "Create User Failed.");                        
          return res.redirect('/users/create');
        }

        ActivityLog({
          account: req.session?.user?.account,
          username: req.session?.user?.vname,
          msgs: `Created New User (${result.dataValues.empno}) ${result.dataValues.vname}`
        });

        await transaction.commit();
        req.flash("status", "success");    
        req.flash("msg", "User Successfully Created.");              
        return res.redirect('/users')
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
        req.flash("status", "failed");    
        req.flash("msg", "Deleted User Failed.");                
        return res.redirect('/users');
      }

      ActivityLog({
        account: req.session?.user?.account,
        username: req.session?.user?.vname,
        msgs: `Delete User (${result.dataValues.empno}) ${result.dataValues.vname}`
      });

      await transaction.commit();
      req.flash("status", "success");    
      req.flash("msg", "User Successfully Deleted.");        
      return res.redirect('/users');
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
    const image = req?.file?.path;
    
    const user = await User.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction});
    if (!user) {
      return res.status(404).render('errors/404', { layout: false });
    }

      user.vname = vname;
      user.email = email

    if (image) {
      removeFile(user.image);
      user.image = image;
      await resizeImage(user.image);      
    }      

    const result = await user.save({ transaction });    

    if (!result) {
      await transaction.rollback();
      removeFile(result.dataValues.image);
      req.flash("status", "failed");    
      req.flash("msg", "Failed Update Account."); 
      res.redirect(`/user/account/edit/${user.id}`)
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `Account Updated (${result.dataValues.empno}) ${result.dataValues.vname}`
    });

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "Account Successfully Updated."); 
    res.redirect(`/user/account/edit/${user.id}`)
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
      where: { id }});

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
  const transaction = await sequelize.transaction();

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
    const result = await user.update({ passw: hashedNew }, { transaction });
    if (!result) {
      await transaction.rollback();
      req.flash("status", "failed");    
      req.flash("msg", "Change Password Failed."); 
      return res.redirect(`/user/account/change-password/${id}`);
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `(${result.dataValues.empno}) ${result.dataValues.vname} has Changed Password`
    });

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "Password Successfully changed.");    
    return res.redirect(`/user/account/change-password/${id}`);
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
  const fileName = path.basename(pathway);

  if (fileName !== 'default.png') {
    const fullPath = path.join(__dirname, '../../', pathway);
    fs.unlink(fullPath, () => {});
  }
}

module.exports = { 
  GetAllUser, 
  CreateUser, 
  EditUser, 
  UpdateUser, 
  UpdateByUser, 
  StoreUser, 
  RemoveUser, 
  EditByUser, 
  ChangePassword, 
  UpdatePasswordByUsr
}
