var args = require("argsparser").parse(),
	request = require('request'),
	JSONStream = require('JSONStream'),
	slave = require('../slave'),
	testSuite = args["--suite"] ? args["--suite"] : false,
	semver = require('semver'),
	async = require('async')
;

/**
	* Some magic function that takes the URL of a tarball. Should
	* download, extract, run tests, and whatnot.
	*/

if (testSuite) {
	console.log("Only running tests for " + testSuite);
}

var parser = JSONStream.parse(['rows', /./]),
	req = request({
		url: 'http://search.npmjs.org/api/_all_docs?include_docs=true&limit=100'
	})
;
tasks = [];
parser.on('data', function(data) {
	tasks.push(async.apply(processDoc, data));
	console.log('pushed', data.id);
});
parser.on('end', function() {
	async.parallel(tasks, function(err) {
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
				var s = slave.run(el.id, { reportResults: false });
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
