const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/', routes);

app.listen(process.env.PORT, () => {
    console.log("后台服务地址：http://localhost:" + process.env.PORT);
});
