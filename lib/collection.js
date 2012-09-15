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

module.exports = Collection;
