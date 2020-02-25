// Requirements
var controllers = require("../controllers")
var router = require('express').Router();
var path = require('path')
var authUtils = require('../helpers/authUtils.js');

router.get('/', function(req, res) {
  res.status(202).sendFile(path.resolve(__dirname + "../../client/index.html"));
})

// TEST Ping
router.get('/ping', function(req, res) {
  controllers.ping.get(req, res)
})

//Auth routes
router.post('/signup', function(req, res) {
  controllers.signup.post(req, res)
})

router.post('/login', function(req, res) {
  controllers.login.post(req, res)
})

router.get('/logout', function(req, res) {
  controllers.logout.get(req, res)
})

router.get('/whoami', authUtils.checkUser, function(req, res) {
  controllers.whoami.get(req, res)
})


// Set initial funds for accounts
router.post('/set_initials', authUtils.checkUser, function(req, res) {
  controllers.set_initials.post(req, res)
})

//TOTALS
router.get('/all_totals', authUtils.checkUser, function(req, res) {
  controllers.all_totals.get(req, res)
})

router.get('/all_user_data_types', authUtils.checkUser, function(req, res) {
  controllers.all_user_data_types.get(req, res)
})


// Sources Routes
// // Add sources in bulk
router.post('/fund_sources', authUtils.checkUser, function(req, res) {
  controllers.fund_sources.post(req, res)
})

// // Add single sources 
router.post('/fund_source', authUtils.checkUser, function(req, res) {
  controllers.fund_source.post(req, res)
})

// // Update source name
router.patch('/fund_source', authUtils.checkUser, function(req, res) {
  controllers.fund_source.patch(req, res)
})


// Accounts Routes
// // Add accounts in bulk
router.post('/user_accounts', authUtils.checkUser, function(req, res) {
  controllers.user_accounts.post(req, res)
})

// // Add single account
router.post('/user_account', authUtils.checkUser, function(req, res) {
  controllers.user_account.post(req, res)
})

// // Update user account
router.patch('/user_account', authUtils.checkUser, function(req, res) {
  controllers.user_account.patch(req, res)
})


//Funds routes
// // Add Funds in bulk
router.post('/funds_bulk', authUtils.checkUser, function(req, res) {
  controllers.funds_bulk.post(req, res)
})

// // get expenses
router.get('/funds_bulk', authUtils.checkUser, function(req, res) {
  controllers.funds_bulk.get(req, res)
})

// // Patch funds
router.patch('/funds', authUtils.checkUser, function(req, res) {
  controllers.funds.patch(req, res)
})
// // Delete funds
router.delete('/funds', authUtils.checkUser, function(req, res) {
  controllers.funds.delete(req, res)
})


//Expenses routes
// // Add Expenses in bulk
router.post('/expenses_bulk', authUtils.checkUser, function(req, res) {
  controllers.expenses_bulk.post(req, res)
})

// // get expenses
router.get('/expenses_bulk', authUtils.checkUser, function(req, res) {
  controllers.expenses_bulk.get(req, res)
})

// // Patch expenses
router.patch('/expenses', authUtils.checkUser, function(req, res) {
  controllers.expenses.patch(req, res)
})
// // patch expenses
router.delete('/expenses', authUtils.checkUser, function(req, res) {
  controllers.expenses.delete(req, res)
})

// Categories Routes
// // Add categories in bulk
router.post('/categories_bulk', authUtils.checkUser, function(req, res) {
  controllers.categories_bulk.post(req, res)
})
// // Add single category
router.post('/categories', authUtils.checkUser, function(req, res) {
  controllers.categories.post(req, res)
})
// // update category name 
router.patch('/categories', authUtils.checkUser, function(req, res) {
  controllers.categories.patch(req, res)
})
// // Get all user categories
router.get('/categories_bulk', authUtils.checkUser, function(req, res) {
  controllers.categories_bulk.get(req, res)
})
// // Delete a category
router.delete('/categories', authUtils.checkUser, function(req, res) {
  controllers.categories.delete(req, res)
})

// UTILS
// // calculate and update all account totals and current available
router.get('/calculate_totals', authUtils.checkUser, function(req, res) {
  controllers.calculate_totals.get(req, res)
})

// // calculate all total expenses (month or year)
router.get('/expenses_totals', authUtils.checkUser, function(req, res) {
  controllers.expenses_totals.get(req, res)
})

// // 
router.get('/types', authUtils.checkUser, function(req, res) {
  controllers.types.get(req, res)
})

// TRANSFER FUNDS
router.post('/transfers', authUtils.checkUser, function(req, res) {
  controllers.transfers.post(req, res)
})

// SEARCH 
router.get('/search', authUtils.checkUser, function(req, res) {
  controllers.search.get(req, res)
})


module.exports = router;






// // UTILS
// router.get('/recalculate_totals', authUtils.checkUser, function(req, res) {
//   controllers.recalculate_totals.get(req, res)
// })

// router.get('/test', authUtils.checkUser, function(req, res) {
//   controllers.test.get(req, res)
// })
