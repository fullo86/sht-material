const { sequelize } = require('../models');
const { validationResult } = require('express-validator');
const ActivityLog = require('../helper/ActivityLog');
const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const Dept = db.Dept;

const GetAllDepts = async (req, res) => {
    const departments = await Dept.findAll();

    return res.render('departments/read', {
        layout: 'layouts/template',
        title: 'Departments',
        departments
    })
}

const CreateDept = async (req, res) => {
    return res.render('departments/create', {
        layout: 'layouts/template',
        title: 'Add Department',
        query: req.query    
    })
}

const StoreDept = async (req, res) => {
  const transaction = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw errors;
        }

        const { dept_code, dept_desc } = req.body

        const result = await Dept.create({ 
          id: uuidv4(),
          dept_code, 
          dept_desc }, 
          { transaction })

        if (!result) {
          await transaction.rollback();
          req.flash("status", "failed");    
          req.flash("msg", "Create Department Failed.");                        
          return res.redirect('/departments');
        }

        ActivityLog({
          account: req.session?.user?.account,
          username: req.session?.user?.vname,
          msgs: `Create New Department (${result.dataValues.dept_code}) ${result.dataValues.dept_desc} `
        });

        await transaction.commit();
        req.flash("status", "success");    
        req.flash("msg", "Successfully Create New Department.");                        
        return res.redirect('/departments')
    } catch (error) {
        if (!transaction.finished) {
          await transaction.rollback();
        }

        let errors = [];

        if (error.errors) {
          errors = error.errors
        }
        return res.render('departments/create', {
            layout: 'layouts/template',
            title: 'Add Department',
            errors
        });
    }    
}

const EditDept = async (req, res) => {
    try {
        const id = req.params.id
        const dept = await Dept.findOne( {where: { id}});

        if (!dept) {
          return res.status(404).render('errors/404', { layout: false });
        }

        return res.render('departments/edit', {
            layout: 'layouts/template',
            title: 'Edit Department',
            dept,
            query: req.query       
        })        
    } catch (error) {
        return res.render('departments', { 
          layout: 'layouts/template', 
          errors: [{ msg: error }] 
        });
    }
}

const UpdateDept = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { dept_code, dept_desc } = req.body;

    const dept = await Dept.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction });
    if (!dept) {
      return res.status(404).render('errors/404', { layout: false });
    }

    const result = await dept.update({ dept_code, dept_desc }, { transaction });
    
    if (!result) {
      await transaction.rollback();
      req.flash("status", "failed");    
      req.flash("msg", "Failed to Update Department.");                        
      return res.redirect(`/department/edit/${dept.id}`)
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `Department Update for (${result.dataValues.dept_code}) ${result.dataValues.dept_desc} `
    });    

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "Department Data Successfully Updated.");                        
    return res.redirect(`/departments`);
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.render('departments/edit', { 
        layout: 'layouts/template', 
        errors: [{ msg: error }] 
      });
  }
};

const RemoveDept = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;

    const dept = await Dept.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction });

    if (!dept) {
      return res.status(404).render('errors/404', { layout: false });
    }

    const result = await dept.destroy({ transaction });

    if (!result) {
      await transaction.rollback();
      req.flash("status", "failed");    
      req.flash("msg", "Delete Department Failed.");                        
      return res.redirect('/departments');
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `Deleted Department (${result.dataValues.dept_code}) ${result.dataValues.dept_desc} `
    });    

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "Department Successfully Deleted .");
    return res.redirect('/departments');
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.render('departments/read', { 
        layout: 'layouts/template', 
        errors: [{ msg: error }] 
      });
  }
};

module.exports = { GetAllDepts, CreateDept, StoreDept, EditDept, UpdateDept, RemoveDept }