var _ = require('lodash');

function Collection(client, name, options) {
  this._client = client;
  this._path = '/dropboxdb/' + name + '/';

  this._options = options || {};
  this._options.nextKey = 1;
  this._syncOptions(true);
}

/* because we don't care */
function noop() {}

Collection.prototype._syncOptions = function(fetch) {
  var ths = this;
  var dbdbfile = ths._path + '___DBDB___';

  ths._client.stat(ths._path, function(error, stat) {
    if ((error && error.status === 404) || stat.isRemoved) {
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
    if (!attributes.hasOwnProperty(this._options.primaryKey)) {
      /* FIXME: fail no primary key given */
      return;
    }
    key = attributes[this._options.primaryKey];
  } else {
    key = this._options.nextKey++;
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

}

module.exports = Collection;
