var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var data = require('./notCredible.json');
var whois = require('./node_modules/whois-json/index.js');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: 'API_KEY'
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// ==============================================
var router = express.Router();

// Allow cross origins requests, needed for local testing
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// middleware that logs all requests
router.use(function(req, res, next){
	console.log('Something is happening.');

	// go to the next route!
	next();
});

// test route
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/checkURL', function(req, res) {
	var url = req.body;
	console.log(url.URL);
	var found = searchList(url.URL);
	res.status(200);
	res.set('Content-Type', 'text/plain');
	res.send(JSON.stringify(found));
});

router.post('/domainAge', function(req, res) {
	var url = req.body;
	var response = whois(url, function(err, result) {
		console.log(JSON.stringify(result, null, 2))
	});

});
// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);

function response(status, reason)
{
	this.status = status;
	this.reason = reason;
}

var searchList = function(url){
	var res = new response(true, "This site was found in a database of known fake news sites.");
	if(data.sites['' + url] == undefined)
	{
		res.status = false;
		res.reason = "This site was not found in a database of known fake news sites. Proceed with caution";
	}
	return res;
}

var findAge = function(response) {
	var res, yearCreated, age;
	year = response.creationDate.substring(0, 4);
	age = 2017 - parseInt(year);
	if (age > 10) {
		
	}
	else if (5 < age <= 10) {

	}
	else if (2 < age <= 5) {

	}
	else if (1 < age <= 2) {

	}
	else if (age <= 1) {

	}
	else {

	}
	return res;
}
