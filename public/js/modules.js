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
    var table = $('#results')
      , sysToId = {
        Linux: 'linux'
      , SunOS: 'solaris'
      , Darwin: 'mac'
      , Windows: 'windows'
      , Cygwin: 'windows'
      }
      , result = {}
      , row, klass;

    if (results.length === 0) return;

    $('#results .result').remove();
    _.each(results, function(el, i) {
      el = el.value;
      console.log(el.name, el.passed, el.system, el.version);

      row =
      $('#results .template')
        .clone()
        .removeClass('hidden template')
        .addClass('result');

      klass = sysToId[el.system.split(' ')[0]];
      $('td', row).removeClass('greencheck redx').empty();
      $('.' + klass, row)
        .text(el.version)
        .addClass(el.passed ? 'greencheck' : 'redx');
      $('.node', row).text(el.node);

      table.append(row);
    });
  }

  // Bind the event.
  $(window).hashchange(showPackageInfo);

  // Trigger the event (useful on page load).
  $(window).hashchange();

});
