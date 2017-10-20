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
var greet = require('../assets/greetings.js');

var id;
var controller;
var queryString = '';
var mboxParams = {};
var boolQuery = {};
var must = [];
var filter = [];
var should = [];
var must_not = [];
var product_category;

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

  controller.on('conversationUpdate', function (bot, message) {
    if (message.membersAdded) {
      message.membersAdded.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
          bot.reply(message, "Hello!  I'm a bot. I can help you find cool stuffs.");
          setTimeout(function () {
            bot.reply(message, greet.greeting);
          }, 2000);
        }
      });
    }
  });


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

    //Check For Greetings
    switch (message.value) {
      //For FB Get-Started event
      case 'sample_get_started_payload':
        bot.reply(message, "Hello!  I'm a bot. I can help you find cool stuffs.");
        setTimeout(function () {
          bot.reply(message, greet.greeting);
        }, 2000);
        return;
        break;

      default:
        break;
    }


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
            // console.log("gb == " + global_product);
            // controller.storage.user_session.save({
            //   id: id,
            //   'product': global_product
            // });
            reply = "Sorry!! The item you are looking for is not available.";
            bot.reply(message, greet.greeting);
          }
          bot.reply(message, reply);
        })
      })
      .catch(console.error);
  });

}
var promises = [];
var botEngine = function (entities, controller, callback) {
  console.log("entities== "+JSON.stringify(entities));
  let queryObject = {};
  for (var key in entities) {
    var item = entities[key];
    for (var key2 in item) {
      if(queryObject.hasOwnProperty(key)) {
        queryObject[key] = queryObject[key]+','+item[key2]['value'];
      } else {
        queryObject[key] = item[key2]['value'];
      }
    }
  }
  console.log("Query Object == "+JSON.stringify(queryObject));
  promises.push(handleSession(queryObject));
  Promise.all(promises)
    .then(function (data) { // do stuff when success
      createQuery(function () {
        if (queryString.length > 0) {
          queryString = encodeURIComponent(queryString.slice(0, -4));
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
            console.log('Target Called');
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


var handleSession = function (queryObject) {

  return new Promise(function (resolve, reject) {
    var user_session = db.collection('user_session');
    if (queryObject.hasOwnProperty('product')) {
      product_category = queryObject.product;
      user_session.findOne({
        id: id,
        [product_category]: { $exists: true }
      }).then(function (product_details) {
        var data = user_session.update({
          "id": id
        }, {
            $set: {
              "current_category": product_category
            }
          },
          { upsert: true });

        if (product_details === null) {
          delete queryObject.product;
          try {
            var data = user_session.update({
              "id": id
            }, {
                $set: {
                  [product_category]: queryObject
                }
              },
              {
                upsert: true,
                returnNewDocument: true
              },
              function (err, doc) {
                resolve(true);
              });
          } catch (e) {
            console.log(e);
            reject();
          }
        } else {
          delete queryObject.product;
          var updateQuery = {};
          for (var i in queryObject) {
            if (queryObject.hasOwnProperty(i)) {
              updateQuery[product_category + "." + i] = queryObject[i];
            }
          }
          try {
            user_session.findOneAndUpdate(
              {
                "id": id,
                [product_category]: {
                  $exists: true
                }
              },
              { $set: updateQuery },
              {
                upsert: true,
                returnNewDocument: true
              },
              function (err, doc) {
                resolve(true);
              });
          }
          catch (e) {
            print(e);
            reject();
          }
        }
      });

    } else {
      user_session.findOne({ id: id }, { current_category: 1 }).then(function (currentPointer) {
        product_category = currentPointer.current_category;
        var updateQuery = {};
        for (var i in queryObject) {
          if (queryObject.hasOwnProperty(i)) {
            updateQuery[product_category + "." + i] = queryObject[i];
          }
        }
        try {
          user_session.findOneAndUpdate(
            {
              "id": id,
              [product_category]: {
                $exists: true
              }
            },
            { $set: updateQuery },
            {
              upsert: true,
              returnNewDocument: true
            },
            function (err, doc) {
              resolve(true);
            });
        }
        catch (e) {
          print(e);
          reject();
        }

      })
    }
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var createQuery = function (callback) {
  controller.storage.user_session.find({
    id: id,
  }, function (error, user_session) {
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

    if (product_category !== undefined) {
      //Product Category Initialization begins here
      must.push({
        "match": {
          "global_attr_article_type": product_category
        }
      });
      queryString = 'global_attr_article_type:' + product_category + ' AND ';
      mboxParams.category = capitalizeFirstLetter(product_category);
      //Product Category Initialization ends here

      Object.keys(user_session[0][product_category]).forEach(function (key) {
        var element = user_session[0][product_category][key];
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
          case "product_size":
            filter.push({
              "term": {
                "sizes": element
              }
            })
            queryString += 'sizes:' + element + ' AND ';
            break;
          case "product_color":
            console.log('Colors == '+ element);
            element.split(/\s*,\s*/).forEach(function(ele) {
                console.log(ele);
                should.push({
                  "term": {
                    "global_attr_base_colour": ele
                  }
                })
            });

            queryString += 'global_attr_base_colour:' + element + ' AND ';
            mboxParams.color = capitalizeFirstLetter(element);
            break;
          case "product_brand":
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
    }
    callback();
  });
}
