var express = require('express');
var router = express.Router();
var mongoHelper = require('../modules/mongo_helper');
var jsonapi = require('../modules/jsonapi');
var bluebird = require('bluebird');
/* GET home page. */
router.post('/', function(req, res, next) {
  
  if (!req.body) {
    return res.status(400).send({ message: "Must send body"});
  }

  if (!req.body.sender) {
    return res.status(400).send({ message: "Must specify sender"});
  }

  mongoHelper.connect()
  .then(db => {
    var stargazers = db.collection('stargazers');
    bluebird.promisifyAll(stargazers);
    req.body.sender._id = req.body.sender.login;
    return stargazers.saveAsync(req.body.sender);
  })
  .then(() => {
    return res.status(200).send({ message: "Thanks!"})
  })
  .catch(err => {
    console.error(err);
    return res.status(500).send(err);
  });

});

router.get('/', function(req, res, next) {

  if (!req.query.user) {
    return res.status(400).send({ message: "Must specify query parameter user"});
  }

  mongoHelper.connect()
  .then(db => {
    var stargazers = db.collection('stargazers');
    bluebird.promisifyAll(stargazers);

    return stargazers.findOneAsync({_id: req.query.user})
  })
  .then((result) => {

    if (result) {
      var jsonApiCompatible = jsonapi.makeJsonApiCompatible(result, result.login, 'stargazer');
      return res.status(200).send(jsonApiCompatible);
    }
    else {
      return res.status(200).send({
        data: {}
      });
    }
  })
  .catch(err => {
    console.error(err);
    return res.status(500).send(err);
  });
});

module.exports = router;
