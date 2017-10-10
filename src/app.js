/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').load();

var wit = require('botkit-witai')({
  accessToken: process.env.WIT_TOKEN,
  minConfidence: 0.6,
  logLevel: 'error'
});

const {
  Wit,
  log
} = require('node-wit');

const client = new Wit({
  accessToken: process.env.WIT_TOKEN,
  //logger: new log.Logger(log.DEBUG) // optional 
});

var mongoUtil = require('../database/mongoUtils');
var db;
mongoUtil.connectToServer(function (err) {
  db = mongoUtil.getDb();
});
var Promise = require('promise');

var id;
var controller;
var queryString = '';
var mboxParams = {};
var global_product;
var boolQuery = {};
var must = [];
var filter = [];
var should = [];
var must_not = [];

module.exports = function (app) {
  if (process.env.USE_SLACK) {
    var Slack = require('../lib/bot-slack');
    Slack.controller.middleware.receive.use(wit.receive);
    Slack.bot.startRTM();
    console.log('Slack bot is live');
    callActions(Slack.controller);
  }
  if (process.env.USE_FACEBOOK) {
    var Facebook = require('../lib/bot-facebook');
    Facebook.controller.middleware.receive.use(wit.receive);
    Facebook.controller.createWebhookEndpoints(app, Facebook.bot);
    console.log('Facebook bot is live');
    callActions(Facebook.controller);
  }
  if (process.env.USE_BOTFRAMEWORK) {
    var BotFramework = require('../lib/bot-botframework');
    BotFramework.controller.middleware.receive.use(wit.receive);
    BotFramework.controller.createWebhookEndpoints(app, BotFramework.bot);
    console.log('BotFramework bot is live');
    controller = BotFramework.controller;
    callActions(BotFramework.controller);
  }
};


var callActions = function (controller) {
  controller.hears('(.*)', ['direct_message', 'direct_mention', 'mention', 'message_received'], function (bot, message) {
    bot.reply(message, {
      type: "typing"
    });
    //console.log(message);
    id = message.user;
    controller.storage.users.get(id, function (error, user_data) {
      if (user_data === null) {
        controller.storage.users.save({
          id: message.user,
          name: message.address.user.name,
          channel: message.source
        }, function (err) {
          // console.log(err);
          console.log('SUCCESS!! user added to the table');
        });
      }

    });


    // controller.storage.users.all(function (err, users) {
    //   console.log("All users == " + JSON.stringify(users));
    // });


    // controller.storage.user_session.all(function (err, users) {
    //   console.log("All sessions == " + JSON.stringify(users));
    // });
    controller.storage.user_session.find({
      id: id
    }, function (error, user_session) {
      if (user_session.length > 0) {
        console.log("USER SESSION already exists!!");
        console.log("SESSION == " + JSON.stringify(user_session));
      } else {
        controller.storage.user_session.save({
          id: message.user
        });
        console.log("New Session created");
      }
    });

    client.message(message.text, {})
      .then((data) => {
        var entities = data.entities;
        botEngine(entities, controller, function (reply) {
          // console.log(reply);
          if (reply === 'Item  not Found') {
            console.log("gb == " + global_product);
            controller.storage.user_session.save({
              id: id,
              'product': global_product
            });
          }
          bot.reply(message, reply);
        })
      })
      .catch(console.error);
  });

}

