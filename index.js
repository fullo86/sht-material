require('dotenv').config();
const express = require('express');
const app = express();
const multer = require('multer');
const path = require('node:path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const allRoutes = require('./src/routes/index.js');
const { fileConfig, Ext } = require('./src/config/Image.js');
const upload = multer({ storage: fileConfig, fileFilter: Ext });
const port = process.env.PORT;

app.use(cors());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/template');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(upload.single('image'));

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use((req, res, next) => {
  const user = req.session.user;

  res.locals.id = user ? user.id : null;
  res.locals.role_id = user ? user.role : null;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', allRoutes);

app.use((req, res) => {
  res.status(404).render(
    'errors/404', { 
      layout: false 
    }
  );
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).render(
    'errors/500', { 
      layout: false 
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
