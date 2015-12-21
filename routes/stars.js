var express = require('express');
var router = express.Router();
var mongoHelper = require('../modules/mongo_helper');
var jsonapi = require('../modules/jsonapi');
var conf = require('../modules/config');
var bluebird = require('bluebird');
var crypto = require('crypto');
var debug = require('debug')('stars-tracker:stars');
/* GET home page. */
router.post('/', function(req, res, next) {
  
  if (!req.header('X-Hub-Signature')) {
    return res.status(400).send({ message: 'Must send header X-Hub-Signature'});
  }

  var hmac = crypto.createHmac('sha1', conf.get('WEBHOOK_SECRET'));
  hmac.update(JSON.stringify(req.body));
  var digest = hmac.digest('hex');
  var sentHmac = req.header('X-Hub-Signature').split('=')[1];
  debug('computed digest: ' + digest);

  if (!sentHmac) {
    return res.status(403).send({ message: 'Unauthorized'});
  }
  if (sentHmac !== digest) {
    return res.status(403).send({ message: 'Unauthorized'});
  }
  if (!req.body) {
    return res.status(400).send({ message: 'Must send body'});
  }

  if (!req.body.sender) {
    return res.status(400).send({ message: 'Must specify sender'});
  }

  mongoHelper.connect()
  .then(db => {
    var stargazers = db.collection('stargazers');
    bluebird.promisifyAll(stargazers);
    req.body.sender._id = req.body.sender.login;
    return stargazers.saveAsync(req.body.sender);
  })
  .then(() => {
    return res.status(200).send({ message: 'Thanks!'})
  })
  .catch(err => {
    console.error(err);
    return res.status(500).send(err);
  });

});

router.get('/', function(req, res, next) {

  if (!req.query.id) {
    return res.status(400).send({ message: 'Must specify query parameter id'});
  }

  mongoHelper.connect()
  .then(db => {
    var stargazers = db.collection('stargazers');
    bluebird.promisifyAll(stargazers);

    return stargazers.findOneAsync({_id: req.query.id})
  })
  .then((result) => {

    if (result) {
      var jsonApiCompatible = jsonapi.makeJsonApiCompatible(result, result.login, 'star');
      return res.status(200).send(jsonApiCompatible);
    }
    else {
      return res.status(200).send({
        data: []
      });
    }
  })
  .catch(err => {
    console.error(err);
    return res.status(500).send(err);
  });
});

module.exports = router;
