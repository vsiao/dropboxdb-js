var Collection = require('./collection');
var Dropbox = require('dropbox');

function DropboxDB() {
  this.collections = {};
}

DropboxDB.prototype.connect = function(options) {
  this._client = new Dropbox.Client(options);
  this._client.authDriver(new Dropbox.Drivers.NodeServer(8191));
};

DropboxDB.prototype.authenticate = function(callback) {
  this._client.authenticate(function(error, client) {
    if (!error) {
      client.stat('/dropboxdb', function(error, stat) {
        if (error && error.status === 404) {
          client.mkdir('/dropboxdb', function(error, stat) {
            if (error) {
              /* too much weirdness, forget it */
              console.log('ugh i give up');
            }
          });
        }
      });
    }
    callback(error);
  });
};

DropboxDB.prototype.create = function(collection, options, cb) {
  /* TODO callback stuff */
  options = options || {};
  this.collections[collection] =
    new Collection(this._client, collection, options);
}

DropboxDB.prototype.insert = function(collection, row, cb) {
  var ths = this;
  function ondone() {
    ths.collections[collection].insert(row, cb);
  }
  if (!ths.collections.hasOwnProperty(collection)) {
    ths.create(collection, {}, ondone);
  } else {
    ondone();
  }
}

DropboxDB.prototype.drop = function(collection) {
  this._client.remove("/dropboxdb/" + collection, function(error, stat) {
    if (error) {
      return;
    }
  });
};

DropboxDB.prototype.find = function(collection, query, cb) {
  var ths = this;
  function ondone() {
    ths.collections[collection].find(query, cb)
  }
  if (!ths.collections.hasOwnProperty(collection)) {
    ths.create(collection, {}, ondone);
  } else {
    ondone();
  }
};

module.exports = new DropboxDB();
