// runs on /modules/
$(document).ready(function() {

  // need to add the hashchange plugin or whatnot.
  $.getJSON('/api/modules/' + (window.location.hash.substring(1)), cb);
  function cb(data, status) {
    if (status === 'success') {
      console.log(data);
      $('#name').text(data.name);
      $('#description').text(data.description);
      if (data.repository.github) {
        $('#repo')
          .attr('href', data.repository.github)
          .text(data.name);
      } else {
        $('#repo').parent().text('(Github URL not found for this package)');
      }
      if (data.author.name) {
        $('#author').text(data.author.name);
      } else {
        console.log(data.maintainer);
        $('#author').text('(Author not listed)');
      }

    } else {
      $('#description').text('Sorry, the request to the server failed.');
    }
  };
});
