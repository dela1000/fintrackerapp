// Requirements
var controllers = require("../controllers")
var router = require('express').Router();
var path = require('path')
var authUtils = require('../helpers/authUtils.js');

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
router.post('/set_initials', authUtils.checkUser, function (req, res) {
  controllers.set_initials.post(req, res)
})

router.post('/initials_done', authUtils.checkUser, function (req, res) {
  controllers.initials_done.post(req, res)
})

//Category routes
// NEED TO ADD CATEGORIES ROUTES (CREATE, UPDATE, DELETE)
router.get('/categories', authUtils.checkUser, function (req, res) {
  controllers.categories.get(req, res)
})


//Income routes
router.post('/income', authUtils.checkUser, function (req, res) {
  controllers.income.post(req, res)
})

// router.get('/income', authUtils.checkUser, function (req, res) {
//   controllers.income.get(req, res)
// })

router.patch('/income', authUtils.checkUser, function (req, res) {
  controllers.income.patch(req, res)
})


//Expenses routes
router.post('/expenses', authUtils.checkUser, function (req, res) {
  controllers.expenses.post(req, res)
})

// router.get('/expenses', authUtils.checkUser, function (req, res) {
//   controllers.expenses.get(req, res)
// })

router.patch('/expenses', authUtils.checkUser, function (req, res) {
  controllers.expenses.patch(req, res)
})

// SEARCH 
router.get('/search_specifics', authUtils.checkUser, function (req, res) {
  controllers.search_specifics.get(req, res)
})

//TOTALS

router.get('/primary_totals', authUtils.checkUser, function (req, res) {
  controllers.primary_totals.get(req, res)
})

router.get('/expenses_totals', authUtils.checkUser, function (req, res) {
  controllers.expenses_totals.get(req, res)
})



// TEST Ping
router.get('/ping', authUtils.checkUser, function (req, res) {
  controllers.ping.get(req, res)
})

module.exports = router;
