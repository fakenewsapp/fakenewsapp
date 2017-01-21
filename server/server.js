var express = require('express');
var app = express();

var port = process.env.PORT || 8000;

// ROUTES FOR OUR API
// ==============================================
var router = express.Router();

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
// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);