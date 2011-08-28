var generic = require("./generic"),
    util = require("util");

function TapHandler(cmd) {
  generic.call(this, cmd);
}

util.inherits(TapHandler, generic);

module.exports = TapHandler;
