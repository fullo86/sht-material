const db = require("../models");
const Dept = db.Dept;

const GetAllDepts = async (req, res) => {
    const departments = await Dept.findAll();

    res.render('departments/read', {
        layout: 'layouts/template',
        title: 'Departments',
        departments
    })
}

const CreateDept = async (req, res) => {
    res.render('departments/create', {
        layout: 'layouts/template',
        title: 'Add Department',
    })
}

const StoreDept = async (req, res) => {
    try {
        const { dept_code, dept_desc } = req.body

        if (!dept_code || dept_code == "") {
            throw new Error("Dept Code Required")
        }

        if (!dept_desc || dept_desc == "") {
            throw new Error("Dept Code Required")
        }

        await Dept.create({ dept_code, dept_desc })

        res.redirect('/departments?status=success')
    } catch (error) {
        res.render('departments/create', {
            layout: 'layouts/template',
            title: 'Add Department',
            error: error.message,
        });
    }    
}

const EditDept = async (req, res) => {
    try {
        const id = req.params.id
        const dept = await Dept.findOne( {where: { id}});

        if (!dept) {
            throw new Error('Department not found!')
        }

        res.render('departments/edit', {
            layout: 'layouts/template',
            title: 'Edit Department',
            dept
        })        
    } catch (error) {
        console.log(error)
    }
}

const UpdateDept = async (req, res) => {
  try {
    const id = req.params.id;
    const { dept_code, dept_desc } = req.body;

    const dept = await Dept.findOne({ where: { id }});
    if (!dept) {
      return res.status(404).render('errors/404', { layout: false });
    }

    await dept.update({ dept_code, dept_desc });

    res.redirect('/departments?status=success');
  } catch (error) {
    console.error(error);
    res.status(500).render('errors/500', { layout: false });
  }
};

const RemoveDept = async (req, res) => {
  try {
    const id = req.params.id;
    const dept = await Dept.findOne({ where: { id }});

    if (!dept) {
      return res.status(404).render('errors/404', { layout: false });
    }

    await dept.destroy();
    res.redirect('/departments?status=success');
  } catch (error) {
    console.error(error);
    res.status(500).render('errors/500', { layout: false });
  }
};

module.exports = { GetAllDepts, CreateDept, StoreDept, EditDept, UpdateDept, RemoveDept }