var fs = require("fs"),
  slave = require("./slave-driver");
require("colors");

var module = process.argv[2] || "test";
var s = slave.run(module);

console.log("Running with NodeJS: " + process.version);
var out = "", err = "";

s.on("out", function(data) {
  out += data;
  console.log("[test.js:out]:\n".green + data);
});

s.on("err", function(err, data) {
  err += data;
  console.log("[test.js:err]:\n".red + err, data);
});

s.on("complete", function(code, sig) {
  fs.writeFile("./logs/" + module + ".out.log", out);
  fs.writeFile("./logs/" + module + ".err.log", err);
  console.log("test completed with code:", code, 'sig:', sig);
});
