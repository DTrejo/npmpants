var fs = require("fs"),
	npm = require("npm"),
	spawn = require("child_process").spawn,
	
	Runner = require("./lib/runner");

var module = "test";

npm.load(function() {
	npm.commands.install(".", module, function(err, data) {
		var module_path = "./node_modules/" + module;

		var package = JSON.parse(
			fs.readFileSync(module_path + "/package.json").toString()
		);
		
		if(!(package.scripts && package.scripts.test)) {
			throw new Error("package needs to define scripts.test");
		}
		
		var r = new Runner(package.scripts.test);
	});
});
