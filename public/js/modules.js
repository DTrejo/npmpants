$(document).ready(function() {

  // need to add the hashchange plugin or whatnot.
  $.getJSON('/api/modules/' + (window.location.hash.substring(1)), cb);
  function cb(data, status) {
    if (status === 'success') {
      $('#name').text(data.name);
      $('#description').text(data.description);
      $('#repo')
        .text(data.name)
        .attr('href', data.repository.url); // git clone URL, so deceptive. Fix!
      $('#author').text(data.author);
    } else {
      // say sorry, shit's broken.
    }
  };
});