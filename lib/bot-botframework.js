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

var Botkit = require('botkit');
var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: 'mongodb://localhost:27017/co2',
        tables: ['user_session', 'user_history']
})
var controller = Botkit.botframeworkbot({
    debug: true,
    storage:mongoStorage
});

var bot = controller.spawn({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

// controller.hears('(.*)', 'message_received', function(bot, message) {
//    bot.reply(message, "hello Don!!");
// });

module.exports.controller = controller;
module.exports.bot = bot;
