#!/usr/bin/env node
var fs = require('fs'),
	args = require('argsparser').parse(),
	colors = require('colors'),
	slave = require('../slave-driver'),

	// optional flags
	module = process.argv[2] || 'test',
	uninstallAfter = args['--uninstall-after'] || false,
	reportResults = args['--report-results'] || false;

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

slave.ready(function(run) {
	var s = run(module, {
		reportResults: reportResults,
		uninstallAfter:uninstallAfter
	});

	console.log('Running with NodeJS: ' + process.version);
	var out = '', err = '';

	s.on('out', function(data) {
		out += data;
		console.log('[test.js:out]:\n'.green + data);
	});

	s.on('err', function(err, data) {
		err += data;
		console.log('[test.js:err]:\n'.red + err, data);
	});

	s.on('complete', function(code, sig) {
		fs.writeFile('./logs/' + module + '.out.log', out);
		fs.writeFile('./logs/' + module + '.err.log', err);
		console.log('test completed with code:', code, 'sig:', sig);
	});
});
