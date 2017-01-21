module.exports = {
function response(cred, credreason, age, agedesc)
{
	this.cred = cred;
	this.credreason = credreason;
	this.age = age;
	this.agedesc = agedesc;
},
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
},

var searchList = function(url){
	var res = new response(true, "This site was found in a database of known fake news sites.");
	if(data.sites['' + url] == undefined)
	{
		res.cred = false;
		res.credreason = "This site was not found in a database of known fake news sites. Proceed with caution";
	}
	return res;
}
}