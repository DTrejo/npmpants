var slaveDriver = require('./slave-driver');

require('http').createServer(function (req, res) {
	if (req.url !== '/favicon.ico') {
		slaveDriver.run(req.url.substr(1));
	}
	res.end('');
}).listen(11235);
