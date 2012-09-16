DropboxDB.js
============

##npm install dropboxdb##

```javascript
var dropboxdb = require('dropboxdb')

// USER

/**
 * @brief Fetch UserInfo provided by Dropbox API
 * @param callback(error, userInfo);
 */
dropboxdb.userInfo(callback);

// COLLECTIONS

/** 
 * @brief List the collections in your DBDB
 * @param callback(error, collections)
 */
dropboxdb.show(callback);

/** 
 * @brief Creates a collection in your DBDB
 * @param collection: the name of the collection
 * @param options: object optionally containing
 *          schema: array of required column names
 *          primaryKey: field to name files with
 * @param callback(error, stat)
 */
dropboxdb.create(collection, options, callback);

/**
 * @brief Drop a collection from your DBDB
 * @param collection: the name of the collection
 * @param callback(error, stat)
 */
dropboxdb.drop(collection, callback);

// RECORDS

/**
 * @brief Inserts a record into a collection
 * @param collection: the name of the collection
 * @param record: object containing record attributes
 * @param callback(error, stat)
 */
dropboxdb.insert(collection, record, callback);

/**
 * @brief Updates a record in a collection
 * @param collection: the name of the collection
 * @param key: key of the record to update
 * @param record: attributes to update with
 * @param callback(error, stat)
 */
dropboxdb.update(collection, key, record, callback);

/**
 * @brief Removes a record from a collection
 * @param collection: the name of the collection
 * @param key key of the record to remove
 * @param callback(error, stat)
 */
dropboxdb.remove(collection, key, callback);

/**
 * @brief Finds a set of records in a given collection
 * @param collection: the name of the collection
 * @param filter: the fetched collection contains only
 *                records for which filter(record) is truthy
 * @param callback(error, results)
 */
dropboxdb.find(collection, filter, callback);
```
