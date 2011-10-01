var fs = require("fs"),
	jsdom = require("jsdom"),
	path = require("path"),
	weld = require("weld").weld;

exports.compile = function(markup, opts) {
	var doc = jsdom.jsdom(markup);

	if(opts.body) {
		doc.getElementById("page").innerHTML = opts.body;
	}

	function processSubs() {
		var subtemplates = doc.getElementsByTagName("link");

		for(var i = 0, complete = 0; i < subtemplates.length; i++) {
			var sub = subtemplates[i];
			if(sub.rel !== "template") {
				complete++;
				continue;
			}

			var content = fs.readFileSync(path.join(process.cwd(), "public", sub.href));

			sub.innerHTML = content + sub.innerHTML;
			// sub.parentNode.removeChild(sub);
			sub.rel = "";

			if(++complete === subtemplates.length) {
				processSubs();
			}
		}
	}

	processSubs();

	return function(vars) {
		weld(doc, vars);
		return doc.outerHTML;
	}
}

exports.render = function(markup, vars) {
	return weld(jsdom.jsdom(markup), vars);
}
