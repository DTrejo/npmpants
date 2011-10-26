var spawn = require('child_process').spawn,
	events = require('events'),
	path = require('path'),
	util = require('util'),
	_ = require('underscore'),
	globSync = require('glob').globSync;

//
// should be a drop-in for generic.js
//
module.exports = handler;
function handler() {
	var ee = new events.EventEmitter;

	// just tack on whatever we want to export
	// handler.run = run

	// options = detectAndUseSuite(options);

	// start things
	// run(options, workingDir);
	ee.run = function(options, workingDir) {
		run(options, workingDir, ee);
	};
	return ee;
}

function run(options, workingDir, ee) {
	options = processCmdLine(options, workingDir);
	options = detectAndUseSuite(options);
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

function processCmdLine(cmd, run_path) {
	var commandLine = {
		args: [],
		envs: {},
		name: ''
	}, env;
	cmd = cmd.split(' ');

	commandLine.name = cmd[0];

	// check for environment variables
	while (cmd[0] && cmd[0].indexOf('=') > -1) {
		env = cmd.shift().split('=');
		commandLine.envs[env[0]] = env[1];
	}

	// console.log('Determining test suite: ' + cmd[0]);

	// cmd[0] should be the executable
	commandLine.args = cmd.slice(1);
	// if an argument contains ./ or * it will likely need to be expanded to a
	// file list
	if (commandLine.args.join("").match(/(\*|\.\/>)/) !== null) {
		commandLine.args.forEach(function(arg, i, args) {
			var match = globSync(path.join(run_path, arg));
			// yup, found files
			match.forEach(function(file, index, files) {
				// make paths absolute, w/ better cwd for execution this wont be
				// needed
				files[index] = file.replace(run_path, "");
			});
			// replace the orignal arg with the file list
			args[i] = match;
		});
		// flattening will change the file list to a single arg for each file
		commandLine.args = _(commandLine.args).flatten();
	}

	// Set cmd to name of test suite, cmd[0]
	commandLine.cmd = cmd[0];

	return commandLine;
};

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
	if (suite[options.cmd]) {
		options.cmd = suite[options.cmd];
	}

	var args = {
		'vows': '--json'
	};
	args[options.cmd] && options.args.push(args[options.cmd]);

	return options;
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
