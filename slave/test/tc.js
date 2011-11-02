// https://gist.github.com/1331671
var fs = require('fs')
var stdout = fs.readFileSync('./tap.log', 'utf8');
var TapConsumer = require("tap-consumer");
var tc = new TapConsumer;

tc.on('data', function(c) {
	console.log('test result>',c);
});

tc.on('end', function(err, total, passed) {
	if (err) console.log(err.stack);
	console.log(total, passed);
	// total is the total number of passed tests
	// passed is an array of ids of the tests that passed
});

tc.write(stdout);
tc.end();
console.log('done?');
