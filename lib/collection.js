var _ = require('lodash');

function Collection(client, name, options, callback) {
  this._client = client;
  this._path = '/dropboxdb/' + name + '/';
  this._dbdbfile = this._path + '___DBDB___';
  
  this._options = options || {};
  this._options.nextKey = 1;
  if (this._options.hasOwnProperty('schema') &&
      this._options.hasOwnProperty('primaryKey')) {
      if (! _.contains(this._options.schema, this._options.primaryKey)) {
      callback({error: 'PRIMARY KEY NOT FOUND'});
      return;
    }
  }
  this._syncOptions(true, callback);
}

/* because we don't care */
function noop() {}

Collection.prototype._syncOptions = function(fetch, callback) {
  var ths = this;
  ths._client.stat(ths._path, function(error, stat) {
    if ((error && error.status === 404) || (!error && stat.isRemoved)) {
      ths._client.mkdir(ths._path, noop);
      ths._client.writeFile(
        ths._dbdbfile,
        JSON.stringify(ths._options),
        callback
      );
    } else if (error) {
      console.log(error);
      callback(error);
    } else {
      if (fetch) {
        ths._client.readFile(ths._dbdbfile, function(err, str, stat) {
          if (error) { console.log('BADNESS'); callback(error); return; }
          if (!stat.isRemoved) {
            ths._options = JSON.parse(str);
          }
          callback();
        });
      } else {
        ths._client.writeFile(
          ths._dbdbfile,
          JSON.stringify(ths._options),
          callback
        );
      }
    }
  });
};

Collection.prototype._findKey = function(key, attributes, callback) {
  var ths = this;
  this._client.stat(ths._path + key, function(error, stat) {
    if (error) {
      attributes.ID = key;
      ths._client.writeFile(
        ths._path + key,
        JSON.stringify(attributes),
        callback
      );
    } else {
      if (stat.isFile && !stat.isRemoved) {
        callback({error: 'Key already exists; try again'});
      } else {
        attributes.ID = key;
        ths._client.writeFile(
          ths._path + key,
          JSON.stringify(attributes),
          callback
        );
      }
    }
  });    
}

Collection.prototype.insert = function(attributes, callback) {
  var key;
  var ths = this;
  var options = ths._options;
  if (options.primaryKey) {
    key = attributes[options.primaryKey];
  } else {
    key = options.nextKey++;
    attributes.ID = key;
  }
  if (this._options.hasOwnProperty('schema')) {
    var schema = options.schema;
    for (var i = 0; i < schema.length; i++) {
      if (!attributes.hasOwnProperty(schema[i])) {
        callback({
          status: 400,
          responseText: JSON.stringify({
            error:'Missing Required Column: ' + schema[i]
          })
        });
        return;
      }
    }
    for (var k in attributes) {
      if (! _.contains(schema, k)) {
        if (!(k === 'ID')) {
          callback({
            status: 400,
            responseText: JSON.stringify({
              error:'Invalid Column: ' + k
            })
          });
          return;
        }
      }
    }
  }
  this._findKey(key, attributes, callback);
  this._syncOptions(false, noop);
};

Collection.prototype.update = function(key, attributes, callback) {
  var ths = this;
  var options = ths._options;
  if (ths._options.hasOwnProperty('schema')) {
    var schema = options.schema;
    for (var i = 0; i < schema.length; i++) {
      if (!attributes.hasOwnProperty(schema[i])) {
        callback({
          status: 400,
          responseText: JSON.stringify({
            error:'Missing Required Column: ' + schema[i]
          })
        });
        return;
      }
    }
    for (var k in attributes) {
      if (!_.contains(schema, k)) {
        callback({
          status: 400,
          responseText: JSON.stringify({
            error:'Invalid Column: ' + k
          })
        });
        return;
      }
    }
  }
  
  if (options.hasOwnProperty('primaryKey')) {
    key = attributes[options.primaryKey];
  } else {
    attributes.ID = Number(key);
  }
  ths._client.readFile(ths._path + key, function(error, str, stat) {
    if (error) {
      callback(error);
    } else {
      ths._client.writeFile(
        ths._path + key,
        JSON.stringify(attributes),
        callback
      )
    }
  });
};

Collection.prototype.find = function(query, callback) {
  var ths = this;
  ths._client.readdir(ths._path, function(error, entries) {
    if (error) {
      callback(error);
      return;
    }
    var n = entries.length - 1;
    var rows = [];
    function sync(error, data) {
      if (error) {
        console.log(error);
      } else {
        rows.push(JSON.parse(data));
      }
      if(--n === 0) {
        callback(error, rows.filter(query));
      }
    };
    entries.forEach(function(entry) { 
      if (entry !== "___DBDB___") {
        ths._client.readFile(ths._path + entry, sync);
      }
    });
  });

};

Collection.prototype.getLatest = function(limit, callback) {
  var ths = this;
  var latest = (ths._options.nextKey) - 1;
  if (ths._options.hasOwnProperty('primaryKey')) {
    console.log("ONLY USABLE ON TABLES LABELLED BY ID");
    return;
  }
  ths._client.readdir(ths._path, function(error, entries) {
    if (error) {
      return;
    }
    var n = Math.min(entries.length-1, limit);
    var rows = [];
    function sync(error, data) {
      if (error) {
        console.log(error);
      } else { 
        rows.push(JSON.parse(data));
        if (--n == 0) {
          callback(rows)
        }
      }
    };
  for (var i = 0; i < n; i++) {
    ths._client.readFile(ths._path + (latest - i), sync);
  }
  });
};
module.exports = Collection;
