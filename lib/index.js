
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

DropboxDB.prototype.create = function(collection, cb) {
  this._client.mkdir("/dropboxdb/" + collection, function(error, stat) {
    cb(error, stat);
  }); 
}

DropboxDB.prototype.insert = function(collection, row, cb) {
  var path = "/dropboxdb" + collection
  this._client.readdir(path, function(error, entries) { 
    this._client.writeFile(path + entries.length, JSON.stringify(row), function(error, stat) {
      cb(error, stat);
    });  
  });
}

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
