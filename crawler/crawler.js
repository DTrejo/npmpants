var args = require("argsparser").parse(),
	request = require('request'),
	JSONStream = require('JSONStream'),
	slave = require('../slave'),
	semver = require('semver'),
	async = require('async'),

	// optional flags
	testSuite = args["--suite"] || false,
	uninstallAfter = args["--uninstall-after"] || false, // not sure if this works
	limit = args['--limit'] || false,
	reportResults = args['--reportResults'] || false
	speed = args['--series'] == true ? 'series' : 'parallel';
;

/**
	* Some magic function that takes the URL of a tarball. Should
	* download, extract, run tests, and whatnot.
	*/

if (testSuite) {
	console.log("YES only running tests for " + testSuite);
}
if (reportResults) {
	console.log('YES reporting results to couchDB.');
} else {
	console.log('NOT reporting results to couchDB.');
}
if (uninstallAfter) {
	console.log('YES uninstalling each package after testing');
} else {
	console.log('NOT uninstalling each package after testing');
}
console.log('Running tests in <', speed, '>');

var parser = JSONStream.parse(['rows', /./]),
	url = 'http://search.npmjs.org/api/_all_docs?include_docs=true';

if (limit) {
	url += '&limit=' + limit;
	console.log('Limiting to', limit, 'modules.');
} else {
	console.log('No --limit specified; fetching ALL docs from npm\'s couchdb!');
}

var req = request({ url: url }),
	tasks = [];

parser.on('data', function(data) {
	tasks.push(async.apply(processDoc, data));
	// console.log('pushed', data.id);
});
parser.on('end', function() {
	async[speed](tasks, function(err) {
		if (err) console.log(err.stack);
		console.log('done running tests!', tasks.length);
	});
});
req.pipe(parser);

function processDoc(el, cb) {
	if (!el.id || !el.doc.versions) {
		return cb(null);
	}
	var latest = latestRelease(el.doc);

	if (latest && latest.scripts && latest.scripts.test !== undefined) {
		if (testSuite === false || latest.scripts.test.indexOf(testSuite) > -1) {
			return process.nextTick(function () {
				var s = slave.run(el.id, {
					reportResults: reportResults,
					uninstallAfter: uninstallAfter
				});
				s.on('complete', function(win, reason) {
					var r = '';
					if (reason) r = '>' + reason.replace(/\n/g, ' ') + '<';
					console.log(el.id + "@" + latest.version, win, r);
					cb(null);
				});
			});
		} else { return cb(null); }
	} else { return cb(null); }
};

function latestRelease(pack) {
	if (!pack || !pack.versions) return undefined;
	var versions = Object.keys(pack.versions),
		latestVersion = versions.sort(semver.rcompare).pop();
	return pack.versions[latestVersion];
};
