// Requirements
var controllers = require("../controllers")
var router = require('express').Router();
var path = require('path')
var authUtils = require('../helpers/authUtils.js');

router.get('/', function(req, res){
  res.status(202).sendFile(path.resolve(__dirname + "../../client/index.html"));
})

// TEST Ping
router.get('/ping', function (req, res) {
  controllers.ping.get(req, res)
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

// ADD CATEGORIES IN BULK
router.post('/categories_bulk', authUtils.checkUser, function (req, res) {
  controllers.categories_bulk.post(req, res)
})

//Category routes
// NEED TO ADD CATEGORIES ROUTES (CREATE, UPDATE, DELETE)
router.post('/categories', authUtils.checkUser, function (req, res) {
  controllers.categories.post(req, res)
})

router.get('/categories', authUtils.checkUser, function (req, res) {
  controllers.categories.get(req, res)
})

router.patch('/categories', authUtils.checkUser, function (req, res) {
  controllers.categories.patch(req, res)
})


//Income routes
router.post('/income', authUtils.checkUser, function (req, res) {
  controllers.income.post(req, res)
})

//Expenses routes
router.post('/expenses', authUtils.checkUser, function (req, res) {
  controllers.expenses.post(req, res)
})

//TOTALS

router.get('/all_totals', authUtils.checkUser, function (req, res) {
  controllers.all_totals.get(req, res)
})

router.get('/expenses_totals', authUtils.checkUser, function (req, res) {
  controllers.expenses_totals.get(req, res)
})
// SEARCH 
router.get('/search_specifics', authUtils.checkUser, function (req, res) {
  controllers.search_specifics.get(req, res)
})

router.post('/savings', authUtils.checkUser, function (req, res) {
  controllers.savings.post(req, res)
})



//TO FIX
router.patch('/income', authUtils.checkUser, function (req, res) {
  controllers.income.patch(req, res)
})


router.patch('/expenses', authUtils.checkUser, function (req, res) {
  controllers.expenses.patch(req, res)
})



router.get('/test', authUtils.checkUser, function (req, res) {
  controllers.test.get(req, res)
})

module.exports = router;
