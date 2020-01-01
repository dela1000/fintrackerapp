var mysql = require('mysql');
var express = require('express');
var path = require('path');
var db = require(__dirname + '/db/db.js');

//Middleware
var parser = require('body-parser');
var router = require(__dirname + '/routes/routes.js');

// Router
var app = express();
module.exports.app = app;

// Set what we are listening on.
app.set("port", process.env.PORT || 8888);

// Logging and parsing
app.use(parser.json());

//Use cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, fintrack_token');
  next();
});

// Serving static files from client directory.
app.use(express.static(__dirname + '../desktop_client'));
app.use('/',  express.static(path.join(__dirname, '../desktop_client/')));
// Set up our routes
app.use("/", router);

app.listen(app.get("port"));
console.log("Listening on", app.get("port"));