var botEngine = function (entities, controller, callback) {
    let queryObject = {};
    console.log("ENTITIES == "+JSON.stringify(entities));
    for (var key in entities) {
      var item = entities[key];
      // console.log(key+" == "+JSON.stringify(item));
      for (var key2 in item) {
        // console.log("item2 val == "+JSON.stringify(item[key2]['value']));
        queryObject[key] = item[key2]['value'];
      }
    }
    var promises = [];
    for (var i in queryObject) {
      if (queryObject.hasOwnProperty(i)) {
        switch (i) {
          case "intent":
            break;
          case "product":
            promises.push(updateSession('product', queryObject[i]));
            break;
          case "product_size":
            promises.push(updateSession('size', queryObject[i]));
            break;
          case "product_color":
            promises.push(updateSession('color', queryObject[i]));
            break;
          case "product_brand":
            promises.push(updateSession('brand', queryObject[i]));
            break;
          case "gender":
            promises.push(updateSession('gender', queryObject[i]));
            break;
          default:
            // queryString += 'no match found';
            break;
        }
      }
    }

    Promise.all(promises)
      .then(function (data) { // do stuff when success
          // console.log(data);
          createQuery(function () {
              if (queryString.length > 0) {
                queryString = encodeURIComponent(queryString.slice(0, -4));
                console.log("QS == " + queryString);
                const options = {
                  method: 'GET',
                  uri: process.env.ELASTIC_HOST + '?q=' + queryString,
                  json: true
                }
                boolQuery.must = must;
                boolQuery.filter = filter;
                boolQuery.should = should;
                console.log("BOOL == " + JSON.stringify(boolQuery));
                const elasticOptions = {
                  method: 'GET',
                  uri: process.env.ELASTIC_HOST,
                  //   body: {
                  //     "query": {
                  //       "bool": {
                  //         "must": [{
                  //           "match": {
                  //             "global_attr_article_type": "Tshirts"
                  //           }
                  //         }, {
                  //           "match": {
                  //             "gender_from_cms": "Men"
                  //           }
                  //         }],
                  //         "filter": {
                  //           "term": {
                  //             "sizes": "S"
                  //           }
                  //         },
                  //         "should": [{
                  //           "term": {
                  //             "global_attr_base_colour": "blue"
                  //           }
                  //         }, {
                  //           "term": {
                  //             "product_additional_info": "polo"
                  //           }
                  //         }],
                  //         "must_not": {
                  //           "range": {
                  //             "price": {
                  //               "gte": 2000,
                  //               "lte": 1000
                  //             }
                  //           }
                  //         }
                  //       }
                  //     }
                  // },
                  body: {
                    "query": {
                      "bool": boolQuery
                    }
                  },
                    json: true // Automatically stringifies the body to JSON
                };


                  console.log('mbox == ' + JSON.stringify(mboxParams));
                  const targetOptions = {
                    method: 'POST',
                    uri: 'https://adobeinternalags308.tt.omtrdc.net/rest/v1/mbox/123468?client=adobeinternalags308',
                    body: {
                      "mbox": "chatbot_recommendation_mbox",
                      "tntId": "3bdfd9df079d45388dea33863a18b7f7.22_30",
                      "mboxParameters": mboxParams
                    },
                    json: true // Automatically stringifies the body to JSON
                  };
                  // console.log(targetOptions);
                  var API = require('../src/data');
                  API.call(elasticOptions, callback);
                  var isTarget = API.target(targetOptions);
                  isTarget.then(function (data) {
                    // console.log(data);
                    setTimeout(function () {
                      API.display(data, callback);
                    }, 3000);

                  }, function (err) {
                    console.error(err);
                  });

                }
                else {
                  controller.storage.users.get(id, function (error, user) {
                    var greet = "Hey" + (user.name === null ? '' : ' ' + user.name) + ", How can I help You?";
                    callback(greet);
                  });
                  console.log("No Match Found!!!!");
                }
              });
          })
        .catch(function (err) { // error handling
          console.log(err);
        });
      }


    var updateSession = function (key, val) {

      return new Promise(function (resolve, reject) {
        if (key === 'product') {
          global_product = val;
          //Store previous session if any 
          controller.storage.user_session.get(id, function (error, user_data) {
            // console.log("user session == "+ JSON.stringify(user_data), Object.keys(user_data).length);
            if (Object.keys(user_data).length > 2) {
              var collection = db.collection('user_history');
              try {
                var data = collection.insert({
                  "id": id,
                  user_data,
                  "ts": new Date()
                });
              } catch (e) {
                console.log(e);
              }
              // controller.storage.user_history.find({id:id}, function (error, user_history) {
              //   console.log('History == '+ JSON.stringify(user_history));
              // });
            }
          });
          //Create a new session
          controller.storage.user_session.save({
            id: id,
            'product': val
          });
          resolve(true);

        } else {
          var collection = db.collection('user_session');
          var new_value = {};
          new_value[key] = val;
          try {
            var data = collection.findOneAndUpdate({
              "id": id
            }, {
              $set: new_value
            }, {
              upsert: true,
              returnNewDocument: false
            }, function () {
              resolve(true);
            });
          } catch (e) {
            console.log(e);
            reject(e);
          }
        }
      })
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var createQuery = function (callback) {
      controller.storage.user_session.find({
        id: id
      }, function (error, user_session) {

        if (user_session.length > 0) {
          mboxParams = {
            brand: "",
            color: "",
            category: ""
          };
          boolQuery = {};
          must = [];
          filter = [];
          should = [];
          must_not = [];
          Object.keys(user_session[0]).forEach(function (key) {
            var element = user_session[0][key];
            switch (key) {
              case "intent":
                break;
              case "product":
                must.push({
                  "match": {
                    "global_attr_article_type": element
                  }
                })
                queryString = 'global_attr_article_type:' + element + ' AND ';
                mboxParams.category = capitalizeFirstLetter(element);
                break;
              case "size":
                filter.push({
                  "term": {
                    "sizes": element
                  }
                })
                queryString += 'sizes:' + element + ' AND ';
                break;
              case "color":
                should.push({
                  "match": {
                    "global_attr_base_colour": element
                  }
                })
                queryString += 'global_attr_base_colour:' + element + ' AND ';
                mboxParams.color = capitalizeFirstLetter(element);
                break;
              case "brand":
                should.push({
                  "match": {
                    "global_attr_brand": element
                  }
                })
                queryString += 'global_attr_brand:' + element + ' AND ';
                mboxParams.brand = capitalizeFirstLetter(element);
                break;
              case "gender":
                must.push({
                  "match": {
                    "gender_from_cms": element
                  }
                })
                queryString += 'gender_from_cms:' + element + ' AND ';
                break;
              default:
                break;
            }
          });
          callback();
        } else {
          controller.storage.user_session.save({
            id: message.user
          });
          console.log("New Session created");
        }
      });
    }