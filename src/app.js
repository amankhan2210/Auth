const express = require('express');
const authRouter = require('./routes/auth.routes');
const morgan = require('morgan');
const cookieParser = require("cookie-parser")

const app = express();
require('dotenv').config();
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser())
app.use('/api/auth',authRouter);

module.exports = app;