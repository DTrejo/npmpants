var request = require('request'),
	config = require('../config'),
	self = {}
	db = undefined; // set by .init()

// converts a module name to a github URL for that module, if it exists.
// caches a map of moduleName --> url.
var nameToUrl;
function toUrl(moduleName) {
	if (nameToUrl === undefined) {
		console.time('generating toUrl map');
		nameToUrl = {};
		// lazily create the map. first request will be slow, but it's ok.
		var data = require('../public/json/packages.json').data,
		packages = data.packages,
		urls = data.urls,
		i = 0,
		link = '',
		pName;

		for (i = 0; i < packages.length; i++) {
			pName = packages[i][0];
			nameToUrl[pName] = 'https://github.com/' + urls[i];
		}
		console.timeEnd('generating toUrl map');
	}
	// use the map
	return nameToUrl[moduleName];
}

// goes to npmjs.org and returns the package.json for a given module.
function getPackageJSON(moduleName, cb) {
	console.time('getPackageJSON');
	var url = 'http://search.npmjs.org/api/' + moduleName;
	request(url, function (err, response, body) {
		if (!err && response.statusCode === 200) {
			console.timeEnd('getPackageJSON');
			cb(null, JSON.parse(body));
		} else {
			console.timeEnd('getPackageJSON');
			cb(err);
		}
	});
}

//
// get information on a single module, including test results and package.json
//
self.modules = function (req, res, next) {
	var name = req.params.name;
	getPackageJSON(name, function (err, packageJSON) {
		if (err) console.log(err.stack);
		packageJSON = packageJSON || {};

		var githubURL = toUrl(name);
		packageJSON.repository = packageJSON.repository || {};
		packageJSON.repository.github = githubURL;

		db.get(name, function (err, results) {
			console.log(results);
			if (err || err && (err.error === 'not_found')) {
				packageJSON.error = err;
				res.send(packageJSON);
			} else {
				packageJSON['test-results'] = results;
				res.send(packageJSON);
			}
		});
	});
};

self.results = function (req, res) {
	var path = '/results/_all_docs?include_docs=true';
		url = 'http://' + config.couchHost + ':' + config.couchPort + path;
	request.get(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			res.send(JSON.stringify(JSON.parse(body).rows));
		} else {
			res.send({ error: err });
		}
	});
};

module.exports = self;
module.exports.init = function(app, dbHandle) {
	//
	// API
	//
	db = dbHandle;
	app.get('/api/results', self.results);
	app.get('/api/modules/:name', self.modules);
};
