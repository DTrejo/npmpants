var express = require('express')
  , app = express.createServer()
  , colors = require('colors')
  , fs = require('fs')
  , nko = require('nko')('fxFY6qeBj18FyrA2')
  , PORT = parseInt(process.env.PORT, 10) || 8000
  ;

// match app routes before serving static file of that name
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// returns html
app.get('/modules/:name', function(req, res, next) {
  var name = req.params.name;
  res.end('Hello, lookin at: ' + name);
});

// returns json
app.get('/api/modules/:name', function(req, res, next) {
  var name = req.params.name;
  res.send({ some: 'json', name: name });
});

console.log('Your highness, at your service:'.yellow
  + ' http://localhost:%d'.magenta, PORT);

app.listen(PORT);
