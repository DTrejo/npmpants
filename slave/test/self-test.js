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
		, 'date-utils'

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
		, 'jquery-tmpl-jst'
		]

	// for faster testing
	// , modules = [ 'date-utils' ]
	, tasks = [];

require('colors');

console.log('Running with NodeJS: ' + process.version);
slave.ready(function(run) {
	modules.forEach(function(module) {
		tasks.push(function(cb) {
			var s = run(module, { reportResults: false })
				, out = '', err = '';

			s.on('out', function(data) {
				out += data;
			});

			s.on('err', function(err, data) {
				err += data;
			});

			s.on('complete', function(code, sig) {
				fs.writeFile('./logs/' + module + '.out.log', out);
				fs.writeFile('./logs/' + module + '.err.log', err);
				// console.log('[test.js:out]:\n%s'.green, out);
				// console.log('[test.js:err]:\n%s'.red, err);
				// console.log('test completed with code:', code, 'sig:', sig);
				cb(null, { name: module, passed: code, err: err, out: out });
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
				if (r.passed === false) {
					console.log(r.name, 'passed?', r.passed);
					console.log('stdout:', r.out);
					console.log('stderr:', r.err);
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
