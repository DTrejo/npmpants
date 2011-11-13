#!/usr/bin/env node
var args = require("argsparser").parse(),
	request = require('request'),
	JSONStream = require('JSONStream'),
	slave = require('../slave'),
	semver = require('semver'),
	async = require('async'),
	util = require('util'),

	// optional flags
	testSuite = args["--suite"] || false,
	uninstallAfter = args["--uninstall-after"] || false,
	limit = args['--limit'] || false,
	range = args['--range'] || false,
	reportResults = args['--report-results'] || false,
	speed = args['--series'] == true ? 'series' : 'parallel';

// most conservative usage:
// 		./crawler/crawler.js --range --series --uninstall-after --report-results
//
// for testing this mode:
// 		./crawler/crawler.js --range --series --uninstall-after --limit 10

if (testSuite) {
	console.log("YES --suite only running tests for " + testSuite);
}
if (reportResults) {
	console.log('YES --report-results to couchDB.');
} else {
	console.log('NOT --report-results to couchDB.');
}
if (uninstallAfter) {
	console.log('YES --uninstall-after each package is tested (& cache clean)');
} else {
	console.log('NOT --uninstall-after each package is tested (& cache clean)');
}
if (speed == 'series') {
	console.log('YES --series tests run in <', speed, '>');
} else {
	console.log('NO --series tests run in <', speed, '>');
}

var URL = 'http://search.npmjs.org/api/_all_docs?include_docs=true';
if (limit) {
	URL += '&limit=' + limit;
	console.log('YES --limit to', limit, 'modules.');
} else {
	console.log('No --limit specified; fetching ALL docs from npm\'s couchdb!');
}

// let's get started.
slave.ready(function(run) {
	if (range) {
		console.log('YES --range, doing incremental ranges of packages until done');
		runWithRange(run);
	} else {
		console.log('NO --range, starting at 0, going until limit or last package');
		test(run);
	}
});

function runWithRange(run) {
	var numbers = '0123456789';
	var letters = 'abcdefghijklmnopqrstuvwxyz';
	var alphanumeric = (numbers + letters.toUpperCase() + letters).split('');

	var tasks = alphanumeric.map(function(letter, i, list) {
		var o = { start: letter, end: alphanumeric[i + 1] };
		return async.apply(test, run, o);
	});
	// var tasks = [
	// 	function (cb) { test(run, {start: '0', end: '1'}, cb); },
	// 	function (cb) { test(run, {start: '7', end: '8'}, cb); },
	// 	function (cb) { test(run, {start: 'z', end: undefined}, cb); }
	// ];
	async.series(tasks, function(err, results) {
		if (err) console.log(err.stack);
		console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
		console.log('OFFICIALLY ALL DONE.');
		console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
	});
};

function test(run, o, cb) {
	var parser = JSONStream.parse(['rows', /./]);
	o = o || {};
	if (o.start) {
		// get the rest of things when on the 'z'
		if (o.start !== 'z') o.end = '&endkey=' + encodeURIComponent('"'+o.end+'"');
		else o.end = '';
		o.start = '&startkey=' + encodeURIComponent('"'+o.start+'"');
	} else {
		o.start = '';
		o.end = '';
	}

	var url = URL + o.start + o.end;
	var req = request({ url: url });
	var tasks = [];

	parser.on('data', function(data) {
		tasks.push(async.apply(processDoc, run, data));
		if (tasks.length % 10 == 0) util.print('.');
		// console.log('pushed', data.id);
	});
	parser.on('end', function() {
		console.log('\ndone fetching data from', url);
		async[speed](tasks, function(err) {
			if (err) console.log(err.stack);
			var text = [ o.start, o.end ].map(decodeURIComponent).join(' to ');
			console.log('downloaded & tried to test', tasks.length,
				'modules: [', text, ']');
			console.log('==========================================================');
			cb && cb();
		});
	});
	console.log('Each dot stands for 10 modules queued for execution');
	req.pipe(parser);
}

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
				s.on('complete', function(err, info) {
					var r = '';
					if (info.message) r = '>' + info.message.replace(/\n/g, ' ') + '<';
					console.log(el.id + "@" + latest.version, info.win, r);
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
