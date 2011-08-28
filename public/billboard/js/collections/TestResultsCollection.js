(function(C) {
  C.TestResults = Backbone.Collection.extend({
    model: BB.Models.TestModel,
    url: '/api/results',
    urlRoot: '/rows/id',
    view: BB.Views.TestResultsView,

    initialize: function(config) {
      this.view = new BB.Views.TestResultsView;
    }
  });
})(BB.Collections);
