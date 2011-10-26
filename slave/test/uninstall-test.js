var npm = require('npm');
var path = require('path');
var npmConfig = {
	loglevel: 'silent',
	cwd: __dirname + '/test_modules'
};
var module = '7digital-api';

npm.load(npmConfig, function () {
	uninstall();
});

function uninstall() {
	var list = [ path.join(npmConfig.cwd, 'node_modules', module) ];
	console.log(list);
	npm.commands.uninstall(list, function(err, data) {
		if (err) console.log(err.stack);
		if (data && data.length) console.log(module, 'npm uninstall:', data);
	});
}
