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

var express = require('express');
var bodyParser = require('body-parser');
var verify = require('./security');
var app = express();
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};
app.use(bodyParser.json()); // for parsing application/json

// var port = process.env.PORT || 3000;
// app.set('port', port);

require('./app')(app);
// Listen on the specified port
// app.listen(port, function() {
//   console.log('Client server listening on port ' + port);
// });



https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("Welcome to Node.js HTTPS Server");
}).listen(8443);