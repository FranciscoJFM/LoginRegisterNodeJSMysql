const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const winston = require('winston');
const expressWinston = require('express-winston');

dotenv.config();

const app = express();

// Logging middleware
app.use(expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  )
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//const registerRouter = require('./register');
//app.use('/register', registerRouter);
app.use(app.router);
routes.initialize(app);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/auth', async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;

  if (!user || !password) {
    return res.send('Please enter username and password!');
  }

  try {
    const [results] = await pool.query('SELECT * FROM user_login WHERE user = ? AND password = ?', [user, password]);

    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.username = user;
      return res.redirect('/home');
    }

    res.send('Incorrect username and/or password!');
  } catch (error) {
    console.error('Error querying database:', error.stack);
    res.status(500).send('Server error');
  }
});

app.get('/home', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/');
  }

  res.send('Welcome back, ' + req.session.username + '!');
});

