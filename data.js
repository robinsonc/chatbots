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
        var converter = JM.makeConverter({
          products: ['hits', JM.map({
              name: '_source.product',
              link: 'https://www.myntra.com/'+'_source.dre_landing_page_url',
              price:'_source.discounted_price',
              image:'_source.search_image'
          })]
        });
        
       var result = converter(data.hits);
       var attachments = { "attachments":[] };
       for (var key in result['products']) {
         if(attachments.attachments.length > 6) {
           break;
         }
         if (result['products'].hasOwnProperty(key)) {
            var element = result['products'][key];
          //  console.log(element['name']);
            var output = {
                          "fallback": element['name'],
                          "color": "#36a64f",
                          "title": element['name'],
                          "title_link": element['link'],
                          "text": "Price:"+ element['price'],
                          "image_url": element['image'],
                          "thumb_url": element['image'],
                          "footer": "Elastic API",
                          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                          "ts": + new Date()
                      };
            attachments.attachments.push(output);

         }
       }

        return callback(attachments);
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;