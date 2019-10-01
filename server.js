let express = require('express');
let mongodb = require('mongodb');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let cors = require('cors');

let shortUrl = require("./models/shortUrl");

//app.use(bodyParser.json);
app.use(cors());

//connect to database
let myURI = "";
process.env.MONGO_URI=myURI;
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/shortUrls');

/** Serve an HTML file */
let absoluteHTMLPath = __dirname + "/views/index.html";
app.get("/", function(req, res) {
res.sendFile(absoluteHTMLPath);
});

/** Serve static assets  */
let absoluteAssetsPath = __dirname + "/public";
app.use(express.static(absoluteAssetsPath));

//create the database entry
app.get('/new/:urlToShorten(*)', (req, res, next)=>{
	//es6 var urlToShorten = req.params.urlToShorten
	let {urlToShorten} = req.params;

	//Regess for url
	let regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

	if (regex.test(urlToShorten)===true) {
		let short = Math.floor(Math.random()*100000).toString();
		
			let data = new shortUrl(
				{
					originalUrl: urlToShorten,
					shorterUrl: short
				}
			);

			data.save((err)=>{
			    if (err) {
			      return res.res.send('Error saving to database');
			    }
			  });
		
		return res.json(data);
	}else{
			let data = new shortUrl(
				{
					originalUrl: urlToShorten,
					shorterUrl: 'Invalid URL'
				}
			);
			return res.json(data);
		}
});

//Query database and forward to originalURL
app.get('/:urlToForward', (req, res, next)=>{
	let compareShorterUrl = req.params.urlToForward;
	shortUrl.findOne({'shorterUrl':compareShorterUrl}, (err, data)=>{
    if (err) {
      return res.send("Error reading database");
    }
    let redirector = new RegExp("^(http|https)://","i");
    let strToCheck = data.originalUrl;
    	if (redirector.test(strToCheck)) {
    		res.redirect(301, strToCheck);
    	}else{
    		res.redirect(301, 'http://'+strToCheck);
    	}
  });
});

//listen for node
app.listen(process.env.PORT || 3000,()=>{
  console.log('Listening for server.');
});

