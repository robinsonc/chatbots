/**
*
*  Module to get the data for chatbot from API endpoint
*
*/

const request = require('request-promise');
var callAPI = function(options, callback) {
    request(options)  
      .then(function (response) {
        // Request was successful, use the response object at will
        return callback('heyy');

      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;