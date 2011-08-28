(function(BB) {
  BB.Run = {
    init: function() {
      this.testCollection = new BB.Collections.TestResults;
      this.testCollection.fetch();
    }
  }

  BB.Views.BasicView.defaultParent = "#results";

  $(document).ready(function() {
    BB.Run.init();
  });
})(BB);

