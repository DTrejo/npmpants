var spawn = require('child_process').spawn,
	events = require('events'),
	path = require('path'),
	util = require('util'),
	_ = require('underscore'),
	globSync = require('glob').globSync,

	// the event emitter that we return to the caller
	ee = undefined;

//
// should be a drop-in for generic.js
//
module.exports = handler;
function handler(options, workingDir) {
	ee = new events.EventEmitter;

	// just tack on whatever we want to export
	// handler.run = run

	options = detectAndUseSuite(options);

	// start things
	run(options, workingDir);

	return ee;
}

// rewrites options object to use appropriate test suite binary
function detectAndUseSuite(options) {
	// SO much better than a switch statement!
	var suite = {
		'expresso': path.join( __dirname, '..', '..',
			'expresso-noJScov', 'bin', 'expresso'),

		'jasmine-node': path.join( __dirname, '..', '..',
			'node_modules', 'jasmine-node', 'bin', 'jasmine-node'),

		'nodeunit': path.join( __dirname, '..', '..',
			'node_modules', 'nodeunit', 'bin', 'nodeunit'),

		'tap': path.join( __dirname, '..', '..',
			'node_modules', 'tap', 'bin', 'tap.js'),

		'vows': path.join(__dirname, '..', '..',
			'node_modules', 'vows', 'bin', 'vows'),

		'whiskey': path.join(__dirname, '..', '..',
			'node_modules', 'whiskey', 'bin', 'whiskey')
	};
	suite[options.cmd] && options.cmd = suite[options.cmd];

	var args = {
		'vows': '--json'
	}
	args[options.cmd] && options.args.push(args[options.cmd]);

	return options;
}

function run(options, workingDir) {
	var env = _.extend(process.env, options.envs);
	var child = spawn(options.cmd, options.args, {
		cwd: workingDir,
		env: env
	});
	var timeout = undefined;

	freshenTimer();

	child.stdout.on('data', function(data) {
		freshenTimer();
		ee.emit('stdout', data);
	});
	child.stderr.on('data', function(data) {
		freshenTimer();
		ee.emit('stderr', data);
	});
	child.on('exit', function(code, signal) {
		clearTimeout(timeout);
		complete(code === 0, signal);
	});

	function freshenTimer() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(killProcess, 15000);
	};

	function killProcess() {
		try {
			if (child) {
				child.kill('SIGTERM');
				child.kill('SIGINT');
			}
		} catch (e) {
			complete(false, 'Failed to kill process: ' + e.message + '\n'
				+ e.stack);
			// now remove all listeners?
		}
	};
	function complete(win, message) {
		// check what suite it is and handle that differently, e.g. include
		// how many tests passed, etc, based on stdout, or something.
		ee.emit('complete', win, message);
	}
};

if (require.main === module) {
	var opts = {
		args: [ 'semver.js' ],
		envs: {},
		name: 'tap',
		cmd: 'tap'
	};
	var wd = '/Dropbox/dev/npmpants/slave/test_modules/node_modules/semver';
	var h = handler(opts, wd);
	h.on('complete', function(code, message) {
		console.log('>complete', code, message);
	});
	h.on('stderr', function(data) {
		if (data) console.log('>stderr', data+'');
	});
	h.on('stdout', function(data) {
		if (data) console.log('>stdout', data+'');
	});
}
