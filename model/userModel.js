const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://shivang4110:Shivang4110@cluster0.eb2igke.mongodb.net/datanexify?retryWrites=true&w=majority&appName=Cluster0");

const userSchema = mongoose.Schema({
    token:String,
    pic:String,
    googleID:String,
    calendarID:String
});

const Users = mongoose.model('Users',userSchema);

module.exports = Users;