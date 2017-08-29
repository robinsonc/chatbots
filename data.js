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
         if (result['products'].hasOwnProperty(key)) {
           var element = result['products'][key];
           for (var key2 in element) {
             console.log(element[key2]['value']);
            }

         }
       }
                  

      //   var attachments = {
      //     "attachments": [
      //         {
      //             "fallback": "Required plain-text summary of the attachment.",
      //             "color": "#36a64f",
      //             "pretext": "Optional text that appears above the attachment block",
      //             "author_name": "Bobby Tables",
      //             "author_link": "http://flickr.com/bobby/",
      //             "author_icon": "http://flickr.com/icons/bobby.jpg",
      //             "title": "Slack API Documentation",
      //             "title_link": "https://api.slack.com/",
      //             "text": "Optional text that appears within the attachment",
      //             "fields": [
      //                 {
      //                     "title": "Priority",
      //                     "value": "High",
      //                     "short": false
      //                 }
      //             ],
      //             "image_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-1.jpg",
      //             "thumb_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-1.jpg",
      //             "footer": "Slack API",
      //             "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
      //             "ts": 123456789
      //         }
      //     ]
      // }
        return callback('heyy');
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;