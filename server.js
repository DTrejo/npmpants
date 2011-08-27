var express = require('express')
  , http = require('http')
  , app = express.createServer()
  , colors = require('colors')
  , fs = require('fs')
  , nowjs = require('now')
  , nko = require('nko')('fxFY6qeBj18FyrA2')
  , PORT = parseInt(process.env.PORT, 10) || 8000
  ;

// match app routes before serving static file of that name
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// returns json
app.get('/api/modules/:name', function(req, res, next) {
  var name = req.params.name;

  // this doesn't contain pass/fail information. need improve my test data hah
  res.send({ name: 'express',
    description: 'Sinatra inspired web development framework',
    'dist-tags': { latest: '2.4.6' },
    versions:
     [ '0.14.0',
       '0.14.1',
       '1.0.0beta',
       '1.0.0beta2',
       '1.0.0rc',
       '1.0.0rc2',
       '1.0.0rc3',
       '1.0.0rc4',
       '1.0.0',
       '1.0.1',
       '1.0.2',
       '1.0.3',
       '1.0.4',
       '1.0.5',
       '1.0.6',
       '1.0.7',
       '1.0.8',
       '2.0.0beta',
       '2.0.0beta2',
       '2.0.0beta3',
       '2.0.0rc',
       '2.0.0rc2',
       '2.0.0rc3',
       '2.0.0',
       '2.1.0',
       '2.1.1',
       '2.2.0',
       '2.2.1',
       '2.2.2',
       '2.3.0',
       '2.3.1',
       '2.3.2',
       '2.3.3',
       '2.3.4',
       '2.3.5',
       '2.3.6',
       '2.3.7',
       '2.3.8',
       '2.3.9',
       '2.3.10',
       '2.3.11',
       '2.3.12',
       '2.4.0',
       '2.4.1',
       '2.4.2',
       '2.4.3',
       '2.4.4',
       '2.4.5',
       '2.4.6' ],
    maintainers: 'tjholowaychuk <tj@vision-media.ca>',
    author: 'TJ Holowaychuk <tj@vision-media.ca>',
    time:
     { '0.14.0': '2010-12-29T19:38:25.450Z',
       '0.14.1': '2010-12-29T19:38:25.450Z',
       '1.0.0beta': '2010-12-29T19:38:25.450Z',
       '1.0.0beta2': '2010-12-29T19:38:25.450Z',
       '1.0.0rc': '2010-12-29T19:38:25.450Z',
       '1.0.0rc2': '2010-12-29T19:38:25.450Z',
       '1.0.0rc3': '2010-12-29T19:38:25.450Z',
       '1.0.0rc4': '2010-12-29T19:38:25.450Z',
       '1.0.0': '2010-12-29T19:38:25.450Z',
       '1.0.1': '2010-12-29T19:38:25.450Z',
       '1.0.2': '2011-01-11T02:09:30.004Z',
       '1.0.3': '2011-01-13T22:09:07.840Z',
       '1.0.4': '2011-02-05T19:13:15.043Z',
       '1.0.5': '2011-02-05T19:16:30.839Z',
       '1.0.6': '2011-02-07T21:45:32.271Z',
       '1.0.7': '2011-02-07T22:26:51.313Z',
       '1.0.8': '2011-03-02T02:58:14.314Z',
       '2.0.0beta': '2011-03-04T00:19:22.568Z',
       '2.0.0beta2': '2011-03-07T17:40:46.229Z',
       '2.0.0beta3': '2011-03-09T23:46:02.495Z',
       '2.0.0rc': '2011-03-14T22:01:43.971Z',
       '2.0.0rc2': '2011-03-17T18:01:26.604Z',
       '2.0.0rc3': '2011-03-17T20:02:05.880Z',
       '2.0.0': '2011-03-18T01:06:40.271Z',
       '2.1.0': '2011-03-24T20:47:46.219Z',
       '2.1.1': '2011-03-29T17:40:33.337Z',
       '2.2.0': '2011-03-30T18:40:56.080Z',
       '2.2.1': '2011-04-04T19:23:50.483Z',
       '2.2.2': '2011-04-12T09:44:57.909Z',
       '2.3.0': '2011-04-25T16:50:01.384Z',
       '2.3.1': '2011-04-26T22:26:27.392Z',
       '2.3.2': '2011-04-27T16:13:33.518Z',
       '2.3.3': '2011-05-03T18:31:39.123Z',
       '2.3.4': '2011-05-08T17:54:04.615Z',
       '2.3.5': '2011-05-20T02:07:37.117Z',
       '2.3.6': '2011-05-20T16:42:09.750Z',
       '2.3.7': '2011-05-23T22:54:25.787Z',
       '2.3.8': '2011-05-25T04:53:16.574Z',
       '2.3.9': '2011-05-25T17:18:34.557Z',
       '2.3.10': '2011-05-27T16:20:13.495Z',
       '2.3.11': '2011-06-04T17:51:29.978Z',
       '2.3.12': '2011-06-22T20:56:29.997Z',
       '2.4.0': '2011-06-28T16:41:30.571Z',
       '2.4.1': '2011-07-06T16:57:15.476Z',
       '2.4.2': '2011-07-07T03:15:52.511Z',
       '2.4.3': '2011-07-14T19:58:45.646Z',
       '2.4.4': '2011-08-05T11:30:40.300Z',
       '2.4.5': '2011-08-19T17:13:10.685Z',
       '2.4.6': '2011-08-22T17:20:21.180Z' },
    repository:
     { type: 'git',
       url: 'git://github.com/visionmedia/express.git' },
    version: '2.4.6',
    contributors:
     [ 'TJ Holowaychuk <tj@vision-media.ca>',
       'Aaron Heckmann <aaron.heckmann+github@gmail.com>',
       'Ciaran Jessup <ciaranj@gmail.com>',
       'Guillermo Rauch <rauchg@gmail.com>' ],
    dependencies:
     { connect: '>= 1.5.2 < 2.0.0',
       mime: '>= 0.0.1',
       qs: '>= 0.3.1' },
    devDependencies:
     { 'connect-form': '0.2.1',
       ejs: '0.4.2',
       expresso: '0.7.2',
       hamljs: '0.5.1',
       jade: '0.11.0',
       stylus: '0.13.0',
       should: '0.2.1',
       'express-messages': '0.0.2',
       'node-markdown': '>= 0.0.1',
       'connect-redis': '>= 0.0.1' },
    keywords:
     [ 'framework',
       'sinatra',
       'web',
       'rest',
       'restful' ],
    main: 'index',
    bin: { express: './bin/express' },
    scripts:
     { test: 'make test',
       prepublish: 'npm prune' },
    engines: { node: '>= 0.4.1 < 0.5.0' },
    dist:
     { shasum: 'df8152c5a40bd89ad74ab07e5ef999fac5a00916',
       tarball: 'http://registry.npmjs.org/express/-/express-2.4.6.tgz' },
    directories: {} });
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
    var cur = "";
    res.on('data', function(chunk){
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        lastDbSeq = data.seq || data.last_seq;
        if(data.hasOwnProperty('id')) {
          updateResults(data);
        }
        cur = "";
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
      console.log("Updating results for " + res.module, res.test);
      // Update object
      everyone.count(function(count){
        if(count > 0) {
          everyone.now.testUpdated(res);
        }
      });
    }
  });
}








