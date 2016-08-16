'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  var path = `${process.env.DOMAIN}:${process.env.PORT}`;
  res.render('index', {path});
});

router.get('/:game/move/:from/:to', function (req, res) {
  let p = req.params;

  console.log(`Moving game ${p.game} from ${p.from} to ${p.to}`);

  res.io.sockets
    .in(p.game)
    .emit('move piece', {
      from: req.params.from,
      to: req.params.to
    });

  res.sendStatus(200);
});

module.exports = router;
