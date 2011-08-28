BB.Views.TestResultsView = BB.Views.BasicView.extend({
  tagName: 'table',
  render: function() {
  },
  tmpl: '\
    <th class="blank"></th>\
    <th class="test-platform-windows">Window</th>\
    <th class="test-platform-linux">Linux</th>\
    <th class="test-platform-osx"> Mac OSX</th>\
    <th class="test-platform-solaris">Solaris</th>\
  '
});
