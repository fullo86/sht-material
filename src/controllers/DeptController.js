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

module.exports = { GetAllDepts }