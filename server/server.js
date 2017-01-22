var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var data = require('./notCredible.json');
var whois = require('./node_modules/whois-json/index.js');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: 'a8d547d6889cb71053e6d955026bca31616fb65b'
});

var parameters = {
  extract: 'concepts, keywords, doc-emotion',
  emotion: 1,
  sentiment: 1,
  maxRetrieve: 8,
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
	var result = url.URL.replace(/.*?:\/\//g, "");
	if (result.includes("www")) {
		result = result.split("www.");
		result = result[1];
	}
	if(result.includes("/")){
		result = result.split("/");
		result = result[0];
	}
	var age = findAge(result);
	//insert watson here
	var mrwatson = watsonPlease(url.URL);
	setTimeout(function(){
	var found = searchList(result);
	var siteAge = age.age / 20;
	var indicator = trainNet(mrwatson.docemotions.anger, mrwatson.docemotions.joy, mrwatson.docemotions.disgust, mrwatson.docemotions.fear, mrwatson.docemotions.sadness, siteAge);
	var resp = new response(found.cred, found.credreason, age.age, age.agedesc, mrwatson.keywords, mrwatson.docemotions, mrwatson.concepts, indicator);
	
	res.status(200);
	res.set('Content-Type', 'text/plain');
	res.send(JSON.stringify(resp));}, 5000);
});

// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);

// Useful functions
// ==============================================
function response(cred, credreason, age, agedesc, keywords, docemotions, entities, indicator)
{
	this.cred = cred;
	this.credreason = credreason;
	this.age = age;
	this.agedesc = agedesc;
	this.keywords = keywords;
	this.docemotions = docemotions;
	this.indicator = indicator;
}

var searchList = function(url){
	var res = new response(true, "This site was found in a database of known fake news sites. Proceed with caution.");
	if(data.sites['' + url] == undefined)
	{
		res.cred = false;
		res.credreason = "This site was not found in a database of known fake news sites.";
	}
	return res;
}

var findAge = function(url) {
	var res = new response();
	//NEED TO ADD ERROR HANDLING
	whois(url, function(err, result) {
		if(err || result == undefined)
		{
			res.age = "not found";
			res.agedesc = "not found";
			return res;
		}
		var i = 0;
		year = result.creationDate.substring(0, 4);
		age = 2017 - parseInt(year);
		res.age = age;
		if (age > 5) {
			res.agedesc = "This site is greater than 5 years old. Not very suspicious.";
		}
		else if (2 < age <= 5) {
			res.agedesc = "This site is less than 5 years old. I would start to worry.";
		}
		else if (1 < age <= 2) {
			res.agedesc = "This site is less than 2 years old. Seems suspicious.";
		}
		else{
			res.agedesc = "This site is less than a year old! I would do some research before I trust this site.";
		}
	});
	return res;
}

var watsonPlease = function(url){
	var res = new response();
	parameters.url = url;
	alchemy_language.combined(parameters, function (err, response) {
	  if (err)
	    console.log('error:', err);
	  else
	  	//console.log(response);
	    res.keywords = response.keywords;
		res.docemotions = response.docEmotions;
		res.concepts = response.concepts;
		//res.entities = response.entities;
	});
	return res;
}


// NEURAL NET
var synaptic = require('synaptic');
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

/*var neuralNet = function(anger, joy, disgust, fear, sadness, age){
	var age = new Layer(1);
	var emotion = new Layer(5);
	var result = new Layer(1);
	var connection = emotion.project(age);
	result.gate(connection, Layer.gateType.Output_Gate);
	var learningRate = .1;

	for (var i = 0; i < 20000; i++)
	{
		// anger, joy, disgust, fear, sadness
		emotion.activate([.6, .1, .6, .6, .6]);
		// very low age
		age.activate([0]);

		result.activate();
		result.propagate(learningRate, [1]);
	}

	for (var i = 0; i < 20000; i++){
		emotion.activate([.1, .6, .1, .1, .1]);
		age.activate([1]);
		result.activate();
		result.propagate(learningRate, [0]);
	}

	emotion.activate([anger, joy, disgust, fear, sadness]);
	age.activate([age]);
	result.activate();
	console.log(result);
}*/

//neuralNet(.6, .1, .2, .6, .2, .1);
//neuralNet(.6, .1, .2, .6, .2, .9);

var trainNet = function(anger, joy, disgust, fear, sadness, age){
	var myNet = new Architect.Perceptron(6, 4, 1);

	var trainingSet = [
	 {
	    input: [.6, .1, .2, .6, .2, .1],
	    output: [1]
	  },
	  {
	    input:  [.6, .1, .2, .6, .2, 1],
	    output: [0]
	  },
	  {
	    input:  [.8, .2, .8, .8, .5, .5],
	    output: [1]
	  }
	]
	var trainingOptions = {
	  rate: .1,
	  iterations: 20000,
	  error: .005,
	}

	myNet.trainer.train(trainingSet, trainingOptions);

	//console.log(myNet.activate([.5, .3, .2, .1, .4, .1]));
	// console.log(myNet.activate([.9, .3, .9, .8, .4, .9]));
	// console.log(myNet.activate([.3, .1, .3, .5, .6, .3]));
	// console.log(myNet.activate([.3, .3, .3, .3, .3, .7]));
	var res = myNet.activate([anger, joy, disgust, fear, sadness, age]);
	console.log(res);
	return res;
}
