const bcrypt = require('bcrypt')
const db = require('../models');
const User = db.User;

const login = async (req, res) => {
  const { account, passw } = req.body;

  try {
    const user = await User.findOne({ where: { account } });
    if (!user) {
      return res.render('auth/login', { layout: false, error: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(passw, user.passw);
    if (!isMatch) {
      return res.render('auth/login', { layout: false, error: 'Incorrect Password' });
    }

    // Simpan data user di session
    req.session.user = {
      id: user.id,
      vname: user.vname,
      role: user.role_id
    };

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('auth/login', { layout: false, error: 'Terjadi kesalahan server' });
  }
};

const showLogin = (req, res) => {
  res.render('auth/login', {
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
    res.redirect('/login');
  });
};

module.exports = { login, showLogin, logout };
