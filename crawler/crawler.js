var options = {
  host: 'search.npmjs.org',
  port: '80',
  path: '/api/_all_docs?include_docs=true'
};

var http = require('http'),
    slave = require('../slave'),
    data = '';

/**
 * Some magic function that takes the URL of a tarball. Should
 * download, extract, run tests, and whatnot.

 * TODO: Replace with a reference to the actual function, some time
 * after it's been written.
 */

var interpretJSON = function (obj) {
  obj.rows.forEach(function (el, i) {
    if (!el.id || !el.doc.versions) {
      return;
    }
    var versions = Object.keys(el.doc.versions);

    // TODO may not actually be latest
    var latest = el.doc.versions[versions.pop()];

    if (latest && latest.scripts && latest.scripts.test !== undefined) {
      setTimeout(function() {
        var s = slave.spool(el.id);
      },0);
    }
  });
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
