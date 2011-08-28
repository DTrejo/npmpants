(function(BB) {
  BB.Run = {
    init: function() {
      this.testCollection = new BB.Collections.TestResults;
      this.testCollection.fetch();
      this.testCollection.bind("reset", function() {
        $("#spinner").hide();
      });
    }
  }

  BB.Views.BasicView.defaultParent = "#results";

  $(document).ready(function() {
    BB.Run.init();
  });
})(BB);

