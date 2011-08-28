// runs on /modules/
$(document).ready(function() {
  function showPackageInfo() {
    console.log('showPackageInfo');
    var noResultFound = {
      name: 'Module Not Found'
    , description: 'Module not found'
    , repository: { github: '' }
    , author: { name: '' }
    };
    spinner(true);
    $.getJSON('/api/modules/' + (window.location.hash.substring(1)), cb);
    function cb(data, status) {
      spinner(false);
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
        } else {
          $('#results .result').remove();
          $('#results').append('<tr class="result"><td>No Results</td></tr>');
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
      };

    if (results.length === 0) return;

    $('#results .result').remove();
    console.log(results);
    var tests = results.tests;
    for (var moduleVersion in tests) {
      for (var system in tests[moduleVersion]) {
        for (var nodeVersion in tests[moduleVersion][system]) {
          var data = tests[moduleVersion][system][nodeVersion];
          appendTestResult(moduleVersion, system, nodeVersion, data);
        }
      }
    }

    function appendTestResult(version, system, node, data) {
      console.log(version, system, node, data.passed);
      var row =
      $('#results .template')
        .clone()
        .removeClass('hidden template')
        .addClass('result');

      var klass = sysToId[system.split(' ')[0]];
      $('td', row).removeClass('greencheck redx').empty();
      $('.' + klass, row)
        .text(version)
        .addClass(data.passed ? 'greencheck' : 'redx')
        .attr('title', data.passed ? 'passed!' : 'failed');
      $('.node', row).text(node);

      table.append(row);
    }
  }
  function spinner(on) {
    $('#spinner').css('visibility', on ? 'visible' : 'hidden');
  }

  // Bind the event.
  $(window).hashchange(showPackageInfo);

  // Trigger the event (useful on page load).
  $(window).hashchange();

});
