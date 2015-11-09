var isCircular = new Meteor.EnvironmentVariable();
LogsHook = function (Log) {
  Log._console = {};
  _.each(['log', 'warn', 'error'], function (level) {
    Log._console[level] = console[level];
    console[level] = function (message) {
      var args = _.toArray(arguments);

      // XXX find a way to avoid this hack: || message === 'LISTENING'
      // what's going on here is that the meteor app is using stdout
      // to send a message to the meteor proxy that it's ready. Since we
      // do some formatting of the message, this is problematic.
      if (isCircular.get() || message === 'LISTENING') {
        return Log._console[level].apply(console, args);
      }
      
      return isCircular.withValue(true, function () {
        return Log[level].apply(Log, args);
      });
    };
  });
};