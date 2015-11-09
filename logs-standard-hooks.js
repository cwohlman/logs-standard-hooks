var inConsoleLog = new Meteor.EnvironmentVariable();
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
      if (inConsoleLog.get() || message === 'LISTENING') {
        return Log._console[level].apply(console, args);
      }
      
      return inConsoleLog.withValue(true, function () {
        return Log[level].apply(Log, args);
      });
    };
  });
  if (Meteor.isServer) {
    Log._methods = Meteor.methods;
    Meteor.methods = function (methods) {
      _.each(methods, function (fn, name) {
        methods[name] = function () {
          var args = _.toArray(arguments);
          var self = this;
          return Log.withContext({
            methodName: name
            , methodCallId: Random.id()
            , userId: Meteor.userId && Meteor.userId()
          }, function () {
            return fn.apply(self, args);
          });
        };
      });
      return Log._methods.apply(this, arguments);
    };
    Log._publish = Meteor.publish;
    Meteor.publish = function (name, fn) {
      var args = _.toArray(arguments);
      args[1] = function () {
        var args = _.toArray(arguments);
        var self = this;
        return Log.withContext({
          publicationName: name
          , userId: self.userId
          , publicationCallId: Random.id()
        }, function () {
          return fn.apply(self, args);
        });
      };
      return Log._publish.apply(this, args);
    };    
  }
};