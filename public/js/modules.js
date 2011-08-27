// runs on /modules/
$(document).ready(function() {
  function showPackageInfo() {
    var noResultFound = {
      name: 'Module Not Found'
    , description: 'Module not found'
    , repository: { github: '' }
    , author: { name: '' }
    };

    $.getJSON('/api/modules/' + (window.location.hash.substring(1)), cb);
    function cb(data, status) {
      if (status === 'success') {

        if (!data || !data.name) {
          data = noResultFound;
        }
        $('#name').text(data.name);

        // description
        if (data.description) {
          $('#description').text(data.description);
        } else {
          $('#description').text('(No description)');
        }

        // link to repo, if found
        if (data.repository && data.repository.github) {
          $('#repo')
            .attr('href', data.repository.github)
            .text(data.name);
        } else {
          $('#repo').parent().text('(Github URL not found for this package)');
        }

        // author name
        if (data.author && data.author.name) {
          $('#author').text(data.author.name);
        } else {
          $('#author').text('(Author not listed)');
        }

        // test results
        if (data['test-results']) {
          insertResults(data['test-results']);
        }

      } else {
        $('#description').text('Sorry, the request to the server failed.');
      }
    };
  }

  function insertResults(results) {
    console.log(results);
    // TODO code this.
  }

  // Bind the event.
  $(window).hashchange(showPackageInfo);

  // Trigger the event (useful on page load).
  $(window).hashchange();

});
