var fs = require("fs"),
	npm = require("npm"),
	spawn = require("child_process").spawn,
	
	Runner = require("./lib/runner"),
	
	util = require("util");

var queue = [], ready = false;

var config = { loglevel: 'silent' };

// load needs to be call before any npm.commands can be run
// but run needs to be call externally so we cannot do install from with in load
npm.load(config, function() {
	// tell slaveRunner.run we're ready
	ready = true;
	// then run out the que
	queue.forEach(function(module) {
		exports.run(module[0], module[1]);
	});
});

exports.run = function(module, runner) {
	// create out runner even if npm isn't ready
	var r = runner || new Runner;

	if(!ready) {
		// we're not ready so add the module and the new runner to the que
		queue.push([module, r]);

		// return the runner so other components can subscribe to completed events
		return r;
	};

	console.log("Installing " + module);

	// ok, npm must be ready now, continue with the install
	// install(here, module_name, cb);
	npm.commands.install(__dirname, module, function(err, data) {
	  if (err) {
	    r.emit('complete', 1, null, err);
	    return;
	  }

		// all modules are installed locally to prevent external problems
		var module_path = __dirname + "/node_modules/" + module;

		// load the modules package.json
		var package = JSON.parse(
			fs.readFileSync(module_path + "/package.json").toString()
		);
		
		// we only care about modules that provide a test in package.json
		if(!(package.scripts && package.scripts.test)) {
			throw new Error("package needs to define scripts.test");
		}
		
		// tell the runner to go to work
		r.run(package.scripts.test, module_path);
	});

	return r;
}
