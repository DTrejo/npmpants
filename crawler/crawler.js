var args = require("argsparser").parse(),
	npmRegistry = require("./npmRegistry"),
    slave = require('../slave'),

	testSuite = args["--suite"] ? args["--suite"] : false;

/**
 * Some magic function that takes the URL of a tarball. Should
 * download, extract, run tests, and whatnot.

 * TODO: Replace with a reference to the actual function, some time
 * after it's been written.
 */

if(testSuite) {
	console.log("Only running tests for " + testSuite);
}

function spoolPackage(package) {
	if (!package.id || !package.doc.versions) {
		return;
	}
	console.log("Spooling " + package.id);
	var versions = Object.keys(package.doc.versions);

	// TODO may not actually be latest
	var latest = package.doc.versions[versions.pop()];

	if (
		(latest && latest.scripts && latest.scripts.test !== undefined)
	) {
		if(testSuite === false || latest.scripts.test.indexOf(testSuite) > -1) {
			console.log("Spooling test for " + package.id + " " + latest.version);
			process.nextTick(function () {
				var s = slave.run(package.id);
			});
		}
	}
}

var interpretJSON = function (obj) {
	var rows = obj.rows, package;
	console.log("npmRegistry returned " + rows.length + " rows");
	while(rows.length > 0) {
		package = rows.splice(Math.round(Math.random() * (rows.length - 1)), 1)[0];
		spoolPackage(package);
	}
	// obj.rows.forEach(function (el, i) {
	// 	spoolPackage(el);
	// });
};

npmRegistry.on("load", interpretJSON);
