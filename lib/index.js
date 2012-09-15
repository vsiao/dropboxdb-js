
var Dropbox = require('dropbox');

function DropboxDB() {
  this.collections = {};
}

DropboxDB.prototype.connect = function(options) {
  this._client = new Dropbox.Client(options);
  this._client.authDriver(new Dropbox.Drivers.NodeServer(8191));
};

DropboxDB.prototype.authenticate = function() {
  this._client.authenticate(function(error, client) {
    if (error) {
      /* FUCK IT */
      return;
    }
  });
};

DropboxDB.prototype.drop = function(collection) {
  this._client.remove("/dropboxdb/" + collection, function(error, stat) {
    if (error) {
      return;
    }
  });
};

DropboxDB.prototype.find = function(collection, query, fields, cb) {
  this._client.readdir("/dropboxdb/" + collection, function(error, entries) {
    if (error) {
      return;
    }
    // filter the results or something.
  });
};

module.exports = new DropboxDB();
