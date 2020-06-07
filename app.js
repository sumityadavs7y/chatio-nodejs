const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();
const app = express();

const authRoutes = require('./routes/auth');

app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    // console.error(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
})

mongoose.connect(process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(result => {
        console.log('DATABASE CONNECTED');
        app.listen(+process.env.PORT | 8080);
    }).catch(err => console.error(err));