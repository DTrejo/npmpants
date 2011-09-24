BB.Views.TestView = BB.Views.BasicView.extend({
  className: "module-section",
  tmpl: '\
      <div class="module-name"><%=id%></div> \
      <div class="module-results">\
        <% mod=this;if(_.size(doc.tests) > 0) _.each(doc.tests, function(test, version){ %>\
          <div class="result-version">\
            <div class="module-version"><%= version !== "undefined" ? version : "NPM Install Failed" %></div>\
			<div class="result-platforms">\
				<% _.each(test, function(results, platform) { %>\
				  <div class="result-platform">\
					<div class="result-platform-name"><%=platform.split(" ")[0]%></div>\
					<% _.each(results, function(result, nodeVersion) { %>\
					  <div class="result-node-version <%=result.passed ? "greencheck":"redx"%>"><%=nodeVersion%></div>\
					<% }); %>\
				  </div>\
				<%});%>\
			</div>\
          </div>\
        <% }); %>\
      </div>\
    '
});