// Stream from NPM db for great realtime updates

var lastNpmSeq = 0;


// Gets last change id

get('search.npmjs.org', 80, '/api/_changes', function(data){
  data = JSON.parse(data);
  lastNpmSeq = data.last_seq;
  getNpmChanges();
});


function getNpmChanges() {
  http.get({
    host: 'search.npmjs.org',
    port: 80,
    path: '/api/_changes?feed=continuous&since='+(lastNpmSeq)
  }, function(res) {
    var cur = "";
    res.on('data', function(chunk){
      cur += chunk.toString();
      try {
        var data = JSON.parse(cur);
        lastNpmSeq = data.seq || data.last_seq;
        if(data.hasOwnProperty('id')) {
          updateModule(data);  
        }
        cur = "";
      } catch (e) {}
    });
    res.on('end', getNpmChanges);
    res.on('error', getNpmChanges);
  });
}

function updateModule(data) {
  console.log("Updating " + data.id);
  get('search.npmjs.org', 80, '/api/'+data.id, function(res){
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
    }
  });
}

function alertSlaves(data) {
  // Tell slaves to rerun tests for module specified in data
}


function get(host, port, path, cb) {
  http.get({
    host: host,
    port: port,
    path: path
  }, function(res) {
    var cur = "";
    res.on('data', function(chunk){
      cur += chunk.toString();
    });
    res.on('end', function(){
      cb(cur);
    });
  });
}