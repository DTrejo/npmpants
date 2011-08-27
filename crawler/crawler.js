var options = {
  host: 'search.npmjs.org',
  port: '80',
  path: '/api/_all_docs&include_docs=true'
};

var http = require('http'),
    slave = require("./slave"),
    data = '';

/**
 * Some magic function that takes the URL of a tarball. Should
 * download, extract, run tests, and whatnot.

 * TODO: Replace with a reference to the actual function, some time
 * after it's been written.
 */

var interpretJSON = function (obj) {
  obj.rows.map(function (el) {
    if (el.scripts && el.scripts.test !== undefined) {
      var s = slave.run(el.id);
      s.on('complete', function () {
        // Add to database.
      });
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

