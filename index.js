// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const homeRoutes = require('./home');
const authRoutes = require('./routes/auth');
const registerRoutes = require('.');
const { createConnection } = require('mysql2/promise');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: "yD#~e/\9B]jJtq$f",
    resave: true,
    saveUninitialized: true
}));

createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: "1234567",
    database: "social_mattevan"

}).then(connection => {
    console.log('Connected to database');

    app.use('/', homeRoutes);
    app.use('/auth', authRoutes(connection));
    app.use('/register', registerRoutes(connection));

    app.listen(PORT, function() {
        console.log(`Server listening on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to database', error);
    process.exit(1);
});
