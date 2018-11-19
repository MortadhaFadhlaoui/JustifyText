// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for User
let User = new Schema({
    email: String,
    limitWords: { type: Number, default: 0 },
    startDate: Date,
},{
    collection: 'users'
});

module.exports = mongoose.model('User', User);