var spawn = require('child_process').spawn
  , events = require('events')
  , path = require('path')
  , util = require('util')
  , _ = require('underscore')
  , globSync = require('glob').globSync;

module.exports = handler;
function handler() {
  var ee = new events.EventEmitter;

  // just tack on whatever we want to export
  ee.run = function(options, workingDir) {
    run(options, workingDir, ee);
  };
  return ee;
}

function run(options, workingDir, ee) {
  options = processCmdLine(options, workingDir);
  options = detectAndUseSuite(options);
  var env = _.extend(process.env, options.envs);
  // console.log('options.args',options.args);
  var child = spawn(options.cmd, options.args, {
    cwd: workingDir
  , env: env
  });
  var timeout = undefined;

  freshenTimer();

  var stdout = ''
    , stderr = '';
  child.stdout.on('data', function(data) {
    freshenTimer();
    stdout += data;
    ee.emit('stdout', data);
  });
  child.stderr.on('data', function(data) {
    freshenTimer();
    stderr += data;
    ee.emit('stderr', data);
  });
  child.on('exit', function(code, signal) {
    clearTimeout(timeout);
    complete(code === 0, signal); // TODO: this signal isn't ever here?
  });

  function freshenTimer() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(killProcess, 15000);
  };

  function killProcess() {
    try {
      if (child) {
        // TODO: make a note that this was killed for taking too long to run
        // (15seconds)
        child.kill('SIGTERM');
        child.kill('SIGINT');
      }
    } catch (e) {
      complete(false, 'Failed to kill process: ' + e.message + '\n'
        + e.stack);
    }
  };
  function complete(win, message) {
    // check what suite it is and handle that differently, e.g. include
    // how many tests passed, etc, based on stdout, or something.

    processOutput(options, stdout, stderr, function(err, info) {
      ee.emit('complete', err, {
        win: info.win || win
      , message: message
      , stdout: stdout
      , stderr: stderr

      // these will be undefined, thus not included if the test suite does not
      // report these things in machine-readable manner
      , passed: info.passed
      , total: info.total
      });
    });
  }
};

function processCmdLine(cmd, run_path) {
  var commandLine = {
        args: []
      , envs: { 'TAP': true } // is this correct?
      , name: ''
    }
    , env;
  cmd = cmd.split(' ');

  commandLine.name = cmd[0];

  // check for environment variables
  while (cmd[0] && cmd[0].indexOf('=') > -1) {
    env = cmd.shift().split('=');
    commandLine.envs[env[0]] = env[1];
  }

  // console.log('Determining test suite: ' + cmd[0]);

  // cmd[0] should be the executable
  commandLine.args = cmd.slice(1);
  // if an argument contains ./ or * it will likely need to be expanded to a
  // file list
  if (commandLine.args.join("").match(/(\*|\.\/>)/) !== null) {
    commandLine.args.forEach(function(arg, i, args) {
      var match = globSync(path.join(run_path, arg));
      // yup, found files
      match.forEach(function(file, index, files) {
        // make paths absolute, w/ better cwd for execution this wont be
        // needed
        files[index] = file.replace(run_path, "");
      });
      // replace the orignal arg with the file list
      args[i] = match;
    });
    // flattening will change the file list to a single arg for each file
    commandLine.args = _(commandLine.args).flatten();
  }

  // Set cmd to name of test suite, cmd[0]
  commandLine.cmd = cmd[0];

  return commandLine;
};

// rewrites options object to use appropriate test suite binary
function detectAndUseSuite(options) {
  // SO much better than a switch statement!
  var suite = {
      'expresso': path.join( __dirname
    , 'expresso-noJScov', 'bin', 'expresso')

    , 'jasmine-node': path.join( __dirname
    , 'node_modules', 'jasmine-node', 'bin', 'jasmine-node')

    , 'nodeunit': path.join( __dirname
    , 'node_modules', 'nodeunit', 'bin', 'nodeunit')

    , 'tap': path.join( __dirname
    , 'node_modules', 'tap', 'bin', 'tap.js')

    , 'vows': path.join(__dirname
    , 'node_modules', 'vows', 'bin', 'vows')

    , 'whiskey': path.join(__dirname
    , 'node_modules', 'whiskey', 'bin', 'whiskey')
  };
  if (suite[options.cmd]) {
    options.cmd = suite[options.cmd];
  }

  var args = {
    'vows': '--json'
  };
  args[options.name] && options.args.push(args[options.name]);

  return options;
};

function processOutput(options, stdout, stderr, cb) {
    // each parser calls back with
    // { win: true/false, passed: #passed, total: #totaltests }
    parsers = {
      'tap': function(cb) {
        // via https://gist.github.com/1331671
        var fs = require('fs');
        var TapConsumer = require('tap-consumer');
        var tc = new TapConsumer;
        tc.on('end', function(err, total, passed) {
          if (err) console.log(err.stack);
          // total is the total number of passed tests
          // passed is an array of ids of the tests that passed
          var info =
            { win: passed.length === total
            , passed: passed.length
            , total: total
            };
          cb(err, info);
        });
        tc.write(stdout);
        tc.end();
      }
    , 'vows': function(cb) {
        var json = stdout.substr(stdout.trim().lastIndexOf('\n'));
        var data;
        try {
          // generally happens when the module left sth out of package.json
          data = JSON.parse(json)[1];
        } catch (err) {
          return cb(err, {});
        }
        var info = 
          { win: data.honored === data.total
          , passed: data.honored
          , total: data.total
          };
        return cb(null, info);
      }
      // TODO: more output parsers!
    };
  if (parsers[options.name]) {
    parsers[options.name](cb);
  } else {
    cb(null, {});
  }
}

if (require.main === module) {
  var opts = 
    { args: [ 'semver.js' ]
    , envs: {}
    , name: 'tap'
    , cmd: 'tap'
    };
  var wd = '/Dropbox/dev/npmpants/slave/test_modules/node_modules/semver';
  var h = handler(opts, wd);
  h.on('complete', function(code, message) {
    console.log('>complete', code, message);
  });
  h.on('stderr', function(data) {
    if (data) console.log('>stderr', data+'');
  });
  h.on('stdout', function(data) {
    if (data) console.log('>stdout', data+'');
  });
}
