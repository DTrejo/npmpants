require('./slave-driver').ready(function(run) {
  var PORT = 11235;
  require('http').createServer(function (req, res) {
    if (req.url !== '/favicon.ico') {
      run(req.url.substr(1));
    }
    res.end('');
  }).listen(PORT);
  console.log('Slave server listening on http://localhost:'+PORT);
});
