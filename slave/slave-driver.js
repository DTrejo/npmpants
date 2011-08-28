var fs = require("fs"),
    npm = require("npm"),
    spawn = require("child_process").spawn,
    exec = require('child_process').exec,

    Runner = require("./lib/runner"),
    util = require("util"),
    cradle = require('cradle');

var connection = new cradle.Connection('hollaback.iriscouch.com', 80, {
  cache: true,
  raw: false,
  auth: { username: 'hollaback', password: 'momasaidknockyouout' }
});

var db = connection.database('testresults');


var queue = [], ready = false, getUname;

var config = { loglevel: 'silent' };

// load needs to be call before any npm.commands can be run
// but run needs to be call externally so we cannot do install from with in load
npm.load(config, function () {
  getUname(function (err, uname) {
    exports.UNAME = uname;

    // tell slaveRunner.run we're ready
    ready = true;
    // then run out the que
    queue.forEach(function (module) {
      exports.run(module[0], module[1]);
    });
  });
});

exports.run = function (module, runner) {
  // create out runner even if npm isn't ready
  var r = runner || new Runner();

  if (!ready) {
    // we're not ready so add the module and the new runner to the que
    queue.push([module, r]);

    // return the runner so other components can subscribe to completed events
    return r;
  }

  console.log("Installing " + module);

  // ok, npm must be ready now, continue with the install
  // install(here, module_name, cb);
  npm.commands.install(__dirname, module, function (err, data) {
    if (err) {
      r.emit('complete', 1, null, err);
      return;
    }

    // all modules are installed locally to prevent external problems
    var module_path = __dirname + "/node_modules/" + module;

    // load the modules package.json
    var pack = JSON.parse(
      fs.readFileSync(module_path + "/package.json").toString()
    );

    // we only care about modules that provide a test in package.json
    if (!(pack.scripts && pack.scripts.test)) {
      throw new Error("pack needs to define scripts.test");
    }
    r.on('complete', function (code, sig, err) {
      console.log('complete>', module, code, sig,
                  err && err.message, exports.UNAME);
      db.save(module + '@' + pack.version + ':' + exports.UNAME + ', ' + process.version,
              { name: module,
                version: pack.version,
                passed: code === 0,
                system: exports.UNAME,
                node: process.version,
                err: err && err.message});
    });

    // tell the runner to go to work
    r.run(pack.scripts.test, module_path);
  });
  r.on('error', function (err) {
    console.log('Something went wrong: ' + err);
  });

  return r;
};

// get's the system's uname, e.g.
// SunOS 5.11 i86pc
// Darwin 10.7.0 i386 // actually im on 10.6, but whateves.
getUname = function (cb) {
  exec('uname -mrs', function (error, stdout, stderr) {
    if (error !== null) {
      cb(error, stdout);
    } else {
      cb(null, stdout.trim());
    }
  });
};
