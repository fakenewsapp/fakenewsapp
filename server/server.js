var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var data = require('./notCredible.json');
var whois = require('./node_modules/whois-json/index.js');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: '08ba5e537d6334cb5105f139e001fdaa795fab49'
});

var parameters = {
  extract: 'entities, concepts, keywords, doc-emotion',
  emotion: 1,
  sentiment: 1,
  maxRetrieve: 1,
  url: ''
};


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Allow cross origins requests, needed for local testing
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// ROUTES FOR OUR API
// ==============================================
var router = express.Router();

router.post('/checkURL', function(req, res) {
	var url = req.body;
	var age = findAge(url.URL);
	parameters.url = url.URL;
	alchemy_language.combined(parameters, function (err, response) {
	  if (err)
	    console.log('error:', err);
	  else
	    console.log(JSON.stringify(response, null, 2));
	});
	
	setTimeout(function(){
	var found = searchList(url.URL);
	
	var resp = new response(found.cred, found.credreason, age.age, age.agedesc);

	res.status(200);
	res.set('Content-Type', 'text/plain');
	res.send(JSON.stringify(resp));}, 1000);
});

// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);

// Useful functions
// ==============================================
function response(cred, credreason, age, agedesc)
{
	this.cred = cred;
	this.credreason = credreason;
	this.age = age;
	this.agedesc = agedesc;
}

var searchList = function(url){
	var res = new response(true, "This site was found in a database of known fake news sites.");
	if(data.sites['' + url] == undefined)
	{
		res.cred = false;
		res.credreason = "This site was not found in a database of known fake news sites. Proceed with caution";
	}
	return res;
}

var findAge = function(url) {
	var res = new response("", "", "", "");
	//NEED TO ADD ERROR HANDLING
	whois(url, function(err, result) {
		var i = 0;
		year = result.creationDate.substring(0, 4);
		age = 2017 - parseInt(year);
		res.age = age;
		if (age > 5) {
			res.agedesc = "This site is greater than 5 years old. Not very suspicious.";
		}
		else if (2 < age <= 5) {
			res.agedesc = "This site is less than 5 years old. I wouldn't worry.";
		}
		else if (1 < age <= 2) {
			res.agedesc = "This site is less than 2 years old. I would start to worry.";
		}
		else{
			res.agedesc = "This site is less than a year old! I would do some research before I trust this site.";
		}
	});
	return res;
}
