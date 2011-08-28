var cp = require("child_process"),
    events = require("events"),
    path = require("path"),
    util = require("util"),
    _ = require("underscore");

function TestHandler(cmd, workingDir) {
  events.EventEmitter.call(this);

  this.commandLine = cmd;

  console.log("new '" + cmd.name + "' TestHandler");

  this.run(workingDir);
}

module.exports = TestHandler;

util.inherits(TestHandler, events.EventEmitter);

TestHandler.prototype.run = function(workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);

console.log(this.commandLine.cmd);
  var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    cwd: workingDir,
    env: env
  });

  p.stderr.on("data", _.bind(this.onErr, this));
  p.stdout.on("data", _.bind(this.onStd, this));
  p.on("exit", _.bind(this.onExit, this));
}

TestHandler.prototype.onErr = function(err, data) {

}

TestHandler.prototype.onStd = function(data) {

}

TestHandler.prototype.onExit = function(code, sig) {
  this.emit("complete", this.successful, this.message);
}
