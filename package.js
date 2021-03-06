Package.describe({
  name: 'useful:logs-standard-hooks',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('underscore');
  api.use('random');

  api.addFiles('logs-standard-hooks.js');

  api.export('LogsHook');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('random');
  api.use('accounts-base');

  api.use('useful:logs');
  api.use('useful:logs-standard-hooks', 'server');

  api.addFiles('logs-standard-hooks-tests.js');
});
