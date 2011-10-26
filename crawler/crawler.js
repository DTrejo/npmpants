var args = require("argsparser").parse(),
	request = require('request'),
	JSONStream = require('JSONStream'),
	slave = require('../slave'),
	semver = require('semver'),
	async = require('async'),
	util = require('util'),

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
	console.log("YES --suite only running tests for " + testSuite);
}
if (reportResults) {
	console.log('YES --reportResults to couchDB.');
} else {
	console.log('NOT --reportResults to couchDB.');
}
if (uninstallAfter) {
	console.log('YES --uninstall-after each package is tested');
} else {
	console.log('NOT --uninstall-after each package is tested');
}
if (speed == 'series') {
	console.log('YES --series tests run in <', speed, '>');
} else {
	console.log('NO --series tests run in <', speed, '>');
}

var parser = JSONStream.parse(['rows', /./]),
	url = 'http://search.npmjs.org/api/_all_docs?include_docs=true';

if (limit) {
	url += '&limit=' + limit;
	console.log('Limiting to', limit, 'modules.');
} else {
	console.log('No --limit specified; fetching ALL docs from npm\'s couchdb!');
}
slave.ready(function(run) {
	var req = request({ url: url }),
		tasks = [];

	parser.on('data', function(data) {
		tasks.push(async.apply(processDoc, run, data));
		if (tasks.length % 10 == 0) util.print('.');
		// console.log('pushed', data.id);
	});
	parser.on('end', function() {
		console.log('\ndone fetching data from search.npmjs.org');
		async[speed](tasks, function(err) {
			if (err) console.log(err.stack);
			console.log('done running tests!', tasks.length);
		});
	});
	console.log('Each dot stands for 10 modules queued for execution');
	req.pipe(parser);
});

function processDoc(run, el, cb) {
	if (!el.id || !el.doc.versions) {
		return cb(null);
	}
	var latest = latestRelease(el.doc);

	if (latest && latest.scripts && latest.scripts.test !== undefined) {
		if (testSuite === false || latest.scripts.test.indexOf(testSuite) > -1) {
			return process.nextTick(function () {
				var s = run(el.id, {
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
