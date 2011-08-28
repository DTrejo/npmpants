var cp = require("child_process"),
    events = require("events"),
    path = require("path"),
    util = require("util"),
    _ = require("underscore");

function Runner(cmd, run_path) {
  events.EventEmitter.call(this);

  // if npm.load is done yet the Runner gets queued
  // once load is done Runner.run will be called directly
  // from the slave driver
  if (cmd) this.run(cmd, run_path);
}

module.exports = Runner;

util.inherits(Runner, events.EventEmitter);

var killTimeout = 15000;

var RunnerPrototype = {
  run: function (cmd, run_path) {

    var handler = this.createTestHandler(cmd, run_path);

    handler.on("complete", _.bind(this.onExit, this));

    // run the command and pass everything else from the split as args
    // (expresso ./tests, node test/test.js)
    // var env = _.extend(process.env, this.commandLine.envs);
    // env["NODE_PATH"] = "./test_suites:" + process.env["NODE_PATH"];

    // var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    //   cwd: run_path,
    //   env: env
    // });

    // p.stdout.on("data", _.bind(this.onOut, this));
    // p.stderr.on("data", _.bind(this.onErr, this));
    // p.on("exit", _.bind(this.onExit, this));

    // this.child = p;
    // this.flagForDeath();
  },

  createTestHandler: function (cmd, run_path) {
    // split the command apart, cmd[0] will be the executable
    var commandLine = this.processCmdLine(cmd);

    var Handler;
    try {
      Handler = require("./handlers/" + commandLine.name);
      console.log("created new '" + commandLine.name + "' test handler");
    } catch (e) {
      Handler = require("./handlers/generic");
    }

    return new Handler(commandLine, run_path);
  },

  processCmdLine: function (cmd) {
    var commandLine = {
      args: [],
      envs: {},
      name: ""
    }, env;
    cmd = cmd.split(" ");

    commandLine.name = cmd[0];

    while (cmd[0] && cmd[0].indexOf("=") > -1) {
      env = cmd.shift().split("=");
      commandLine.envs[env[0]] = env[1];
    }

    console.log("Determining test suite: " + cmd[0]);

    // TODO
    // check cmd[0] for = and set appropriate env variables

    // this will prevent the need for global install of a test suite
    // hopefully helping once we are overloading the suite to grab results
    if (cmd[0] && cmd[0].indexOf("expresso") > -1) {
      commandLine.cmd = path.join(process.cwd(), "/test_suites/expresso/bin/expresso");
    } else if (cmd[0] && cmd[0].indexOf("tap") > -1) {
      commandLine.envs.TAP = 1;
      commandLine.cmd = path.join(process.cwd(), "/test_suites/tap/bin/tap");
    } else {
      commandLine.cmd = cmd[0];
    }

    commandLine.args = cmd.slice(1);

    return commandLine;
  },
  onErr: function (err) {
    this.resetTimer();
    console.log("[APP ERROR] " + err);
    this.emit("error", err);
  },

  onExit: function (successful, code) {
    this.clearTimer();
    this.emit("complete", successful, code);
  },

  onOut: function (data) {
    this.resetTimer();
    console.log("[APP] " + data);
    this.emit('data', data);
  },
  kill: function () {
    this.child.kill();
    delete this.child;
  },
  flagForDeath: function () {
    this.timer = setTimeout(_.bind(this.kill, this), killTimeout);
  },
  clearTimer: function () {
    clearTimeout(this.timer);
    delete this.child;
  },
  resetTimer: function () {
    clearTimeout(this.timer);
    this.flagForDeath();
  }
};

_.extend(Runner.prototype, RunnerPrototype);
