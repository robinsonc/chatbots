/**
 *
 *  Module to get the data for chatbot from API endpoint
 *
 */

const request = require('request-promise');
var JM = require('json-mapper');
var callAPI = function (options, callback) {
    //console.log(options);
    request(options)
        .then(function (data) {
            // Request was successful, use the response object at will
            var converter = JM.makeConverter({
                products: ['hits', JM.map({
                    name: '_source.product',
                    link: '_source.dre_landing_page_url',
                    price: '_source.discounted_price',
                    image: '_source.search_image'
                })]
            });
            if(data.hits.total > 0) {
                var result = converter(data.hits);
                // console.log(result);
                var attachments = {
                    "attachmentLayout": "carousel",
                    "attachments": []
                };
                for (var key in result['products']) {
                    if (result['products'].hasOwnProperty(key)) {
                        var element = result['products'][key];
                        var output = {
                            contentType: 'application/vnd.microsoft.card.hero',
                            content: {
                                title: element['name'],
                                subtitle: "&#8377;" + element['price'],
                                images: [{
                                    url: element['image']
                                }],
                                buttons: [{
                                    type: "openUrl",
                                    title: "View Details",
                                    value: 'https://www.myntra.com/' + element['link']
                                }]
                            }
                        };
                        attachments.attachments.push(output);
    
                    }
                }
                return callback(attachments);
            }
            else {
                return callback("Item  not Found");
            }
        })
        .catch(function (err) {
            // Something bad happened, handle the error
            console.log('error:', err);
        })
}

module.exports.call = callAPI;