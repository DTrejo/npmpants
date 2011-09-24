var fs = require('fs')
  , async = require('async')
  , slave = require('./slave-driver')

  , modules = [
      'diff'
    , 'dnode-protocol'
    , 'date-utils' // TODO this should be passing!
    ]
  , tasks = [];

require('colors')

console.log('Running with NodeJS: ' + process.version);

modules.forEach(function(module) {
  tasks.push(function(cb) {
    var s = slave.run(module, { reportResults: false })
      , out = '', err = '';

    s.on('out', function(data) {
      out += data;
    });

    s.on('err', function(err, data) {
      err += data;
    });

    s.on('complete', function(code, sig) {
      fs.writeFile('./logs/' + module + '.out.log', out);
      fs.writeFile('./logs/' + module + '.err.log', err);
      // console.log('[test.js:out]:\n%s'.green, out);
      // console.log('[test.js:err]:\n%s'.red, err);
      // console.log('test completed with code:', code, 'sig:', sig);
      cb(null, { name: module, passed: code });
    });
  });
})

async.parallel(tasks, function(err, results) {
  if (err) throw err
  console.log();
  results.forEach(function(r) {
    console.log(r.name, 'passed?', r.passed);
  });
  process.exit(0);
});
