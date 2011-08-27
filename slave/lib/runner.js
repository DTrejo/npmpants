var cp = require("child_process"),
  events = require("events"),
  path = require("path"),
  util = require("util"),
  
  _ = require("underscore");

module.exports = Runner;

function determineSuite(cmd) {
}


function Runner(cmd, run_path) {
  events.EventEmitter.call(this);

  // if npm.load is done yet the Runner gets queued
  // once load is done Runner.run will be called directly
  // from the slave driver
  if(cmd)
    this.run(cmd, run_path);
}

util.inherits(Runner, events.EventEmitter);

var RunnerPrototype = {
  run: function(cmd, run_path) {
    this.commandLine = {
      args: [],
      cmd: "",
      envs: {}
    };

    // split the command apart, cmd[0] will be the executable 
    cmd = cmd.split(" ");
    this.processCmdLine(cmd);

    // are we using a suite? or a generic
    determineSuite(cmd);

    // run the command and pass everything else from the split as args
    // (expresso ./tests, node test/test.js)
    var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
      cwd: run_path,
      env: _.extend(process.env, this.commandLine.envs)
    });

    p.stdout.on("data", _.bind(this.onOut, this));
    p.stderr.on("data", _.bind(this.onErr, this));
    p.on("exit", _.bind(this.onExit, this));
  },
  processCmdLine: function(cmd) {
    var env;
    while(cmd[0] && cmd[0].indexOf("=") > -1) {
      env = cmd.shift().split("=");
      this.commandLine.envs[env[0]] = env[1];
    }

    console.log("Determining test suite: " + cmd[0]);

    // TODO
    // check cmd[0] for = and set approtriate env variables

    // this will prevent the need for global install of a test suite
    // hopefully helping once we are overloading the suite to grab results
    if(cmd[0] && cmd[0].indexOf("expresso") > -1) {
      this.commandLine.cmd = path.join(process.cwd(), "/node_modules/expresso/bin/expresso");
    } else {
      this.commandLine.cmd = cmd[0];
    }

    this.commandLine.args = cmd.slice(1);

    console.log(this.commandLine);
  },
  onErr: function(err) {
    console.log("[TEST ERR] " + err);
    this.emit("error", [err]);      
  },
  
  onExit: function(code, sig) {
    this.emit("complete", code, sig);
  },

  onOut: function(data) {
    console.log("[TEST] " + data);
  }
};

_.extend(Runner.prototype, RunnerPrototype);
