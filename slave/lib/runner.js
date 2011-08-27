var cp = require("child_process"),
	events = require("events"),
	path = require("path"),
	util = require("util"),
	
	_ = require("underscore");

module.exports = Runner;

function determineSuite(cmd) {
	console.log("Determining test suite: " + cmd[0]);

	// this will prevent the need for global install of a test suite
	// hopefully helping once we are overloading the suite to grab results
	if(cmd[0].indexOf("expresso") > -1) {
		cmd[0] = path.join(process.cwd(), "/node_modules/expresso/bin/expresso");
	}
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
		// split the command apart, cmd[0] will be the executable 
		cmd = cmd.split(" ");

		// are we using a suite? or a generic
		determineSuite(cmd);

		// this doesn't work correctly and I suspect it will break
		// once we have more then once suite running
		// the runner needs to be forked off by the slave driver
		if(run_path)
			process.chdir(run_path);

		// run the command and pass everything else from the split as args
		// (expresso ./tests, node test/test.js)
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
