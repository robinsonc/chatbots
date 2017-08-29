/**
*
*  Module to get the data for chatbot from API endpoint
*
*/

const request = require('request-promise');
var callAPI = function(options) {

    request(options)  
      .then(function (response) {
        // Request was successful, use the response object at will
         if(response && response.statusCode == 200) {
          console.log(response);
          }
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;