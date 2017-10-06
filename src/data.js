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
                    image: '_source.search_image',
                    sizes:'_source.sizes'
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
                                text : "Available Sizes: " + element['sizes'],
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

/**
 * Method to dispaly target recommendations
 * @param {*} options 
 * @param {*} callback 
 */
var displayRecommendations = function (content, callback) {

    var attachments = {
        "type": "message",
        "text": "Recommendation for you..",
        "attachmentLayout": "carousel",
        "attachments": []
    };

    for (var key in content) {
        // console.log(data['content'][key]);
        if(content.hasOwnProperty(key)) {
            var element = content[key];

            var output = {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "version": "1.0",
                    "body": [
                    {
                        "type": "Image",
                        "url":element['thumbnailUrl'],
                        "size": "stretch",
                        "horizontalAlignment": "center",
                        "style":"bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": element['name'],
                        "size": "medium",
                        "maxLines": 1
                    },
                    {
                        "type": "TextBlock",
                        "text": "&#8377;" + element['value'],
                        "color": "dark"
                    }
                    ],
                    "actions": [
                    {
                        "type": "Action.OpenUrl",
                        "url": 'https://www.myntra.com/' + element['pageUrl'],
                        "title": "View More"
                    }
                    ]
                }
                };
            attachments.attachments.push(output);
        }
    }
    callback(attachments);
}


var targetAPI = function(options) {
    return new Promise(function(resolve, reject) {
        request(options)
        .then(function (data) {
            // Request was successful, use the response object at wills
            var content = JSON.parse(data.content);
            if(Object.keys(content).length > 0) {
                resolve(content);
            } else {
                reject('No target recommendation');
            }
        })
        .catch(function (err) {
            // Something bad happened, handle the error
            //console.log('error:', err);
            reject("It broke");
        })
    });
  }

module.exports.call = callAPI;
module.exports.target = targetAPI;
module.exports.display = displayRecommendations;