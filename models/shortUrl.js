//Template or structure or model of document for shortURL
//Require mongoose
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let urlSchema = new Schema({
	originalUrl: String,
	shorterUrl: String,
}, {timestamps: true});

let ModelClass = mongoose.model('shortUrl', urlSchema);
module.exports = ModelClass;