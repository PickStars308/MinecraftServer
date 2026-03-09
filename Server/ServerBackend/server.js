const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();


const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    maxAge: 86400
};
app.use(cors(corsOptions));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/', routes);

app.listen(3003, () => {
    console.log("后台服务地址：http://localhost:3003");
});
