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
});
