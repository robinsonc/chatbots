var MongoClient = require( 'mongodb' ).MongoClient;

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb://localhost:27017/co2", function( err, db ) {
      _db = db;
      console.log('connected to database');
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
