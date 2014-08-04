var logger = require('morgan');
var express = require('express');
var app = express();

app.use(logger());
app.use(express.static(__dirname + '/../'));

app.get('/', function(req, res) {
  res.redirect("demos/index.html");
});
app.listen(process.env.PORT || 9292);
