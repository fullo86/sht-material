const bcrypt = require('bcrypt')
const db = require('../models');
const User = db.User;

const login = async (req, res) => {
  const { account, passw } = req.body;

  try {    
    const user = await User.findOne({ where: { account } });
    if (!user) {
      return res.render('auth/login', { layout: false, errors: [{msg: 'Account not found'}] });
    }

    const isMatch = await bcrypt.compare(passw, user.passw);
    if (!isMatch) {
      return res.render('auth/login', { layout: false, errors: [{ msg: 'Incorrect Password' }] });
    }

    req.session.user = {
      id: user.id,
      account: user.account,
      vname: user.vname,
      role: user.role_id
    };
    return res.redirect('/dashboard');
  } catch (error) {
      return res.render('auth/login', {
        layout: false,
        errors: [{msg: error}]
      });    
  }
};

const showLogin = (req, res) => {
  return res.render('auth/login', {
    layout: false,
    title: 'Login',
    error: null
  });
};


const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    return res.redirect('/login');
  });
};

module.exports = { login, showLogin, logout };
