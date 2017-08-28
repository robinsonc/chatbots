/**
*
*  Module to get the data for chatbot from API endpoint
*
*/

var http = require("http");
var callAPI = function(options) {
    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();
}

// var Curl = require( 'node-libcurl' ).Curl;

// var curl = new Curl();
// var callAPI = function(options) {
// curl.setOpt( 'URL', 'http://or1010051031099.corp.adobe.com:9200/myntra/_search?q=global_attr_article_type%3ATshirts%20AND%20sizes%3AM%20' );
// curl.setOpt( 'FOLLOWLOCATION', true );

// curl.on( 'end', function( statusCode, body, headers ) {

//     console.info( statusCode );
//     console.info( '---' );
//     console.info( body );
//     console.info( '---' );
//     console.info( this.getInfo( 'TOTAL_TIME' ) );

//     this.close();
// });

// curl.on( 'error', function ( err, curlErrCode ) {

//     console.error( 'Err: ', err );
//     console.error( 'Code: ', curlErrCode );
//     this.close();
// });
// curl.perform();
// }

module.exports.call = callAPI;