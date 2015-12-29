var MongoClient = require('mongodb').MongoClient,
    conf = require('./config'),
    connection = null,
    debug = require('debug')('stars-tracker:mongodb');

var connect = function () {
  // Connection URL
  var url = conf.get('MONGO_URL');

  if (connection) {
    return new Promise((resolve, reject) => {
      debug('reusing mongodb connection');
      return resolve(connection);
    });;
  }

  return MongoClient.connect(url)
  .then(conn => {
    debug('successfully connected to mongodb');
    connection = conn;
    return connection;
  })
  .catch(err => {
    console.error('Failed to conenct to: ' + url);
    console.error(err);
  });
};

module.exports = {
  connect: connect
};
