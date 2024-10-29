const passport = require("passport");
const axios = require('axios');
const {fetchCalendars} = require('./calendarAPI.js');
const GoogleStrategy = require("passport-google-oauth2");
const {config} = require("dotenv");
const path = require('path');

config({path:path.join(__dirname,'../.env')});

var opts = {
    clientID:process.env.clientID,
    clientSecret:process.env.clientSecret,
    callbackURL:process.env.callbackURL
};
const createCalendar = async (token)=>{
    let {data,status} = await axios.post(`https://www.googleapis.com/calendar/v3/calendars`,{
        summary:'datanexify'
    },{headers:{'Authorization':`Bearer ${token}`}});
    if(status != 200){
        throw new Error(`Coudn't create our calendar`);
    }else{
        return data.id;
    }
}
const jwtinit = (Users)=>{
    passport.serializeUser((user, done) => {
        return done(null, {user})
    });
    passport.deserializeUser((user, done) => {
        return done(null,user);
    })
    passport.use('google',new GoogleStrategy(opts,
        async function(accessToken,refreshToken,profile,done){
            // Here add functionality for token
            
            try{
                let currUser = await Users.findOne({googleID:profile.id});
                if(currUser){
                    done(null,{googleID:currUser.googleID,pic:currUser.pic});
                }
                else{
                    let { data, status } = await fetchCalendars(accessToken);
                    data = data.filter((cal)=>(cal.summary=='datanexify'));
                    let calendarID;
                    if(data.length>0){
                        calendarID = data[0].id;
                    }else{
                        calendarID = await createCalendar(accessToken);
                    }
                    let cuser = await Users.create({token:accessToken,googleID:profile.id,pic:profile.picture,calendarID});
                    done(null,{googleID:cuser.googleID,pic:cuser.pic});
                }
            }
            catch(e){
                console.log(e.toString());
                done(null,false);
            }
        }
    ));
    
}
module.exports = jwtinit;
