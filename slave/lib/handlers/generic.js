var cp = require("child_process"),
    events = require("events"),
    path = require("path"),
    util = require("util"),
    _ = require("underscore");

function TestHandler(cmd, workingDir) {
  events.EventEmitter.call(this);

  this.commandLine = cmd;

  console.log("new '" + cmd.name + "' TestHandler");

  this.freshenTimer();

  this.run(workingDir);
}

module.exports = TestHandler;

util.inherits(TestHandler, events.EventEmitter);

TestHandler.prototype.run = function (workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);

  var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    cwd: workingDir,
    env: env
  });

  p.stderr.on("data", _.bind(this.onErr, this));
  p.stdout.on("data", _.bind(this.onStd, this));
  p.on("exit", _.bind(this.onExit, this));

  this.p = p;
};

TestHandler.prototype.freshenTimer = function () {
  if (this._t) {
    clearTimeout(this._t);
  }

  this._t = setTimeout(_.bind(this.killProcess, this), 15000);
};

TestHandler.prototype.killProcess = function () {
  try {
    this.p.kill('SIGTERM');
    this.p.kill('SIGINT');
    this.emit("complete", false, 'Did not complete in a timely manner.');
  } catch (e) {
    this.emit('complete', false, 'Failed to kill process: ' + e.message);
  }
};

TestHandler.prototype.onErr = function (err, data) {
  this.freshenTimer();
};

TestHandler.prototype.onStd = function (data) {
  this.freshenTimer();
};

TestHandler.prototype.onExit = function (code, sig) {
  clearTimeout(this._t);
  this.emit("complete", code === 0, sig);
};
