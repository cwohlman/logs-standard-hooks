var testlogs = new Meteor.Collection('useful:logs/test');

if (Meteor.isServer) {
  LogOutput = {
    msgs: []
    , write: function(rec) {
      this.msgs.push(rec);
    }
    , next: function () {
      return this.msgs[this.msgs.length - 1] || {};
    }
  };

  Log._logger.addStream({
    stream: LogOutput
    , type: 'raw'
    , level: 'trace'
  });

  Tinytest.add('Useful Logs - Standard Hooks - hijack console log', function (test) {
    console.log('y');
    test.equal(LogOutput.next().msg, 'y');
    
    test.equal(LogOutput.next().name, __meteor_runtime_config__.appId);
    test.equal(LogOutput.next().hostname, __meteor_runtime_config__.ROOT_URL);
    test.equal(LogOutput.next().meteorVersion, __meteor_runtime_config__.meteorRelease);
  });

  Tinytest.add('Useful Logs - Standard Hooks - hijack console warn', function (test) {
    console.warn('y');
    test.equal(LogOutput.next().msg, 'y');
    
    test.equal(LogOutput.next().name, __meteor_runtime_config__.appId);
    test.equal(LogOutput.next().hostname, __meteor_runtime_config__.ROOT_URL);
    test.equal(LogOutput.next().meteorVersion, __meteor_runtime_config__.meteorRelease);
  });

  Tinytest.add('Useful Logs - Standard Hooks - hijack console error', function (test) {
    console.error('y');
    test.equal(LogOutput.next().msg, 'y');
    
    test.equal(LogOutput.next().name, __meteor_runtime_config__.appId);
    test.equal(LogOutput.next().hostname, __meteor_runtime_config__.ROOT_URL);
    test.equal(LogOutput.next().meteorVersion, __meteor_runtime_config__.meteorRelease);
  });

  Tinytest.add('Useful Logs - Standard Hooks - detects circular calls to console.log', function (test) {

    Log._logger.addStream({
      stream: {
        write: function () {
          console.log('circular');
      }}
      , type: 'raw'
      , level: 'trace'
    });

    console.log('y');
    test.equal(LogOutput.next().msg, 'y');
    
    test.equal(LogOutput.next().name, __meteor_runtime_config__.appId);
    test.equal(LogOutput.next().hostname, __meteor_runtime_config__.ROOT_URL);
    test.equal(LogOutput.next().meteorVersion, __meteor_runtime_config__.meteorRelease);

    Log._logger.streams.pop();
  });

  Meteor.methods({
    'test/logs/methods': function () {
      Log.log('in meteor method');
      return LogOutput.next();
    }
  });
  Meteor.publish('test/logs/publication', function () {
    Log.log('in meteor publication');
    this.added('useful:logs/test', Random.id(), LogOutput.next());
    this.ready();
  });
}

Tinytest.addAsync('Useful Logs - Standard Hooks - wrap meteor methods', function (test, next) {
  Meteor.call('test/logs/methods', function (error, result) {
    test.equal(result && result.msg, 'in meteor method');
    test.equal(result && result.methodName, 'test/logs/methods');
    test.equal(typeof (result && result.methodCallId), 'string');
    next();
  });
});

if (Meteor.isClient) {
  Meteor.subscribe('test/logs/publication', function () {
    console.log(arguments);
  });
  Tinytest.add('Useful Logs - Standard Hooks - wrap meteor publications', function (test) {
    var record = testlogs.findOne();

    test.equal(record.msg, 'in meteor publication');
    test.equal(record.publicationName, 'test/logs/publication');
    test.equal(typeof record.publicationCallId, 'string');
  });
}
