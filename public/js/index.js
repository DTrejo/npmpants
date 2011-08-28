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
        source: moduleNames.reverse()
      , delay: 100
      });
    } else {
      console.log('fail.');
    }
  }


  // Load realtime data
  now.testUpdated = function(data) {
    if (console) {
      console.log("Updated", data);
    }
  };
  
  // Add to list of recently updated repos
  now.addToRecent = function(moduleArr) {
    $(".recentitem").each(function(i) {
      if(i > (9-moduleArr.length) ) {
        $(this).remove();
      }
    });
    for(var i = 0, ii = moduleArr.length; i < ii; i++) {
      $("#recentbar").prepend($("<a></a>").addClass('recentitem').text(moduleArr[i]).attr('href', '/modules/#' + moduleArr[i]));
    }
  }
  
});
