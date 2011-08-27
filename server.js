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

  // test data via http://www.cpantesters.org/distro/A/a2pdf.json
  res.send({
    ostext: "GNU/Linux"
  , status: "PASS"
  , osversion: "2.6.35-28-generic"
  , state: "pass"
  , osname: "linux"
  // , guid: "1484db3e-cee7-11e0-b293-00fe369c8ecd"
  // , id: "15127442"
  , platform: "x86_64-linux"
  , version: "1.13"
  , dist: "a2pdf"
  , csspatch: "unp"
  , distribution: "a2pdf"
  , perl: "5.8.9"
  , distversion: "a2pdf-1.13"
  , cssperl: "rel"
  , date: "201108250654"
  });
});

console.log('Your highness, at your service:'.yellow
  + ' http://localhost:%d'.magenta, PORT);

app.listen(PORT);
