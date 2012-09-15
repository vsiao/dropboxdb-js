
var Dropbox = require('dropbox');

function DropboxDB() {
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

module.exports = new DropboxDB();
