(function(glob) {
if(!("BB" in glob))
  glob.BB = {};

glob.BB = {
  init: function() {
    this.fetchTestResults();
  },

  fetchTestResults: function() {
    $.ajax({
      dataType: 'json',
      error: _.bind(this.handleFetchError, this),
      url: "/api/results",
      success: _.bind(this.handleFetchSuccess, this)
    });
  },

  handleFetchError: function() {},
  handleFetchSuccess: function(results) {
    console.log(results);
  }
}

$(document).ready(function() {
  BB.init();
});
})(this);

