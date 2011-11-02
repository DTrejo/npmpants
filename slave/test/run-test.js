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
		uninstallAfter: uninstallAfter
	});

	console.log('Running with NodeJS: ' + process.version);

	s.on('complete', function(err, result) {
		fs.writeFile('./logs/' + module + '.out.log', result.stdout);
		fs.writeFile('./logs/' + module + '.err.log', result.stderr);
		console.log(result.stdout);
		console.log(result.stderr);
		console.log('test completed with code:', result.win, 'message:',
			result.message);
	});
});
