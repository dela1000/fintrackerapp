// Requirements
var controllers = require("../controllers")
var router = require('express').Router();
var path = require('path')
var utils = require('../helpers/utils.js');

router.get('/', function(request, response){
  response.status(202).sendFile(path.resolve(__dirname + "../../desktop_client/index.html"));
})

//Auth routes
//ADD AUTHENTICATION MIDDLEWARE AT SOME POINT
router.post('/signup', function (request, response) {
  controllers.signup.post(request, response)
})

router.get('/login', function (request, response) {
  controllers.login.get(request, response)
})

router.get('/logout', function (request, response) {
  controllers.logout.get(request, response)
})


// Set initial values for accounts
router.post('/set_initials', utils.checkUser, function (request, response) {
  controllers.setInitials.post(request, response)
})


//Income routes
router.post('/income', utils.checkUser, function (request, response) {
  controllers.income.post(request, response)
})

router.get('/income', utils.checkUser, function (request, response) {
  controllers.income.get(request, response)
})

router.patch('/income', utils.checkUser, function (request, response) {
  controllers.income.patch(request, response)
})


//Expenses routes
router.post('/expenses', utils.checkUser, function (request, response) {
  controllers.expenses.post(request, response)
})

router.get('/expenses', utils.checkUser, function (request, response) {
  controllers.expenses.get(request, response)
})

router.patch('/expenses', utils.checkUser, function (request, response) {
  controllers.expenses.patch(request, response)
})

//Category routes
router.get('/categories', utils.checkUser, function (request, response) {
  controllers.categories.get(request, response)
})

// TEST Ping
router.get('/ping', utils.checkUser, function (request, response) {
  controllers.ping.get(request, response)
})

module.exports = router;
