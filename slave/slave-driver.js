var config = require("../config"),
	fs = require('fs'),
	npm = require('npm'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec,
	path = require('path'),

	Handler = require('./handler'),
	util = require('util'),
	cradle = require('cradle');

const NODE_VERSION = process.version;

var connection = new cradle.Connection(config.couchHost, config.couchPort, {
	cache: true,
	raw: false,
	auth: { username: config.couchUser, password: config.couchPass }
});

var db = connection.database('results');

var npmConfig = {
	loglevel: 'silent',
	cwd: __dirname + '/test_modules'
};

// load needs to be call before any npm.commands can be run
// but run needs to be call externally so we cannot do install from with in load
exports.ready = ready;
function ready(cb) {
	npm.load(npmConfig, function () {
		getUname(function (err, uname) {
			exports.UNAME = uname;
			cb(run);
		});
	});
};

function run(module, opts) {
	var options = opts || {};
	if (options.reportResults == undefined) {
		options.reportResults = true;
	} // else leave it alone.

	options.uninstallAfter = options.uninstallAfter || false;

	var r = new Handler();

	// ok, npm must be ready now, continue with the install
	// install(here, module_name, cb);
	npm.commands.install(npmConfig.cwd, module, function (err, data) {
		// e.g. package requires a larger node version than current one
		if (err) return r.emit('complete', false, err.message);

		var version;
		// TODO: bug hiding here where version stays undefined e.g. install taglib
		if (Array.isArray(data) && Array.isArray(data[data.length - 1])) {
			version = data[data.length - 1][0];
			version = version.substr(version.indexOf('@') + 1);
			// console.log('version', version);
		}

		r.on('complete', function (success, message) {
			// console.log('complete>', module, success, message
			// , exports.UNAME);

			if (options.reportResults === true) {
				console.log('saving to db. reportResults ==', options.reportResults);
				db.get(module, function(err, doc) {
					if(err) {
						doc = {};
						doc.name = module;
						doc.tests = {};
						message = err;
					}

					if(!doc.tests[version])
						doc.tests[version] = {};

					if(!doc.tests[version][exports.UNAME])
						doc.tests[version][exports.UNAME] = {};

					doc.tests[version][exports.UNAME][NODE_VERSION] = {
						passed: success,
						message: message
					};

					db.save(module, doc, function(err, res) {
						if (err) console.log(err);
					});
				});
			}

			if (options.uninstallAfter) {
				var list = [ path.join(npmConfig.cwd, 'node_modules', module) ];
				npm.commands.uninstall(list, function(err, data) {
					if (err) console.log(err.stack);
					if (data && data.length) console.log(module, 'npm uninstall:', data);
				});
			}
		});
		r.on('error', function (err) {
			console.log('Something went wrong: ' + err);
		});

		// all modules are installed locally to prevent external problems
		var module_path = path.join(
			__dirname, 'test_modules', 'node_modules', module
		);

		// load the modules package.json
		var pack = JSON.parse(
			fs.readFileSync(path.join(module_path, 'package.json')).toString()
		);

		if (version === undefined) {
			version = pack.version;
		}

		// don't try to test things whose version is greater than on current system
		// if (pack.engines) {
		// 	if (semver.gt(process.version, pack.engines.node || '0')) {
		// 		r.emit('complete', true, 'n/a: requires Node ' + version);
		// 	}
		// 	if (semver.gt(npm.version, pack.engines.npm || '0')) {
		// 		r.emit('complete', true, 'n/a: requires npm ' + version);
		// }
		// }

		if (pack.scripts && pack.scripts.test) {
			// tell the runner to go to work
			r.run(pack.scripts.test, module_path);
		} else {
			r.emit('complete', false, 'package needs to define scripts.test');
		}
	});

	return r;
};

// get's the system's uname, e.g.
// SunOS 5.11 i86pc
// Darwin 10.7.0 i386 // actually im on 10.6, but whateves.
function getUname(cb) {
	exec('uname -mrs', function (error, stdout, stderr) {
		if (error !== null) {
			cb(error, stdout);
		} else {
			cb(null, stdout.trim());
		}
	});
};
