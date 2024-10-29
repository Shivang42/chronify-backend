const express = require('express');
const auth = require('./routers/auth.js');
const scheduler = require('./routers/scheduler.js');

const app = express();
require('dotenv').config();

app.use('/auth',auth);
app.use('/scheduler',scheduler);


app.listen(process.env.APP_PORT,()=>{
    console.log('Listening on' + process.env.APP_PORT);
});
