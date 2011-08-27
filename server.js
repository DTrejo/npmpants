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

//
// These routes only work if a static file has not already been served.
//
app.get('/', function(req, res, next) {
  res.end('Hello, World');
});

console.log('Your highness, at your service:'.yellow
  + ' http://localhost:%d'.magenta, PORT);

app.listen(PORT);
