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
  app.use(express.bodyParser());
  app.engine('html', cons.handlebars);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
});

app.get('/', function(req, res) {
  dropboxdb.authenticate(function(error) {
    if (error) {
      res.render('index');
    } else {
      dropboxdb.userInfo(function(userInfo) {
        res.render('index', {userInfo: JSON.stringify(userInfo, null, 2)});
      });
    }
  });
});

app.get('/show', function(req, res) {
  dropboxdb.show(function(err, entries) {
    if (err) {
      res.send(500, err);
    } else {
      res.send(200, entries);
    }
  });
});

app.post('/create', function(req, res) {
  var options = {};
  if (req.body.schema) options.schema = req.body.schema;
  if (req.body.primaryKey) options.primaryKey = req.body.primaryKey;

  dropboxdb.create(req.body.collectionName, options,
    function(error, stat) {
      if (error) {
        res.send(500, error);
      } else {
        res.send(200, stat);
      }
    }
  );
});

app.delete('/drop', function(req, res) {
  dropboxdb.drop(req.body.collectionName, function(error, stat) {
    if (error) {
      res.send(500, error);
    } else {
      res.send(200, stat);
    }
  });
});

app.post('/insert', function(req, res) {
  dropboxdb.insert(
    req.body.collectionName,
    req.body.record,
    function(error, stat) {
      if (error) {
      console.log(error);
        res.send(500, error);
      } else {
      console.log(stat);
        res.send(200, stat);
      }
    }
  );
});

app.put('/update', function(req, res) {
  dropboxdb.update(
    req.body.collectionName,
    req.body.record,
    function(error, stat) {
      if (error) {
        res.send(500, error);
      } else {
        res.send(200, stat);
      }
    }
  );
});

app.delete('/remove', function(req, res) {
  dropboxdb.remove(
    req.body.collectionName,
    req.body.key,
    function(error, stat) {
      if (error) {
        res.send(500, error);
      } else {
        res.send(200, stat);
      }
    }
  );
});

app.get('/browse', function(req, res) {
  dropboxdb.find(
    req.query.collectionName,
    function(record) { return true; },
    function(err, data) {
      if (err) {
        res.send(500, err);
      } else {
        res.send(200, data);
      }
    }
  );
});

app.get('/user', function(req, res) {
  dropboxdb.userInfo(function(user){
    console.log(user);
    res.send({});
  });
});

app.get('/getLatest/:collection', function(req, res) {
  dropboxdb.getLatest(req.params.collection, 5,
    function(res) { console.log(res); }
  );
});

app.listen(3000);
console.log('Listening on port 3000');
