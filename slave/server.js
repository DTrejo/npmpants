require('./slave-driver').ready(function(run) {
	require('http').createServer(function (req, res) {
		if (req.url !== '/favicon.ico') {
			run(req.url.substr(1));
		}
		res.end('');
	}).listen(11235);
});
