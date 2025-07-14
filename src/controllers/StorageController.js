const db = require('../models');
const Storage = db.Storage;

const GetAllStorage = async (req, res) => {
    const storage = await Storage.findAll()
    res.render('storage/read', {
        layout: "layouts/template",
        title: 'Storage Data',
        storage
    })
}

const createUser = async (req, res) => {

}

module.exports = { GetAllStorage, createUser }