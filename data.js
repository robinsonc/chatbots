/**
*
*  Module to get the data for chatbot from API endpoint
*
*/

const request = require('request-promise');
var callAPI = function(options, callback) {
    request(options)  
      .then(function (data) {
        // Request was successful, use the response object at will
        console.log(data)
        return callback(data.hits.total);

      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;