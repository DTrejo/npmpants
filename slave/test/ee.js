var cp = require("child_process"),
	events = require("events"),
	path = require("path"),
	util = require("util"),
	_ = require("underscore");

module.exports = ee;

function ee() {
	var em = new events.EventEmitter;
	
	// our own things we then export
	em.start = function() {
		em.emit('data', 'hi1')
		em.emit('data', 'hi2')
		em.emit('data', 'hi3')
		em.emit('complete', null, 'done!');
	};
	return em;
}

var e = new module.exports;
// OR
// var e = module.exports();
e.on('data', function(data) {
	console.log(data);
})

e.on('complete', function(err, data) {
	console.log(data);
})
e.start();
