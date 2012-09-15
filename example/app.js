var dropboxdb = require('../');
var cons = require('consolidate');
var express = require('express');
var path = require('path');
var app = express();

dropboxdb.connect({
  /* dropboxdb-example */
  key: '4j7ghd5e1qbe17o',
  secret: 'dirul8pr3qnhtv8',
  sandbox: true
});

app.configure(function() {
  app.engine('html', cons.handlebars);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
});

app.get('/', function(req, res) {
  res.render('index', {msg: 'hello'});
});

app.listen(3000);
console.log('Listening on port 3000');
