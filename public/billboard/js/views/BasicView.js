BB.Views.BasicView = Backbone.View.extend({
  initialize: function(config) {
    this.config = config || {};
    
    this.render();
    $(this.el).appendTo(this.config.parent || BB.Views.BasicView.defaultParent);
  },
  render: function() {
    if(this.tmpl) {
      $(this.el).append(_.template(this.tmpl, this.config.model.toJSON()));
    }
  }
});

BB.Views.BasicView.defaultParent = "body";
