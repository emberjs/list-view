var logger = require('morgan');
var express = require('express');
var app = express();

app.use(logger());
app.use(express.static(__dirname + '/../'));

app.get('/', function(req, res) {
  res.redirect("demos/index.html");
});

var port = process.env.PORT || 9292
console.log('demo running on port: ' + port);
app.listen(port);

