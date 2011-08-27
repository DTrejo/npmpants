var slave = require("./slave");

var s = slave.run(process.argv[2] || "test");

s.on("complete", function() {
	console.log("test completed");
});
