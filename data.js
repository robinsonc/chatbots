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
          all_products: ['hits', JM.map('_source.product')],
          products:['hits', JM.map('_source.product', function(input){
            return {"name":input.product, "price":input.price};

          })]
        });
        
       var result = converter(data.hits);
        
       console.log(result); // should be {name: 'John'} 

        return callback('<img src="http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-1.jpg" alt="img">');

      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;