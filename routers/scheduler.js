const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../model/userModel.js');
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bodyParser = require('body-parser');

// const conn =  require("../model/model.js");
const { fetchCalendars, fetchEvents, fetchCalendar, createEvent } = require("../strategies/calendarAPI.js");
const jwtinit = require("../strategies/strategy.js");

// Change the algo to rs356 with async tokens
const decodeAccessToken = (token) => jwt.verify(token, process.env.JWT_KEY);
jwtinit(Users);

const SchedulerRouter = express.Router();
SchedulerRouter.use(bodyParser.urlencoded({ extended: true }));
SchedulerRouter.use(bodyParser.json());
SchedulerRouter.use(bodyParser.text());
SchedulerRouter.use(passport.initialize())
SchedulerRouter.use(passport.session());
SchedulerRouter.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
SchedulerRouter.use('/', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.ppic = req.user.ppic;
    }
    next();
});
SchedulerRouter.use('/', async (req, res, next) => {
    if (req.query.token) {
        try {
            let { googleID } = decodeAccessToken(req.query.token);
            let user = await Users.findOne({ googleID }).exec();
            let { data } = await fetchCalendars(user.token);
            next();
        } catch (e) {
            if (e.response && e.response.data.error && e.response.data.error.status == 'UNAUTHENTICATED') {
                // Send authenticates
                await Users.deleteOne({ googleID:decodeAccessToken(req.query.token).googleID }).exec();
                res.status(403).json({err:'Token expired'});
            }else{
                console.log(e);
                res.status(402).json({err:'Tokenmisshapen'});
            }
        }
    }else{
        next();
    }

});
SchedulerRouter.get('/calendars/list', async (req, res) => {
    let token = req.query.token;

    let { googleID } = decodeAccessToken(token);
    let user = await Users.findOne({ googleID }).exec();
    if (user) {
        let { data, status } = await fetchCalendars(user.token);
        if (status == 200) {
            res.json({ msg: "User found", items: data });
        } else {
            res.status(502).json({ msg: "API error" });
        }
    } else {
        res.status(501).json({ msg: 'No user found' });
    }
});
SchedulerRouter.put('/calendar/get', async (req, res) => {
    let token = req.query.token; let calID = decodeURIComponent(req.body.cid);
    let { googleID } = decodeAccessToken(token);
    let user = await Users.findOne({ googleID }).exec();
    if (user) {
        let { data, status } = await fetchCalendar(user.token, calID);
        if (status == 200) {
            res.json({ msg: "User found", items: data });
        } else {
            res.status(502).json({ msg: "API error" });
        }
    } else {
        res.status(501).json({ msg: 'No user found' });
    }
});
SchedulerRouter.put('/calendar/events', async (req, res) => {
    let token = req.query.token;
    console.log(decodeAccessToken(token))
    let { googleID } = decodeAccessToken(token);
    let user = await Users.findOne({ googleID }).exec();
    let calID = req.body.cid ? decodeURIComponent(req.body.cid) : user.calendarID;
    if (user) {
        let { data, status } = await fetchEvents(user.token, calID);
        if (status == 200) {
            res.json({ msg: "User found", items: data });
        } else {
            res.status(502).json({ msg: "API error" });
        }
    } else {
        res.status(501).json({ msg: 'No user found' });
    }
});
SchedulerRouter.post('/events/create', async (req, res) => {
    let token = req.query.token;
    let body = req.body;
    let sdatetime = (new Date(body.sdate + ' ' + body.stime)).toISOString();
    let edatetime = (new Date(body.edate + ' ' + body.etime)).toISOString();

    let { googleID } = decodeAccessToken(token);
    let user = await Users.findOne({ googleID }).exec();
    if (user) {
        console.log({ sdatetime, edatetime, summary: body.summary });
        let { data, status } = await createEvent(user.token, user.calendarID, { sdatetime, edatetime, summary: body.summary });
        if (status == 200) {
            res.json({ msg: "User created" });
        } else {
            res.status(502).json({ msg: "API error" });
        }
    } else {
        res.status(501).json({ msg: 'No user found' });
    }
});

module.exports = SchedulerRouter;