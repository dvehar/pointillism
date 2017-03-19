var path    = require('path');
var express = require('express');
var DeltaE = require('delta-e');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'default', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.get('/', function (req, res) {
  res.render('index.hbs', {
    'packageVersion': process.env.npm_package_version
  });
});

app.post('/delta-e', function (req, res) {
  console.log('in POST delta-e');
  console.log(req.body);
  var lab1 = req.body.lab1;
  var lab2 = req.body.lab2;
  var result = DeltaE.getDeltaE00(lab1, lab2);
  console.log(result);
  res.send(JSON.stringify({result: result}));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var port = process.env.PORT || 7000;
app.listen(port, function () {
  console.log('Example app listening on port ' +  port);
});
