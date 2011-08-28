BB.Views.TestView = BB.Views.BasicView.extend({
  tagName: "tr",
  tmpl: '\
      <td class="module-name"><%=id%></td> \
      <td class="module-results">\
        <% mod=this;if(_.size(doc.tests) > 0) _.each(doc.tests, function(test, version){ %>\
          <div class="result-version">\
            <div class="module-version"><%= version !== "undefined" ? version : "NPM Install Failed" %></div>\
            <% _.each(test, function(results, platform) { %>\
              <div class="result-platforms">\
                <div class="result-platform"><%=platform.split(" ")[0]%></div>\
                <% _.each(results, function(result, nodeVersion) { %>\
                  <div class="result-node-version <%=result.passed ? "passed":"failed"%>"><%=nodeVersion%></div>\
                <% }); %>\
              </div>\
            <%});%>\
          </div>\
        <% }); %>\
      </td>\
    '
});
