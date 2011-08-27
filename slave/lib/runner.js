var cp = require("child_process"),
	events = require("events"),
	util = require("util"),
	
	_ = require("underscore");

module.exports = Runner;

function Runner(cmd) {
	events.EventEmitter.call(this);

	var p = cp.spawn(cmd);

	p.stdout.on("data", _.bind(this.onOut, this));
	p.stderr.on("data", _.bind(this.onErr, this));
	p.on("exit", _.bind(this.onExit, this));
}

util.inherits(Runner, events.EventEmitter);

Runner.prototype = {
	onErr: function(err) {

	},
	
	onExit: function(code, sig) {
		console.log("Test finished");
	},

	onOut: function(data) {

	}
};
