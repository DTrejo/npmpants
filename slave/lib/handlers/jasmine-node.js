var generic = require("./generic"),
    cp = require("child_process"),
    util = require("util"),
    _ = require('underscore');

function JasmineNodeHandler(cmd) {
  generic.apply(this, arguments);
}

util.inherits(JasmineNodeHandler, generic);

module.exports = JasmineNodeHandler;

JasmineNodeHandler.prototype.run = function(workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);

  console.log(this.commandLine.cmd, this.commandLine.args);

  // last output format wins
  //this.commandLine.args.push('--json');

  var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    cwd: workingDir,
    env: env
  });

  p.stderr.on("data", _.bind(this.onErr, this));
  p.stdout.on("data", _.bind(this.onStd, this));
  p.on("exit", _.bind(this.onExit, this));
};

JasmineNodeHandler.prototype.output = '';
JasmineNodeHandler.prototype.onStd = function (data) {
  this.output += data;
}

JasmineNodeHandler.prototype.onErr = function(err, data) {
  console.log("error in JasmineNodeHandler", err.toString(), data);
};

JasmineNodeHandler.prototype.onExit = function(code, sig) {
  /*console.log('===');
  console.log(this.output); 
  console.log('===');*/
  console.log("complete", code <= 0, sig);
  this.emit("complete", code <= 0, sig);
};
