var cp = require('child_process'),
    events = require('events'),
  globSync = require("glob").globSync,
    path = require('path'),
    util = require('util'),
    _ = require('underscore');

function Runner(cmd, run_path) {
  events.EventEmitter.call(this);

  // if npm.load is not done yet the Runner gets queued
  // once load is done Runner.run will be called directly
  // from the slave driver
  // console.log(process.env.PATH);
  if (cmd) this.run(cmd, run_path);
}

module.exports = Runner;

util.inherits(Runner, events.EventEmitter);

var RunnerPrototype = {
  run: function (cmd, run_path) {
    // this is probably the only step really needed for the runner.
    // everything else can be part of the GenericHandler super-class
    var handler = this.createTestHandler(cmd, run_path);

    handler.on('complete', _.bind(this.onExit, this));
    handler.on("err", _.bind(this.onErr, this));
    handler.on("out", _.bind(this.onOut, this));
  },

  createTestHandler: function (cmd, run_path) {
    // split the command apart, cmd[0] will be the executable
    var commandLine = this.processCmdLine(cmd, run_path);

    var Handler;
    try {
      Handler = require('./handlers/' + commandLine.name);
      // console.log('created new "' + commandLine.name + '" test handler');
    } catch (e) {
      Handler = require('./handlers/generic');
      // console.log('created new "generic" test handler');
    }

    return new Handler(commandLine, run_path);
  },

  processCmdLine: function (cmd, run_path) {
    var commandLine = {
      args: [],
      envs: {},
      name: ''
    }, env;
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
    if(commandLine.args.join("").match(/(\*|\.\/>)/) !== null) {
      commandLine.args.forEach(function(arg, i, args) {
      var match = globSync(path.join(run_path, arg));
      // yup, found files
      match.forEach(function(file, index, files) {
        // make paths absolute, with better cwd for execution this wont be
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
  },
  onErr: function (err, data) {
    this.emit('err', err);
  },

  onExit: function (successful, code) {
    this.emit('complete', successful, code);
  },
  onOut: function (data) {
    this.emit('out', data);
  }
};

_.extend(Runner.prototype, RunnerPrototype);
