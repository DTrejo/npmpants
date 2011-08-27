$(document).ready(function() {
  var input = $('#input')
    , button = $('#button');

  input.bind('keypress', function(e) {
    if (e.keyCode === 13) {
      button.click();
      e.preventDefault();
      return false;
    }
  });
  button.click(function(e) {
    var module = escape($.trim(input.val())) || 'express';
    window.location = '/modules/#' + module;
    e.preventDefault();
    return false;
  });

  $.getJSON('/js/_all_docs.json', cb);
  function cb(data, status) {
    if (status === 'success') {
      var moduleNames = []
        , name = ''
        , ac = undefined;
      for (var i = data.rows.length - 1; i >= 0; i--) {
        name = data.rows[i].id;
        if (name) moduleNames.push(data.rows[i].id);
      }
      input.autocomplete({ 
        source: moduleNames 
      , autoFocus: true
      , delay: 50
      });
    } else {
      console.log('fail.');
    }
  }


  /* Load realtime data */
  now.projectUpdated = function(data) {
    if(console) {
      console.log("Updated", data);
    }
  }
});
