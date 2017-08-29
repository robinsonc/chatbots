/**
*
*  Module to get the data for chatbot from API endpoint
*
*/

const request = require('request-promise');
var JM = require('json-mapper');
var callAPI = function(options, callback) {
    request(options)  
      .then(function (data) {
        // Request was successful, use the response object at will
        // console.log(data.hits.hits);
        var converter = JM.makeConverter({
          all_products: ['hits', JM.map('_source')]
        });
        
       var result = converter(data.hits);
        
       console.log(result); // should be {name: 'John'} 

        return callback('heyy');

      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;