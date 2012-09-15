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
  dropboxdb.authenticate(function(error) {
    if (error) {
      res.render('index', {msg: 'You\'re a fuck up.'});
    } else {
      res.render('index', {msg: 'You authenticated!!'});
    }
  });
});

app.get('/create/:collection', function(req, res) {
  dropboxdb.create(req.params.collection, 
    {primaryKey: 'dog'},
    function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});
      }
    }
  );
});

app.get('/insert/:collection', function(req, res) {
  dropboxdb.insert(req.params.collection,
    {a:'A',b:'derp',c:'dawg',dog:'world'}, function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});
      }
    });
});


app.listen(3000);
console.log('Listening on port 3000');
