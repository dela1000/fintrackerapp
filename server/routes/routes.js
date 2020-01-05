// Requirements
var controllers = require("../controllers")
var router = require('express').Router();
var path = require('path')
var utils = require('../helpers/utils.js');

router.get('/', function(req, res){
  res.status(202).sendFile(path.resolve(__dirname + "../../desktop_client/index.html"));
})

//Auth routes
//ADD AUTHENTICATION MIDDLEWARE AT SOME POINT
router.post('/signup', function (req, res) {
  controllers.signup.post(req, res)
})

router.get('/login', function (req, res) {
  controllers.login.get(req, res)
})

router.get('/logout', function (req, res) {
  controllers.logout.get(req, res)
})


// Set initial values for accounts
router.post('/set_initials', utils.checkUser, function (req, res) {
  controllers.set_initials.post(req, res)
})

router.post('/initials_done', utils.checkUser, function (req, res) {
  controllers.initials_done.post(req, res)
})

// NEED TO ADD CATEGORIES ROUTES (CREATE, UPDATE, DELETE)


//Income routes
router.post('/income', utils.checkUser, function (req, res) {
  controllers.income.post(req, res)
})

router.post('/test_income', utils.checkUser, function (req, res) {
  controllers.income.post(req, res)
})

router.get('/income', utils.checkUser, function (req, res) {
  controllers.income.get(req, res)
})

router.patch('/income', utils.checkUser, function (req, res) {
  controllers.income.patch(req, res)
})


//Expenses routes
router.post('/expenses', utils.checkUser, function (req, res) {
  controllers.expenses.post(req, res)
})

router.get('/expenses', utils.checkUser, function (req, res) {
  controllers.expenses.get(req, res)
})

router.patch('/expenses', utils.checkUser, function (req, res) {
  controllers.expenses.patch(req, res)
})

//Category routes
router.get('/categories', utils.checkUser, function (req, res) {
  controllers.categories.get(req, res)
})

// TEST Ping
router.get('/ping', utils.checkUser, function (req, res) {
  controllers.ping.get(req, res)
})

module.exports = router;
