// boring requires
var auth = require("connect-auth"),
  config = require("./config"),
  connect = require("connect"),
  express = require('express'),
  http = require('http'),
  app = express.createServer(),
  colors = require('colors'),
  fs = require('fs'),
  nowjs = require('now'),
  //  nko = require('nko')('fxFY6qeBj18FyrA2'),
  _ = require('underscore'),
  request = require('request'),
  cradle = require('cradle'),
  github = require("github"),
  url = require("url"),

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

// match app routes before serving static file of that name

app.use(connect.middleware.logger());
app.use(connect.cookieParser());
app.use(connect.session({
  secret: 'baahlblbah',
  store: new connect.session.MemoryStore({ reapInterval: -1 })
}));

app.use(express.static(__dirname + '/public'));
app.use(app.router);

// converts a module name to a github URL for that module, if it exists.
// caches a map of moduleName --> url.
var nameToUrl;
function toUrl(moduleName) {
  if (nameToUrl === undefined) {
    console.time('generating toUrl map');
    nameToUrl = {};
    // lazily create the map. first request will be slow, but it's ok.
    var data = require('./public/json/packages.json').data,
    packages = data.packages,
    urls = data.urls,
    i = 0,
    link = '',
    pName;

    for (i = 0; i < packages.length; i++) {
    pName = packages[i][0];
    nameToUrl[pName] = 'https://github.com/' + urls[i];
    }
    console.timeEnd('generating toUrl map');
  }
  // use the map
  return nameToUrl[moduleName];
}

// goes to npmjs.org and returns the package.json for a given module.
function getPackageJSON(moduleName, cb) {
  console.time('getPackageJSON');
  var url = 'http://search.npmjs.org/api/' + moduleName;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.timeEnd('getPackageJSON');
      cb(null, JSON.parse(body));
    } else {
      console.timeEnd('getPackageJSON');
      cb(error);
    }
  });
}

app.get('/api/modules/:name', function (req, res, next) {
  var name = req.params.name;
  getPackageJSON(name, function (err, packageJSON) {
    if (err) console.log(err);
    packageJSON = packageJSON || {};

    var githubURL = toUrl(name);
    packageJSON.repository = packageJSON.repository || {};
    packageJSON.repository.github = githubURL;

    db.get(name, function (err, results) {
      if(err)
        console.log(err);
      console.log(results);
      if (err || err && (err.error === 'not_found')) {
        packageJSON.error = err;
        res.send(packageJSON);
      } else {
        packageJSON['test-results'] = results;
        res.send(packageJSON);
      }
    });
  });
});

app.get('/api/results', function (req, res) {
  get(config.couchHost, config.couchPort, '/results/_all_docs?include_docs=true', function (data) {
    res.send(JSON.stringify(JSON.parse(data).rows));
  });
});


// Stream from our db for realtime test results updates to clients
var everyone = nowjs.initialize(app);

var lastDbSeq = 0;

// Get our db's last change id
console.log("Fetching changes from: " + config.couchHost);
get(config.couchHost, config.couchPort || 5984, '/results/_changes', function (data) {
  console.log("Database returned: ");
  console.log(data);
  data = JSON.parse(data);
  lastDbSeq = data.last_seq - 10;
  getDbChanges();
});

function getDbChanges() {
  http.get({host: config.couchHost,
    port: 80,
    path: '/results/_changes?feed=continuous&since=' + (lastDbSeq)
  }, function (res) {
    var cur = '';
    res.on('data', function (chunk) {
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        var newSeq = data.seq || data.last_seq;

        if (newSeq > lastDbSeq) {
          lastDbSeq = newSeq;
        }

        if (data.hasOwnProperty('id')) {
          updateResults(data);
        }

        cur = '';
      } catch (e) {}
    });

    res.on('end', getDbChanges);
    res.on('error', getDbChanges);
  });
}

function updateResults(data) {
  get(config.couchHost, config.couchPort, '/results/'+data.id, function(res){
    res = JSON.parse(res);
    if (res.hasOwnProperty('error')) {
      console.log(data.id, res);
    } else {
      console.log('Updating results for ' + res.name);
      // Update object
      updateRecentTests(res);
    }
  });
}



// Stream from NPM db for great realtime updates

var lastNpmSeq = 0;

// Gets last change id

get('search.npmjs.org', 80, '/api/_changes', function (data){
  data = JSON.parse(data);
  lastNpmSeq = data.last_seq - 10 || 0;
  getNpmChanges();
});


function getNpmChanges() {
  http.get({
    host: 'search.npmjs.org',
    port: 80,
    path: '/api/_changes?feed=continuous&since=' + (lastNpmSeq)
  }, function (res) {
    var cur = '';
    res.on('data', function (chunk) {
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        var newSeq = data.seq === undefined ? data.last_seq : data.seq;
        if (newSeq && newSeq > lastNpmSeq) {
          lastNpmSeq = newSeq;
        }
        console.log('lastnpmseq is', lastNpmSeq);
        if (data.hasOwnProperty('id')) {
          updateModule(data);
        }
        cur = '';
      } catch (e) {}
    });
    res.on('end', getNpmChanges);
    res.on('error', getNpmChanges);
  });
}

function updateModule(data) {
  console.log('Updating ' + data.id);
  get('search.npmjs.org', 80, '/api/' + data.id, function (res) {
    res = JSON.parse(res);
    if (res.hasOwnProperty('error')) {
      console.log(data, res);
    } else {
      // Update object
      /*everyone.count(function(count){
        if(count > 0) {
          everyone.now.projectUpdated(data);
        }
      });*/
      // alertSlaves(data.id);
      updateRecent(res);
    }
  });
}

function alertSlaves(data) {
  // Tell slaves to rerun tests for module specified in data
  get('127.0.0.1', 11235, '/' + data, function () {}); // only solaris at the moment!
  // TODO keep track of remote slaves. yepppp.
}


function get(host, port, path, cb) {
  http.get({
    host: host,
    port: port,
    path: path
  }, function (res) {
    var cur = '';
    res.on('data', function (chunk) {
      cur += chunk.toString();
    });
    res.on('end', function () {
      cb(cur);
    });
  });
}


// Keep buffer of 10 recent updates

var recent = [];
var recentTests = [];

function updateRecent(data) {
  if (recent.map(function (a) {return a.name;}).indexOf(data.name) + 1) {
    return;
  }
  if (recent.length > 10) {
    recent.shift();
  }
  recent.push(data);
  everyone.count(function (count) {
    if (count > 0) {
      everyone.now.addToRecent([data]);
    }
  });
}

function updateRecentTests(data) {
  if (recentTests.map(function (a) {return a.name;}).indexOf(data.name) + 1) {
    return;
  }
  if (recentTests.length > 10) {
    recentTests.shift();
  }
  recentTests.push(data);
  everyone.count(function (count) {
    if (count > 0) {
      everyone.now.addToRecentTests([data]);
    }
  });
}

nowjs.on('connect', function () {
  console.log('Client connected!');
  this.now.addToRecent(recent);
  this.now.addToRecentTests(recentTests);
});

console.log('Your highness, at your service:'.yellow +
  ' http://localhost:%d'.magenta, PORT);
app.listen(PORT);
