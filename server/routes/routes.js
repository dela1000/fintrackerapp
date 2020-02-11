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

router.get('/login', function(req, res) {
  controllers.login.get(req, res)
})

router.get('/logout', function(req, res) {
  controllers.logout.get(req, res)
})


// Set initial values for accounts
router.post('/set_initials', authUtils.checkUser, function(req, res) {
  controllers.set_initials.post(req, res)
})

// Add sources in bulk
router.post('/fund_sources', authUtils.checkUser, function(req, res) {
  controllers.fund_sources.post(req, res)
})

router.post('/fund_source', authUtils.checkUser, function(req, res) {
  controllers.fund_source.post(req, res)
})


// Add accounts in bulk
router.post('/user_accounts', authUtils.checkUser, function(req, res) {
  controllers.user_accounts.post(req, res)
})

// Add sing account
router.post('/user_account', authUtils.checkUser, function(req, res) {
  controllers.user_account.post(req, res)
})

//Fund routes
router.post('/funds', authUtils.checkUser, function(req, res) {
  controllers.funds.post(req, res)
})

// router.patch('/funds', authUtils.checkUser, function(req, res) {
//   controllers.funds.patch(req, res)
// })

// Add categories in bulk
router.post('/categories_bulk', authUtils.checkUser, function(req, res) {
  controllers.categories_bulk.post(req, res)
})

// Add category
router.post('/categories', authUtils.checkUser, function(req, res) {
  controllers.categories.post(req, res)
})

router.patch('/categories', authUtils.checkUser, function(req, res) {
  controllers.categories.patch(req, res)
})

//Expenses routes
// // Add expenses in bulk
router.post('/expenses_bulk', authUtils.checkUser, function(req, res) {
  controllers.expenses_bulk.post(req, res)
})




module.exports = router;


// router.get('/categories', authUtils.checkUser, function(req, res) {
//   controllers.categories.get(req, res)
// })


// router.delete('/categories', authUtils.checkUser, function(req, res) {
//   controllers.categories.delete(req, res)
// })


// //Income routes


// router.delete('/income', authUtils.checkUser, function(req, res) {
//   controllers.income.delete(req, res)
// })

// //Expenses routes
// router.post('/expenses', authUtils.checkUser, function(req, res) {
//   controllers.expenses.post(req, res)
// })

// router.patch('/expenses', authUtils.checkUser, function(req, res) {
//   controllers.expenses.patch(req, res)
// })

// router.delete('/expenses', authUtils.checkUser, function(req, res) {
//   controllers.expenses.delete(req, res)
// })

// //Savings routes
// router.post('/savings', authUtils.checkUser, function(req, res) {
//   controllers.savings.post(req, res)
// })

// router.patch('/savings', authUtils.checkUser, function(req, res) {
//   controllers.savings.patch(req, res)
// })

// router.delete('/savings', authUtils.checkUser, function(req, res) {
//   controllers.savings.delete(req, res)
// })


// //Invest routes
// router.post('/invest', authUtils.checkUser, function(req, res) {
//   controllers.invest.post(req, res)
// })

// router.patch('/invest', authUtils.checkUser, function(req, res) {
//   controllers.invest.patch(req, res)
// })

// router.delete('/invest', authUtils.checkUser, function(req, res) {
//   controllers.invest.delete(req, res)
// })

// router.post('/transfer', authUtils.checkUser, function(req, res) {
//   controllers.transfer.post(req, res)
// })

// router.post('/transfers', authUtils.checkUser, function(req, res) {
//   controllers.transfers.post(req, res)
// })


// //TOTALS
// router.get('/all_totals', authUtils.checkUser, function(req, res) {
//   controllers.all_totals.get(req, res)
// })

// router.get('/expenses_totals', authUtils.checkUser, function(req, res) {
//   controllers.expenses_totals.get(req, res)
// })
// // SEARCH 
// router.get('/search', authUtils.checkUser, function(req, res) {
//   controllers.search.get(req, res)
// })

// // UTILS
// router.get('/recalculate_totals', authUtils.checkUser, function(req, res) {
//   controllers.recalculate_totals.get(req, res)
// })

// router.get('/test', authUtils.checkUser, function(req, res) {
//   controllers.test.get(req, res)
// })
