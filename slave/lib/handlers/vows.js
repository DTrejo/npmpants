var generic = require("./generic"),
    cp = require("child_process"),
    util = require("util"),
    _ = require('underscore');

function VowsHandler(cmd) {
  generic.apply(this, arguments);
}

util.inherits(VowsHandler, generic);

module.exports = VowsHandler;

VowsHandler.prototype.run = function(workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);

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

VowsHandler.prototype.output = '';
VowsHandler.prototype.onStd = function (data) {
  this.output += data;
}

VowsHandler.prototype.onErr = function(err, data) {
  console.log("error in VowsHandler", err.toString(), data);
};

VowsHandler.prototype.onExit = function(code, sig) {
  /*console.log('===');
  console.log(this.output); 
  console.log('===');*/
  console.log("complete", code <= 0, sig);
  this.emit("complete", code <= 0, sig);
};
