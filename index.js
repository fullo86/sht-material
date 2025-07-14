require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const allRoutes = require('./src/routes/index.js');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/template');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', allRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// require('dotenv').config()
// const express = require('express');
// const app = express();
// const path = require('node:path');
// const expressLayouts = require("express-ejs-layouts");
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const port = process.env.PORT || 3000;
// const { connectDatabase } = require('./src/config/Database.js');
// const allRoutes = require('./src/routes/index.js');

// app.use(cors());
// app.use(cookieParser());

// app.use('/public', express.static(path.join(__dirname, 'public')));
// app.set("view engine", "ejs");
// app.set('views', path.join(__dirname, 'src', 'views'));
// app.use(expressLayouts);
// app.set('layout', 'layouts/template');

// app.use('/', allRoutes);

// const startServer = async () => {
//   try {
//     await connectDatabase(); 
//     app.listen(port, () => {
//       console.log(`Connection Success & Server Listening on Port ${port}`);
//     });
//   } catch (err) {
//     console.error('Connection Failed:', err.message);
//   }
// };

// startServer();
