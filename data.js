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
          // products:['hits', JM.map('_source.product', function(input){
          //   return {"name":input.product, "price":input.price};

          // })]
        });
        
       var result = converter(data.hits);
        
       console.log(result); // should be {name: 'John'} 
        var attachments = {
          "attachments": [
              {
                  "fallback": "Required plain-text summary of the attachment.",
                  "color": "#36a64f",
                  "pretext": "Optional text that appears above the attachment block",
                  "author_name": "Bobby Tables",
                  "author_link": "http://flickr.com/bobby/",
                  "author_icon": "http://flickr.com/icons/bobby.jpg",
                  "title": "Slack API Documentation",
                  "title_link": "https://api.slack.com/",
                  "text": "Optional text that appears within the attachment",
                  "fields": [
                      {
                          "title": "Priority",
                          "value": "High",
                          "short": false
                      }
                  ],
                  "image_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-1.jpg",
                  "thumb_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-1.jpg",
                  "footer": "Slack API",
                  "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                  "ts": 123456789
              },
              {
                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
                "pretext": "second one",
                "author_name": "Robby Abraham Chacko",
                "author_link": "http://flickr.com/bobby/",
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "Adidas t shirt",
                "title_link": "https://api.slack.com/",
                "text": "Optional text that appears within the attachment",
                "fields": [
                    {
                        "title": "Priority",
                        "value": "High",
                        "short": false
                    }
                ],
                "image_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006200-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-2.jpg",
                "thumb_url": "http://myntra.myntassets.com/assets/images/1729487/2017/1/25/11485347006222-WROGN-Men-Olive-Printed-V-Neck-T-Shirt-4691485347005939-2.jpg",
                "footer": "Slack API",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": 123456789
            }
          ]
      }
        return callback(attachments);
      })
      .catch(function (err) {
        // Something bad happened, handle the error
        console.log('error:', err); 
      })
}

module.exports.call = callAPI;