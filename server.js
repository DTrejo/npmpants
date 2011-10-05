// boring requires
var auth = require("connect-auth"),
  config = require("./config"),
  connect = require("connect"),
  express = require('express'),
  app = express.createServer(),
  colors = require('colors'),
  fs = require('fs'),
  path = require("path"),
  //  nko = require('nko')('fxFY6qeBj18FyrA2'),
  _ = require('underscore'),
  cradle = require('cradle'),
  github = require("github"),
  url = require("url"),

  // routes
  api = require('./api'),

  // cradle stuff
  connection = new(cradle.Connection)(config.couchHost, config.couchPort, {
    cache: true,
    raw: false,
    auth: { username: config.couchUser, password: config.couchPass }
  }),
  db = connection.database('results'),
  // constants
  PORT = parseInt(process.env.PORT, 10) || 8000
;

//
// API
//
app.get('/api/results', api.results);
app.get('/api/modules/:name', api.modules);

//
// NowJS
//
require('./realtime').init(app);

//
// Configuration
//
app.register(".html", require("./lib/weldlate"));
// app.use(connect.middleware.logger());
app.use(connect.cookieParser());
app.use(connect.session({
  secret: 'baahlblbah',
  store: new connect.session.MemoryStore({ reapInterval: -1 })
}));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

//
// Templating
//
app.set('view engine', 'html');
// app.set('views', o.root + '/1');
app.set('view options', {layout: true});

var bootTime = new Date;

app.get("/*", function(req, res) {
	var file = req.url.substr(1);
	file = path.join(__dirname, file === "" ? "public/index.html" : "public/" + file);

	// basic test showing weld based temlpates
	if(file.substr(-4) === "html") {
		res.render(file, {
			bootTime: "Last start: " + bootTime
		});
	} else {
		// send to static router
		return req.next();
	}
});

console.log('Your highness, at your service:'.yellow +
  ' http://localhost:%d'.magenta, PORT);
app.listen(PORT);
