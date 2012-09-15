var _ = require('lodash');

function Collection(client, name, options) {
  this._client = client;
  this._path = '/dropboxdb/' + name + '/';

  this._options = options || {};
  this._options.nextKey = 1;
  if (this._options.hasOwnProperty('schema') &&
      this._options.hasOwnProperty('primaryKey')) {
      if (! _.contains(this._options.schema, this._options.primaryKey)) {
      console.log("PRIMARY KEY NOT FOUND");
      return;
    }
  }
  this._syncOptions(true);
  
}

/* because we don't care */
function noop() {}

Collection.prototype._syncOptions = function(fetch) {
  var ths = this;
  var dbdbfile = ths._path + '___DBDB___';

  ths._client.stat(ths._path, function(error, stat) {
    if ((error && error.status === 404) || (!error && stat.isRemoved)) {
      ths._client.mkdir(ths._path, noop);
      ths._client.writeFile(dbdbfile, JSON.stringify(ths._options), noop);
    } else if (error) {
      console.log(error);
    } else {
      if (fetch) {
        ths._client.readFile(dbdbfile, function(err, str, stat) {
          if (error) { console.log('BADNESS'); return; }
          ths._options = JSON.parse(str);
        });
      } else {
        ths._client.writeFile(dbdbfile, JSON.stringify(ths._options), noop);
      }
    }
  });
};

Collection.prototype.insert = function(attributes, callback) {
  var key;
  if (this._options.primaryKey) {
    key = attributes[this._options.primaryKey];
  } else {
    key = this._options.nextKey++;
  }
  if (this._options.hasOwnProperty('schema')) {
    for (var i = 0; i < this._options.schema.length; i++) {
      if (! (_.contains(attributes, this._options.schema[i]))) {
        console.log("INSERTION FAILURE: MISSING REQUIRED COLUMN(S)");
        return;
      }
    }
    for (var k in attributes) {
      if (! _.contains(this._options.schema[i], k)) {
        console.log("INSERTION FAILURE: INVALID COLUMN(S)");
      }
    }
  }
  this._client.writeFile(
    this._path + key,
    JSON.stringify(attributes),
    callback
  );
  this._syncOptions();
};

Collection.prototype.find = function(query, callback) {
  var ths = this;
  ths._client.readdir(ths._path, function(error, entries) {
    if (error) {
      return;
    }
    var n = entries.length;
    var rows = new Array(entries.length);
    function sync(error, data) {
      if(error) {
        console.log(error);
      } else {
        rows.push(JSON.parse(data));
        if(--n === 0) {
          callback(rows.filter(query));
        }
      }
    };
    entries.forEach(function(entry) { 
      ths._client.readFile(ths._path + entry, sync) 
    });
  });

};


Collection.prototype.update = function(attributes, callback) {
  var key; 
}
module.exports = Collection;
