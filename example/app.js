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
    {schema: ['a', 'b', 'c', 'dog']},
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
    {a:'A',b:'derp',c:'dawg',dog:'world'},
    function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});
      }
    }
  );
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
  dropboxdb.find(req.params.collection,
    function(row) {return true;},
    function(res) {
      console.log(res);
    }
  );
});

app.get('/user', function(req, res) {
  dropboxdb.userInfo(function(user){
    console.log(user);
  });
});

app.get('/remove/:collection', function(req, res) {
  dropboxdb.remove(req.params.collection, 'eat', function(error, stat) {
    if (error) {
      console.log("ERROR REMOVING: " + error.status);
      return;
    }
  });
});

app.get('/update/:collection', function(req, res) {
  dropboxdb.update(req.params.collection,
    {a:'A',b:'lerp',c:'dawg',dog:'world', ID:'2'},
    function(error, stat) {
      if (error) {
        res.render('index', {msg: error});
      } else {
        res.render('index', {msg: stat});
      }
    }
  );
});

app.get('/show', function(req, res) {
  dropboxdb.show(function(entries) {
    console.log(entries);
  });
});

app.listen(3000);
console.log('Listening on port 3000');
