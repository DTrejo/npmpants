var options = {
  host: 'search.npmjs.org',
  port: '80',
  path: '/api/_all_docs?include_docs=true'
};

var http = require('http'),
    data = "",
    regex = /^http:\/\/packages:5984/,
    replacement = 'http://registry.npmjs.org';

/**
 * Some magic function that takes the URL of a tarball. Should
 * download, extract, run tests, and whatnot.

 * TODO: Replace with a reference to the actual function, some time
 * after it's been written.
 */
var dl = function (url) {

};

var testModule = function (mod) {
  if (mod.id === '') {
    return;
  }
  var versions = mod.doc.versions;
  for (var i = 0, keys = Object.keys(versions), ll = keys.length; i < ll; i++) {
    dl(versions[keys[i]].dist.tarball.replace(regex, replacement));
  }
};

var interpretJSON = function (obj) {
  for (var i = 0, rows = obj.rows, ll = rows.length; i < ll; i++) {
    testModule(rows[i]);
  }
};

http.get(options, function (res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk;
  });
  res.on('end', function () {
    interpretJSON(JSON.parse(data));
  });
});

