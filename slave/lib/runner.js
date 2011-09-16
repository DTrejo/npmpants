var cp = require('child_process'),
    events = require('events'),
	globSync = require("glob").globSync,
    path = require('path'),
    util = require('util'),
    _ = require('underscore');

function Runner(cmd, run_path) {
  events.EventEmitter.call(this);

  // if npm.load is done yet the Runner gets queued
  // once load is done Runner.run will be called directly
  // from the slave driver
  console.log(process.env.PATH);
  if (cmd) this.run(cmd, run_path);
}

module.exports = Runner;

util.inherits(Runner, events.EventEmitter);

var RunnerPrototype = {
  run: function (cmd, run_path) {

    var handler = this.createTestHandler(cmd, run_path);

    handler.on('complete', _.bind(this.onExit, this));
	handler.on("err", _.bind(this.onErr, this));
	handler.on("out", _.bind(this.onOut, this));

    // run the command and pass everything else from the split as args
    // (expresso ./tests, node test/test.js)
    // var env = _.extend(process.env, this.commandLine.envs);
    // env['NODE_PATH'] = './test_suites:' + process.env['NODE_PATH'];

    // var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    //   cwd: run_path,
    //   env: env
    // });

    // p.stdout.on('data', _.bind(this.onOut, this));
    // p.stderr.on('data', _.bind(this.onErr, this));
    // p.on('exit', _.bind(this.onExit, this));

    // this.child = p;
    // this.flagForDeath();
  },

  createTestHandler: function (cmd, run_path) {
    // split the command apart, cmd[0] will be the executable
    var commandLine = this.processCmdLine(cmd, run_path);

    var Handler;
    try {
      Handler = require('./handlers/' + commandLine.name);
      console.log('created new "' + commandLine.name + '" test handler');
    } catch (e) {
      Handler = require('./handlers/generic');
      console.log('created new "generic" test handler');
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

    while (cmd[0] && cmd[0].indexOf('=') > -1) {
      env = cmd.shift().split('=');
      commandLine.envs[env[0]] = env[1];
    }

    console.log('Determining test suite: ' + cmd[0]);

    // TODO
    // check cmd[0] for = and set appropriate env variables

    // this will prevent the need for global install of a test suite
    // hopefully helping once we are overloading the suite to grab results
    /*if (cmd[0] && cmd[0].indexOf("expresso") > -1) {
      commandLine.cmd = 'expresso'
    } else if (cmd[0] && cmd[0].indexOf("tap") > -1) {
      commandLine.envs.TAP = 1;
      commandLine.cmd = path.join(process.cwd(), '/test_suites/tap/bin/tap');
    } else {
      commandLine.cmd = cmd[0];
    }*/

    commandLine.args = cmd.slice(1);
	if(commandLine.args.join("").match(/[\.\*]/) !== null) {
		commandLine.args.forEach(function(arg, i, args) {
			var match = globSync(path.join(run_path, arg));
			match.forEach(function(file, index, files) {
				files[index] = file.replace(run_path, "");
			});
			args[i] = match;
		});
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
