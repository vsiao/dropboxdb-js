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
          client.mkdir('/dropboxdb', callback);
        } else {
          callback(error, client);
        }
      });
    } else {
      callback(error, client);
    }
  });
};


DropboxDB.prototype.create = function(collection, options, cb) {
  options = options || {};
  this.collections[collection] =
    new Collection(this._client, collection, options, cb);
}

DropboxDB.prototype.insert = function(collection, attr, cb) {
  var ths = this;
  function ondone() {
    ths.collections[collection].insert(attr, cb);
  }
  if (collection.hasOwnProperty('primaryKey')) {
    if (!row.hasOwnProperty(collection.primaryKey)) {
      console.log("MISSING PRIMARY KEY");
      return;
    }
  }
    
  if (!ths.collections.hasOwnProperty(collection)) {
    ths._client.readFile('/dropboxdb/' + collection + '/___DBDB___',
      function(error, str, stat) {
        if (error) { console.log(collection); return; }
        ths.collections[collection] =
          new Collection(ths._client, collection, JSON.parse(str), ondone);
      }
    );
  } else {
    ondone();
  }
}


DropboxDB.prototype.update = function(collection, row, cb) {
  var ths = this;
  function ondone() {
    ths.collections[collection].update(row, cb);
  }
  if (!ths.collections.hasOwnProperty(collection)) {
    ths._client.readFile('/dropboxdb/' + collection + '/___DBDB___',
      function(error, str, stat) {
        if (error) { console.log(collection); return; }
        ths.collections[collection] =
          new Collection(ths._client, collection, JSON.parse(str), ondone);
      }
    );
  } else {
    ondone();
  }
};

DropboxDB.prototype.remove = function(collection, primaryKey, callback) {
  this._client.remove(
    "/dropboxdb/" + collection + "/" + primaryKey,
    callback
  );
};

DropboxDB.prototype.drop = function(collection, callback) {
  this._client.remove("/dropboxdb/" + collection, callback);
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

DropboxDB.prototype.userInfo = function(callback) {
  this._client.getUserInfo(function(error, userInfo, rawUserInfo){
    if(error) {
      callback(error);
    } else {
      callback(userInfo);
    }
  });
};

DropboxDB.prototype.show = function(cb) {
  this._client.readdir("/dropboxdb/", function(error, entries){
    if(error) {
      return;
    }
    cb(entries);
  }); 	
};

DropboxDB.prototype.getLatest = function(collection, limit, cb) {
  var ths = this;
  function ondone() {
    ths.collections[collection].getLatest(limit, cb);
  }
  if (!ths.collections.hasOwnProperty(collection)) {
    ths._client.readFile('/dropboxdb/' + collection + '/___DBDB___',
      function(error, str, stat) {
        if (error) { console.log(collection); return; }
        ths.collections[collection] =
          new Collection(ths._client, collection, JSON.parse(str), ondone);
      }
    );
  } else {
    ondone();
  }  
};

module.exports = new DropboxDB();
