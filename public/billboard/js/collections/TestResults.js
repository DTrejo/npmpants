(function(C) {
  C.TestResults = Backbone.Collection.extend({
    url: '/api/results',
    urlRoot: '/rows/id'
  });
})(BB.Collections);
