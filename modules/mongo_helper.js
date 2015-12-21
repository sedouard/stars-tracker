var MongoClient = require('mongodb').MongoClient,
  conf = require('./config');

var connect = function () {
  // Connection URL
  var url = conf.get('MONGO_URL');

  return MongoClient.connect(url)
    .catch(err => {
      console.error('Failed to conenct to: ' + url);
      console.error(err);
    });
};

module.exports = {
  connect: connect
};
