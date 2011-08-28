var generic = require("./generic"),
    util = require("util");

function TapHandler(cmd) {
  generic.apply(this, arguments);;
}

util.inherits(TapHandler, generic);

module.exports = TapHandler;

TapHandler.prototype.onErr = function(err, data) {
  console.log("error in TapHandler", err.toString(), data);
}
