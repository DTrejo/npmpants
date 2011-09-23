var config = require("../config"),
	fs = require('fs'),
    npm = require('npm'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,

    Runner = require('./lib/runner'),
    util = require('util'),
    cradle = require('cradle');

const NODE_VERSION = process.version;

var connection = new cradle.Connection(config.couchHost, config.couchPort, {
  cache: true,
  raw: false,
  auth: { username: config.couchUser, password: config.couchPass }
});

var db = connection.database('results');

var queue = [], ready = false, getUname;

var config = { loglevel: 'silent',
               cwd: __dirname + '/test_modules' };

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

var runCount = 0, spool = [];

exports.spool = function (module) {
  if (module !== undefined) {
    spool.push(module);
  }
  while (spool.length && runCount < 10) {
    runCount++;
    exports.run(spool.shift());
  }
};

exports.run = function (module, runner) {
  // create out runner even if npm isn't ready
  var r = runner || new Runner();

  if (!ready) {
    // we're not ready so add the module and the new runner to the que
    queue.push([module, r]);

    // return the runner so other components can subscribe to completed events
    return r;
  }
  console.log('Installing ' + module);

  // ok, npm must be ready now, continue with the install
  // install(here, module_name, cb);
  npm.commands.install(config.cwd, module, function (err, data) {
    var version;
    // TODO: bug hiding here where version stays undefined e.g. install taglib
    if (Array.isArray(data) && Array.isArray(data[data.length - 1])) {
      version = data[data.length - 1][0];
      version = version.substr(version.indexOf('@') + 1);
      // console.log('version', version);
    }

    r.on('complete', function (success, message) {
      runCount--;
      console.log('complete>', module, success, message, exports.UNAME);
	  console.log("");

      db.get(module, function(err, doc) {
		console.log(doc);
        if(err) {
          doc = {};
          doc.name = module;
          doc.tests = {};
		  message = err;
        }

        if(!doc.tests[version])
          doc.tests[version] = {};

        if(!doc.tests[version][exports.UNAME])
          doc.tests[version][exports.UNAME] = {};

        doc.tests[version][exports.UNAME][NODE_VERSION] = {
          passed: success,
          message: message
        };

        db.save(module, doc, function(err, res) {
			console.log(doc.tests[version]);

			if(err) console.log(err);
			console.log(res);
			exports.spool();
		});
      });

      // npm.commands.uninstall(['../slave/test_modules/node_modules/' + module], function(err) {
		  // console.log(arguments);
	  // });
    });
    r.on('error', function (err) {
      console.log('Something went wrong: ' + err);
    });

    if (err) {
      console.log('Failed to install package.');
      r.emit('complete', false, err.message);
      return;
    }

    // all modules are installed locally to prevent external problems
    var module_path = __dirname + '/test_modules/node_modules/' + module;

    // load the modules package.json
    var pack = JSON.parse(
      fs.readFileSync(module_path + '/package.json').toString()
    );

    if (version === undefined) {
      version = pack.version;
    }

    // we only care about modules that provide a test in package.json
    if (!(pack.scripts && pack.scripts.test)) {
      //throw new Error('pack needs to define scripts.test');
      console.log('package needs to define scripts.test');
      return;
    }
    if (pack.scripts && pack.scripts.test) {
      // tell the runner to go to work
      r.run(pack.scripts.test, module_path);
    } else {
      r.emit('complete', false, 'package needs to define scripts.test');
    }
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
