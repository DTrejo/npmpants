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
});
