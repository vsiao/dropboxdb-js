var dropboxdb = require('../');
var cons = require('consolidate');
var express = require('express');
var path = require('path');
var app = express();

dropboxdb.connect({
  /* dropboxdb-example */
  key: 'iueh7hcdze8wfi9',
  secret: 'zdubg7a6w4yetes'
});

app.configure(function() {
  app.engine('html', cons.handlebars);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
});

app.get('/', function(req, res) {
  dropboxdb.authenticate(function(error, client) {
    if (error) {
      res.render('index', {msg: 'You\'re a fuck up.'});
    } else {
      res.render('index', {msg: 'You authenticated!!'});
    }
  });
});

app.listen(3000);
console.log('Listening on port 3000');
