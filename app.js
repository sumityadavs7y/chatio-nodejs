const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
const app = express();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.use(cors());

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

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
        console.log(process.env.PORT);
        const server = app.listen(process.env.PORT || 8080);
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Client Connected');
        });
    }).catch(err => console.error(err));