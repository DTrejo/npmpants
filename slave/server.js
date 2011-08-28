var addToQueue;
var server = require('http').createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    return;
  }
  addToQueue(req.url.substr(1));
  res.writeHead({'Content-Type': 'text/html'});
  res.end('');
});
server.listen(11235);

addToQueue = function (name) {
  require('./').run(name);
};
