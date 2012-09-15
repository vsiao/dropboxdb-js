var dropboxdb = require('../');
var cons = require('consolidate');
var express = require('express');
var path = require('path');
var app = express();

dropboxdb.connect({
  /* dropboxdb-example */
  key: 'oam7u7ywtam4uy9',
  secret: 'rnmduug4yrne9q4'
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
  dropboxdb.insert(req.params.collection,
    {a:'A',b:'herp',c:'dawg',dog:'eat'}, function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});
      }
    });
});

app.get('/drop/:collection', function(req, res) {
  dropboxdb.drop(req.params.collection, function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});  
      }
    });
});

app.get('/find/:collection', function(req, res) {
  dropboxdb.find(req.params.collection, function(row) {return row['b'] === 'herp';}, function(res) {
    console.log(res);
  });
});


app.listen(3000);
console.log('Listening on port 3000');
