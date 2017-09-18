var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/co2';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 truncateCollection(db, function() {
    db.close();
  });

});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('user_session');
  // Insert some documents
  collection.insertMany([
    {product : "Jeans", product_brand : "CR7", product_size : "36", product_color : "Blue"}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted 4 documents into the collection");
    callback(result);
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('user_session');
  // Find some documents
  collection.find({"product" : "Jeans"}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });      
}

var truncateCollection = function(db ,callback) {
    db.collection('user_session',function(err, collection){
   	 collection.remove({},function(err, removed){
    		console.log("Truncated");
         });
    });
}
