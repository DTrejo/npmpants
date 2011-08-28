BB.Models.TestModel = Backbone.Model.extend({
  initialize: function(attributes, config) {
    this.id = attributes.name;

    this.config = config;

    this.view = new BB.Views.TestView({
      id: this.id,
      model: this,
      parent: config.collection.view.el
    });
  }
});
