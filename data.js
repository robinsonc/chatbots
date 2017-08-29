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
        console.log(callback(response));

      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

var mapJson = function(data) {
  // console.log(data);
  return "heyy";
}

module.exports.call = callAPI;
module.exports.processData = mapJson;