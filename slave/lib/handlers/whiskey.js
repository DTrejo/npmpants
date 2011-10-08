var generic = require("./generic"),
    path = require('path'),
    cp = require("child_process"),
    util = require("util"),
    _ = require('underscore');

function WhiskeyHandler(cmd) {
	this.name = "WhiskeyHandler";
	generic.apply(this, arguments);
}

util.inherits(WhiskeyHandler, generic);

module.exports = WhiskeyHandler;

WhiskeyHandler.prototype.run = function(workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);
  this.commandLine.cmd = path.join(
    __dirname, "..", "..", "node_modules","whiskey","bin","whiskey"
  );
  console.log(this.commandLine.cmd, this.commandLine.args);

  // last output format wins
  this.commandLine.args.push('--json');

  var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    cwd: workingDir,
    env: env
  });

  p.stderr.on("data", _.bind(this.onErr, this));
  p.stdout.on("data", _.bind(this.onStd, this));
  p.on("exit", _.bind(this.onExit, this));
};

WhiskeyHandler.prototype.output = '';
WhiskeyHandler.prototype.onStd = function (data) {
  this.output += data;
}

WhiskeyHandler.prototype.onErr = function(err, data) {
  // console.log("error in WhiskeyHandler", err.toString(), data);
};

WhiskeyHandler.prototype.onExit = function(code, sig) {
  // console.log('===');
  // console.log(this.output); 
  // console.log('===');
  // console.log("complete", code <= 0, sig);
  this.emit("complete", code <= 0, sig);
};
