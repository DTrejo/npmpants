#!/usr/bin/env node
var fs = require('fs')
	, async = require('async')
	, slave = require('../slave-driver')
	, npm = require('npm')
	, path = require('path')

	// iffy means it might not work on all platforms, but works on most. So sad.
	// If it doesn't say iffy, it *should* be passing.
	// TODO test certain modules and make sure they FAIL.
	, modules = [
		// expresso
			'diff' // iffy
		, 'dnode-protocol' // iffy

		// vows
		// , 'date-utils' broken b/c of time zone change in core?

		// tap
		, 'semver'

		// node *.js
		, 'Journaling-Hash'
		, 'abbrev'
		, 'argsparser'

		// nodeunit
		, 'json-streamify' // iffy


		// make test
		, 'jsontool'


		// whiskey
		// none really that don't do silly things in their test command.

		// jasmine
		// , 'jquery-tmpl-jst' // can't use b/c it needs require.paths.
		]

	// for faster testing
	// , modules = [ 'date-utils' ]
	, tasks = [];

require('colors');

console.log('Running with NodeJS: ' + process.version);
slave.ready(function(run) {
	modules.forEach(function(module) {
		tasks.push(function(cb) {
			var s = run(module, { reportResults: false });

			s.on('complete', function(err, result) {

				fs.writeFile('./logs/' + module + '.out.log', result.stdout);
				fs.writeFile('./logs/' + module + '.err.log', result.stderr);
				// console.log('test completed with code:', code, 'sig:', sig);
				result.name = module;
				cb(null, result);
			});
		});
	});

	async.parallel(tasks, function(err, results) {
		if (err) throw err;

		testViaNpm(printResults);
		function printResults(err) {
			console.log();
			console.log('===pants runner===');
			var win = true;
			results.forEach(function(r) {
				// only print if it failed!
				if (r.win === false) {
					console.log(r.name, 'passed?', r.win,
						// how many passed:
						(r.passed && r.total) ? r.passed + '/' + r.total : '');
					console.log('stdout:', r.stdout);
					console.log('stderr:', r.stderr);
					win = false;
				}
			});
			if (win) {
				console.log('Success! All modules passed. Full list:');
				console.log(modules.join(', '));
			}
			process.exit(0);
		}
	});
});

function testViaNpm(callback) {
	var npmConfig = {
			loglevel: 'silent',
			cwd: path.join(__dirname, '..', 'test_modules', 'node_modules')
		}
	, cliTasks = [];

	console.log(npmConfig.cwd);

	npm.load(npmConfig, function (err) {
		if (err) throw err;

		modules.forEach(function(module) {
			cliTasks.push(function(cb) {
				npm.commands.test([path.join(npmConfig.cwd, module)], function(err, d) {
					cb(null, { err: err, data: d, name: module });
				});
			});
		});

		async.parallel(cliTasks, function(err, results) {
			if (err) throw err;
			console.log();
			console.log('===npm test===');
			results.forEach(function(r) {
				console.log('passed?', !r.err, ':', r.name);
				if (r.err) {
					console.log(r.err);
				}
			});
			callback(null, results);
		});
	});
};
