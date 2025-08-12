const { sequelize } = require('../models');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../models');
const PIC = db.PIC;
const Dept = db.Dept;
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { resizeImage } = require('../helper/ResizeImage');
const ActivityLog = require('../helper/ActivityLog');

const GetAllPic = async (req, res) => {
  const pics = await PIC.findAll()
  const departments = await Dept.findAll();

  return res.render('pic/read', {
    layout: 'layouts/template',
    title: 'List PIC',
    departments,
    pics
  });
}

const CreatePic = async (req, res) => {
  const departments = await Dept.findAll();

  return res.render('pic/create', {
    layout: 'layouts/template',
    title: 'Add PIC',
    departments,
    errors: [],
    query: req.query,
    oldData: {}
  });
};

const StorePic = async (req, res) => {
    const departments = await Dept.findAll();
    const transaction = await sequelize.transaction();

    try {
        const errors = validationResult(req);
        errors.throw();

        const { vname, empno, sex, dept_id } = req.body;

        const manuf = 'J';
        const storeh = 'JS';
        let imagePath = null;
        if (req.file) {
          imagePath = "public/images/" + req.file.filename;
          await resizeImage(imagePath);
        }

        const image = imagePath;
        const result = await PIC.create({
                      id: uuidv4(),
                      manuf,
                      empno,
                      vname,              
                      sex,
                      dept_id,
                      storeh,
                      image
                    }, { transaction });

        if (!result) {
          await transaction.rollback();
          req.flash("status", 'failed');
          req.flash("msg", "Failed to Create PIC.");              
          return res.redirect('/pic')
        }

        ActivityLog({
          account: req.session?.user?.account,
          username: req.session?.user?.vname,
          msgs: `Created New Pic (${result.dataValues.empno}) ${result.dataValues.vname}`
        });

        await transaction.commit();        
        req.flash("status", 'success');
        req.flash("msg", "PIC Successfully Created.");    
        return res.redirect('/pic')
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      let errors = [];

      if (error.errors) {
        errors = error.errors
      }

      return res.render('pic/create', {
        layout: 'layouts/template',
        title: 'Add PIC',
        departments,
        errors,
        oldData: req.body
      });
    }    
}

const EditPic = async (req, res) => {
  try {
    const id = req.params.id;
    const pic = await PIC.findOne({
      where: { id}, 
      include: [
        {
          model: Dept,
          as: 'dept'
        }
      ]});

    if (!pic) {
      return res.status(404).render('errors/404', { layout: false });
    }

    const departments = await Dept.findAll();

    res.render('pic/edit', {
      layout: 'layouts/template',
      title: 'Edit PIC',
      pic,
      departments,
      query: req.query       
    });
  } catch (error) {
    return res.status(500).render('errors/500', { layout: false });
  }
};

const UpdatePIC = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const departments = await Dept.findAll();

  if (!errors.isEmpty()) {
    return res.render('pic/edit', {
      layout: 'layouts/template',
      title: 'Edit PIC',
      errors: errors.array(),
      pic: { ...req.body, id },
      departments
    });
  }
    const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { vname, sex, dept_id } = req.body
    const image = req?.file?.path;

    const pic = await PIC.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction});

    if (!pic) {
      return res.status(404).render('errors/404', { layout: false });
    }

    if (image) {
      removeFile(pic.image);
      pic.image = image;
      await resizeImage(pic.image);      
    }      

    const result = await pic.update({
                  vname,
                  dept_id,
                  sex,
                  image: pic.image
                }, { transaction });

    if (!result) {
      await transaction.rollback();
      req.flash("status", "failed");    
      req.flash("msg", "Failed Update PIC.");      
      return res.redirect(`/pic/edit/${pic.id}`);
    }

    ActivityLog({
      account: req.session?.user?.account,
      username: req.session?.user?.vname,
      msgs: `Update PIC Data (${result.dataValues.empno}) ${result.dataValues.vname}`
    });

    await transaction.commit();
    req.flash("status", "success");    
    req.flash("msg", "PIC Data Successfully Updated.");
    return res.redirect(`/pic`);
  } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      const departments = await Dept.findAll();
      return res.render('pic/edit', { 
        layout: 'layouts/template', 
        title: 'Edit PIC',
        errors: [{ msg: error }],
        pic: req.body,
        departments
      });
  }
};

const RemovePic = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const id = req.params.id;
      const pic = await PIC.findOne({ where: { id }, lock: transaction.LOCK.UPDATE, transaction });

      if (!pic) {
        return res.status(404).render('errors/404', { layout: false });
      }

      const result = await pic.destroy({ transaction });

      if (!result) {
        await transaction.rollback();
        req.flash("status", 'failed');
        req.flash("msg", "Failed to Delete PIC.");              
        return res.redirect('/pic')
      }

      ActivityLog({
        account: req.session?.user?.account,
        username: req.session?.user?.vname,
        msgs: `Delete PIC Data (${result.dataValues.empno}) ${result.dataValues.vname}`
      });

      await transaction.commit();
      req.flash("status", 'success');
      req.flash("msg", "PIC Successfully Deleted.");    
      return res.redirect('/pic');
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.render('pic/read', { 
        layout: 'layouts/template', 
        errors: [{ msg: error }] 
      });
    }
}

const removeFile = (pathway) => {
  const fileName = path.basename(pathway);

  if (fileName !== 'default.png') {
    const fullPath = path.join(__dirname, '../../', pathway);
    fs.unlink(fullPath, () => {});
  }
}

module.exports = { GetAllPic, CreatePic, StorePic, EditPic, UpdatePIC, RemovePic }