var generic = require("./generic"),
    cp = require("child_process"),
	path = require("path"),
    util = require("util"),
    _ = require('underscore');

function NodeunitHandler(cmd) {
	this.name = "NodeunitHandler";
	generic.apply(this, arguments);
}

util.inherits(NodeunitHandler, generic);

module.exports = NodeunitHandler;

NodeunitHandler.prototype.run = function(workingDir) {
  var env = _.extend(process.env, this.commandLine.envs);
  this.commandLine.cmd = path.join(__dirname, "..", "..", "test_suites","lib","node_modules","nodeunit","bin","nodeunit");


  console.log("cmd: " + this.commandLine.cmd);
  console.log("args (" + typeof this.commandLine.args + "): " + this.commandLine.args);

  var p = cp.spawn(this.commandLine.cmd, this.commandLine.args, {
    cwd: workingDir,
    env: env
  });

  p.stderr.on("data", _.bind(this.onErr, this));
  p.stdout.on("data", _.bind(this.onStd, this));
  p.on("exit", _.bind(this.onExit, this));
};

NodeunitHandler.prototype.output = '';
// NodeunitHandler.prototype.onStd = function (data) {
//   this.output += data;
//   console.log(data.toString());
// }
// 
// NodeunitHandler.prototype.onErr = function(err, data) {
//   console.log(err.toString());
// };
// 
// NodeunitHandler.prototype.onExit = function(code, sig) {
//   /*console.log('===');
//   console.log(this.output); 
//   console.log('===');*/
//   console.log("complete", code <= 0, sig);
//   this.emit("complete", code <= 0, sig);
// };
