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

const {Wit, log} = require('node-wit');
 
const client = new Wit({
  accessToken: process.env.WIT_TOKEN,
  //logger: new log.Logger(log.DEBUG) // optional 
});

var id;
module.exports = function(app) {
  if (process.env.USE_SLACK) {
    var Slack = require('./bot-slack');
    Slack.controller.middleware.receive.use(wit.receive);
    Slack.bot.startRTM();
    console.log('Slack bot is live');
    callActions(Slack.controller);
  }
  if (process.env.USE_FACEBOOK) {
    var Facebook = require('./bot-facebook');
    Facebook.controller.middleware.receive.use(wit.receive);
    Facebook.controller.createWebhookEndpoints(app, Facebook.bot);
    console.log('Facebook bot is live');
    callActions(Facebook.controller);
  }
  if (process.env.USE_BOTFRAMEWORK) {
    var BotFramework = require('./bot-botframework');
    BotFramework.controller.middleware.receive.use(wit.receive);
    BotFramework.controller.createWebhookEndpoints(app, BotFramework.bot);
    console.log('BotFramework bot is live');
    callActions(BotFramework.controller);
  }
};


var callActions = function(controller){
  controller.hears('(.*)', ['direct_message', 'direct_mention', 'mention', 'message_received'], function (bot, message) {
      bot.reply(message, { type: "typing" });
      //console.log(message);
      id = message.user; 
      controller.storage.users.get(id, function(error, user_data){
         if(user_data === null) {
		controller.storage.users.save({id:message.user, name:message.address.user.name, channel:message.source}, function(err) {
                        // console.log(err);
                        console.log('SUCCESS!! user added to the table');
                 });
	 }

      });


        //controller.storage.users.all(function(err, users) {
         //       console.log("All users == "+JSON.stringify(users));
       // });


	//	controller.storage.user_session.all(function(err, users) {
	//	console.log("All sessions == "+JSON.stringify(users));
	//});

      controller.storage.user_session.find({id : id}, function(error, user_session){
	  if(user_session.length > 0) {
	 	console.log("Session Found");
	  }
          else {
	 	controller.storage.user_session.save({id : message.user});
		console.log("New Session created");
          }
      }); 

      client.message(message.text, {})
        .then((data) => {
          var entities = data.entities;
          botEngine(entities, controller, function(reply) {
              // console.log(reply);
              bot.reply(message, reply);
          }) 
        })
        .catch(console.error);          
      });

}

var botEngine = function(entities, controller, callback) {
  let queryObject = {};
    for (var key in entities) {
      var item = entities[key];
      // console.log(key+" == "+JSON.stringify(item));
      for (var key2 in item) {
         // console.log("item2 val == "+JSON.stringify(item[key2]['value']));
        queryObject[key] = item[key2]['value'];
      }
    }
  // console.log("Query == "+JSON.stringify(queryObject));
  var queryString = '';
  for (var i in queryObject) {
    if (queryObject.hasOwnProperty(i)) {
     switch(i) {
      case "intent":
         break;
      case "product": queryString += 'global_attr_article_type:'+ queryObject[i] + ' AND ';
         break;
      case "product_size": queryString += 'sizes:'+ queryObject[i] + ' AND ';
         break;
      case "product_color": queryString += 'global_attr_base_colour:'+ queryObject[i] + ' AND ';
         break;
      case "product_brand": queryString += 'global_attr_brand:'+ queryObject[i] + ' AND ';
         break;
      case "gender":queryString += 'gender_from_cms:'+ queryObject[i] + ' AND ';
         break;
      default: queryString += 'no match found';
         break;
      }
    }
  }
  if(queryString.length > 0) {
    queryString = encodeURIComponent(queryString.slice(0, -4));
    const options = {  
      method: 'GET',
      uri: process.env.ELASTIC_HOST+'?q='+queryString,
      json: true
    }
  
    var API = require('./data');
    API.call(options, callback);
  }
  else {
    controller.storage.users.get(id , function(error , user){
	callback("Hey "+user.name+", How can I help You?");
    });
    console.log("No Match Found!!!!")
  }

}
