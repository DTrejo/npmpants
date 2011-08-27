var cp = require("child_process"),
	events = require("events"),
	path = require("path"),
	util = require("util"),
	
	_ = require("underscore");

module.exports = Runner;

function Runner(cmd, run_path) {
	events.EventEmitter.call(this);

	if(cmd)
		this.run(cmd, run_path);
}

util.inherits(Runner, events.EventEmitter);

var RunnerPrototype = {
	run: function(cmd, run_path) {
		cmd = cmd.split(" ");

		if(run_path)
			process.chdir(run_path);

		var p = cp.spawn(cmd[0], cmd.splice(1));

		p.stdout.on("data", _.bind(this.onOut, this));
		p.stderr.on("data", _.bind(this.onErr, this));
		p.on("exit", _.bind(this.onExit, this));
	},
	onErr: function(err) {
		console.log("[TEST ERR] " + err);
	},
	
	onExit: function(code, sig) {
		this.emit("complete", code, sig);
	},

	onOut: function(data) {
		console.log("[TEST] " + data);
	}
};

_.extend(Runner.prototype, RunnerPrototype);
