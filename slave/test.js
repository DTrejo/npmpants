var slave = require("./slave-driver");

var s = slave.run(process.argv[2] || "test");

s.on("complete", function(code, sig) {
	console.log("test completed with code:", code, 'sig:', sig);
});
