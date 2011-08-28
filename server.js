// boring requires
var express = require('express')
  , http = require('http')
  , app = express.createServer()
  , colors = require('colors')
  , fs = require('fs')
  , nowjs = require('now')
  , nko = require('nko')('fxFY6qeBj18FyrA2')
  , _ = require('underscore')
  , request = require('request')
  , cradle = require('cradle')

  // cradle stuff
  , connection = new(cradle.Connection)('hollaback.iriscouch.com', 80, {
      cache: true
    , raw: false
    , auth: { username: 'hollaback', password: 'momasaidknockyouout' }
  })
  , db = connection.database('testresults')

  // constants
  , PORT = parseInt(process.env.PORT, 10) || 8000
  ;

// match app routes before serving static file of that name
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// converts a module name to a github URL for that module, if it exists.
// caches a map of moduleName --> url.
var nameToUrl;
function toUrl(moduleName) {
  if (nameToUrl === undefined) {
    nameToUrl = {};
    // lazily create the map. first request will be slow, but it's ok.
    var data = require('./public/json/packages.json').data
      , packages = data.packages
      , urls = data.urls
      , i = 0
      , link = ''
      , pName;

    for (i = 0; i < packages.length; i++) {
      pName = packages[i][0];
      nameToUrl[pName] = 'https://github.com/' + urls[i];
    }
  }
  // use the map
  return nameToUrl[moduleName];
}

// goes to npmjs.org and returns the package.json for a given module.
function getPackageJSON(moduleName, cb) {
  var url = 'http://search.npmjs.org/api/' + moduleName;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      cb(null, JSON.parse(body));
    } else {
      cb(error);
    }
  });
}

// Goes to our own couchDB and gets the test results for this module.
// make the view if it doesn't already exist, then query it.
function getTestResults(name, callback) {
  console.time('getTestResults');
  queryView(function(err, res) {
    if (err) {
      if (err.error === 'not_found' || err.reason === 'missing') {
        createView(queryView);
      } else {
        console.timeEnd('getTestResults');
        throw err;
      }
    } else {
      callback(err, res);
    }
  });

  function createView(cb) {
    console.log('creating couchDB view for', name);
    var options = {};
    // the view has the same name as the module
    options[name] = {
      // TODO: security
      map: 'function(doc) {\
        if (doc.name === "' + name + '") {\
          emit(doc._id, doc);\
        }\
      }'
    }
    db.save('_design/modules', options);
  }
  function queryView(cb) {
    // TODO: security
    db.view('modules/' + name, function (err, res) {
      console.timeEnd('getTestResults');
      cb(err, res);
    });
  }
}

app.get('/api/modules/:name', function (req, res, next) {
  var name = req.params.name;
  getPackageJSON(name, function (err, packageJSON) {
    if (err) console.log(err);
    packageJSON = packageJSON || {};

    // this doesn't YET contain pass/fail information. need to improve test data
    var githubURL = toUrl(name);
    if (githubURL) {
      packageJSON.repository = packageJSON.repository || {};
      packageJSON.repository.github = githubURL;
      getTestResults(name, function (err, results) {
        if (err) console.log(err);
        packageJSON['test-results'] = results;
        res.send(packageJSON);
      });
    } else {
      res.send(packageJSON);
    }
  });
});

app.get('/api/testresults', function(req, res) {
  get('hollaback.iriscouch.com', 80, '/testresults/_all_docs?include_docs=true', function(data){
    res.send(data);
  });
});

console.log('Your highness, at your service:'.yellow
  + ' http://localhost:%d'.magenta, PORT);

app.listen(PORT);

















// Stream from our db for realtime test results updates to clients
var everyone = nowjs.initialize(app);

var lastDbSeq = 0;

// Get our db's last change id
get('hollaback.iriscouch.com', 80, '/testresults/_changes', function(data){
  data = JSON.parse(data);
  lastDbSeq = data.last_seq;
  getDbChanges();
});

function getDbChanges() {
  http.get({
    host: 'hollaback.iriscouch.com',
    port: 80,
    path: '/testresults/_changes?feed=continuous&since='+(lastDbSeq)
  }, function(res) {
    var cur = '';
    res.on('data', function(chunk){
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        var newSeq = data.seq || data.last_seq;
        if(newSeq > lastDbSeq) {
          lastDbSeq = newSeq;
        }
        if(data.hasOwnProperty('id')) {
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
  get('hollaback.iriscouch.com', 80, '/testresults/'+data.id, function(res){
    res = JSON.parse(res);
    if(res.hasOwnProperty('error')) {
      console.log(data.id, res);
    } else {
      console.log('Updating results for ' + res.name + '@' + res.version, res.system, res.node);
      // Update object
      updateRecentTests(res);
    }
  });
}








// Stream from NPM db for great realtime updates

var lastNpmSeq = 0;


// Gets last change id

get('hollaback.iriscouch.com', 80, '/registry/_changes', function(data){
  data = JSON.parse(data);
  lastNpmSeq = data.last_seq;
  getNpmChanges();
});


function getNpmChanges() {
  http.get({
    host: 'hollaback.iriscouch.com',
    port: 80,
    path: '/registry/_changes?feed=continuous&since='+(lastNpmSeq)
  }, function(res) {
    var cur = '';
    res.on('data', function(chunk){
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        var newSeq = data.seq || data.last_seq;
        if(newSeq > lastNpmSeq) {
          lastNpmSeq = newSeq;
        }
        console.log('lastnpmseq is', lastNpmSeq);
        if(data.hasOwnProperty('id')) {
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
  get('hollaback.iriscouch.com', 80, '/registry/'+data.id, function(res){
    res = JSON.parse(res);
    if(res.hasOwnProperty('error')) {
      console.log(data.id, res);
    } else {
      // Update object
      /*everyone.count(function(count){
        if(count > 0) {
          everyone.now.projectUpdated(data);
        }
      });*/
      alertSlaves(data);
      updateRecent(data);
    }
  });
}

function alertSlaves(data) {
  // Tell slaves to rerun tests for module specified in data
  get('127.0.0.1', 11235, '/' + data.id, function() {}); // only solaris at the moment!
  // TODO keep track of remote slaves. yepppp.
}


function get(host, port, path, cb) {
  http.get({
    host: host,
    port: port,
    path: path
  }, function(res) {
    var cur = '';
    res.on('data', function(chunk){
      cur += chunk.toString();
    });
    res.on('end', function(){
      cb(cur);
    });
  });
}


// Keep buffer of 10 recent updates

var recent = [];
var recentTests = [];

function updateRecent(data) {
  if(recent.length > 10) {
    recent.shift();
  }
  recent.push(data.id);
  everyone.count(function(count){
    if(count > 0) {
      everyone.now.addToRecent([data.id]);
    }
  });
}

function updateRecentTests(data) {
  if(recentTests.length > 10) {
    recentTests.shift();
  }
  recentTests.push(data.name);
  everyone.count(function(count){
    if(count > 0) {
      everyone.now.addToRecentTests([data.name]);
    }
  });
}

nowjs.on('connect', function(){
  this.now.addToRecent(recent);
  this.now.addToRecentTests(recentTests);
});



