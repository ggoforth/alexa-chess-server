var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  var path = `${process.env.DOMAIN}:${process.env.PORT}`;
  res.render('index', {path});
});

router.get('/move/:from/:to', function (req, res) {
  console.log(`Moving from ${req.params.from} to ${req.params.to}`);
  
  res.io.emit('move piece', {
    from: req.params.from,
    to: req.params.to
  });
  
  res.sendStatus(200);
});

module.exports = router;
