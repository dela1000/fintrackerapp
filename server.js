var mysql = require('mysql');
var express = require('express');
var path = require('path');
var responseTime = require('response-time');
var db = require(__dirname + '/server/db/db.js');
var secrets = require(__dirname + '/secrets/secrets.js');

//Middleware
var parser = require('body-parser');
var router = require(__dirname + '/server/routes/routes.js');

// Router
var app = express();
module.exports.app = app;

// Set what we are listening on.
app.set("port", process.env.PORT || 8888);

// Logging and parsing
app.use(parser.json());

// log response time
app.use(responseTime(function (req, res, time) {
  console.log("+++ 25 server.js req.route: ", req.route)
    if(req.route && req.route.path){
      console.log("+++ server.js PATH:", req.method + " " + req.route.path)
      console.log("+++ server.js TIME IN SECONDS:", time / 1000)
    } else {
      console.log("+++ server - No Route found.")
    }
}))

//Use cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ' + secrets.tokenName);
  next();
});

// Serving React static files from client directory.
app.use(express.static(`${__dirname}/webapp/build`));
// Set up our routes
app.use("/", router);

app.listen(app.get("port"));
console.log("Listening on port:", app.get("port"));