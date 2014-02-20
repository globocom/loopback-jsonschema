var loopback = require('loopback');

beforeEach(function () {
  this.app = loopback();

  // setup default data sources
  loopback.setDefaultDataSourceForType('db', {
    connector: loopback.Memory
  });

  loopback.setDefaultDataSourceForType('mail', {
    connector: loopback.Mail,
    transports: [
      {type: 'STUB'}
    ]
  });

  // auto attach data sources to models
  loopback.autoAttach();
});
