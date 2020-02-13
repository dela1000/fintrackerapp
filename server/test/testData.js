var db = require('../db/db.js');
var _ = require('lodash');
var Promise = require('bluebird');

var expensesCategories = [
  {name: "groceries"},
  {name: "dining"},
  {name: "me"},
  {name: "small fun"},
  {name: "big fun"},
  {name: "housing"},
  {name: "bills"},
  {name: "misc."},
  {name: "trasit"},
  {name: "travel"},
  {name: "cash"},
]
var userAccounts = [
  {
    account: "chase",
    primary: 1,
    typeId: 1,
  },
  {
    account: "charles schwab",
    typeId: 1,
  },
  {
    account: "revolut",
    typeId: 1,
  },
  {
    account: "ally",
    typeId: 2,
  },
  // {
  //   account: "chase",
  //   typeId: 2,
  // },
  // {
  //   account: "charles schwab",
  //   typeId: 3,
  // },
  // {
  //   account: "vanguard",
  //   typeId: 3,
  // },
]

var accountTotals = [
  {
    amount: 25,
    accountId: 1,
    typeId: 1,
  },
  {
    amount: 30,
    accountId: 2,
    typeId: 1,
  },
  {
    amount: 20,
    accountId: 3,
    typeId: 1,
  },
  {
    amount: 50,
    accountId: 4,
    typeId: 2,
  },
  // {
  //   amount: 0,
  //   accountId: 5,
  //   typeId: 2,
  // },
  // {
  //   amount: 0,
  //   accountId: 6,
  //   typeId: 2,
  // },
  // {
  //   amount: 0,
  //   accountId: 7,
  //   typeId: 3,
  // },
] 

var fundSources = [
  {source: "Initial",},
  {source: "uberMedia",},
  {source: "Interest - Ally",},
  {source: "Interest - Chase",},
  {source: "Interest - Schwab",},
  {source: "Taxes",},
  {source: "Other",},
]

var funds = [
  {
    amount: 10,
    date: "01-01-2020",
    accountId: 1,
    typeId: 1,
    sourceId: 1
  },
  {
    amount: 15,
    date: "01-01-2020",
    accountId: 1,
    typeId: 1,
    sourceId: 1
  },
  {
    amount: 30,
    date: "01-01-2020",
    accountId: 2,
    typeId: 1,
    sourceId: 1
  },
  {
    amount: 20,
    date: "01-01-2020",
    accountId: 3,
    typeId: 1,
    sourceId: 1
  },
  {
    amount: 50,
    date: "01-01-2020",
    accountId: 4,
    typeId: 2,
    sourceId: 1
  },

]

var expenses = [{
    amount: 10,
    date: "01-11-2020",
    categoryId: 1,
    accountId: 1,
    deleted: false,
  },
  {
    amount: 5,
    date: "01-15-2020",
    categoryId: 2,
    accountId: 1,
    deleted: false,
  }
]
var expensesCategoriesAdded = [];
var accountsAdded = [];
var accountsTotalsAdded = [];
var fundSourcesAdded = [];

var fundsAdded = [];
var expensesAdded = [];

// Uncomment to not add data
var addData = null;
// var addData = true;

exports.testData = function() {
  db.Users.findAll({
    username: "aa"
  })
  .then(function(found) {
    if (found.length < 1) {
      db.Users.create({
        username: "aa",
        password: "$2b$08$.URoN6sElGsOPwjPxrVN8exWowHmMxhMp/ecIZELcPbgLalfkMXrW",
        email: "1@1.com"
      })
      .then(function(user) {
        if(!addData){
          db.CurrentAvailables.create({
            amount: 60,
            userId: 1
          })
          .then(function () {
            
            _.each(expensesCategories, function(category) {
              expensesCategoriesAdded.push(db.ExpensesCategories.create({
                name: category.name,
                userId: 1
              }))
            })

            _.each(userAccounts, function(account) {
              accountsAdded.push(db.UserAccounts.create({
                account: account.account,
                typeId: account.typeId,
                userId: 1
              }))
            })

            _.each(accountTotals, function(account) {
              accountsTotalsAdded.push(db.AccountTotals.create({
                amount: account.amount,
                accountId: account.accountId,
                typeId: account.typeId,
                userId: 1
              }))
            })

            _.each(fundSources, function(account) {
              fundSourcesAdded.push(db.FundSources.create({
                source: account.source,
                userId: 1
              }))
            })

            _.each(funds, function(expense) {
              fundsAdded.push(db.Funds.create({
                amount: expense.amount,
                date: expense.date,
                accountId: expense.accountId,
                typeId: expense.typeId,
                sourceId: expense.sourceId,
                deleted: expense.deleted,
                userId: 1
              }))
            })

            _.each(expenses, function(expense) {
              expensesAdded.push(db.Expenses.create({
                amount: expense.amount,
                categoryId: expense.categoryId,
                date: expense.date,
                accountId: expense.accountId,
                deleted: expense.deleted,
                userId: 1
              }))
            })

            Promise.all([
              expensesCategoriesAdded,
              accountsAdded,
              accountsTotalsAdded,
              fundSourcesAdded,
              fundsAdded,
              expensesAdded,
            ])
            .then(function () {
              console.log("+++ Created all test data")
            })
            
          })
        } else {
          console.log("+++ Only User Added")
        }

      })
    } else{
      console.log("+++ testData.js Already Created")
    };
  })
}

  // db.User.findAll({
  //     username: "aa"
  //   })
  //   .then(function(found) {
  //     if (!found) {
  //       db.User.create({
  //           username: "aa",
  //           password: "aa",
  //           email: "1@1.com"
  //         })
  //         .then(function(user) {
  //           var expensesCategories = [{
  //               "name": "groceries"
  //             },
  //             {
  //               "name": "dining"
  //             },
  //             {
  //               "name": "me"
  //             },
  //             {
  //               "name": "small fun"
  //             },
  //             {
  //               "name": "big fun"
  //             },
  //             {
  //               "name": "housing"
  //             },
  //             {
  //               "name": "bills"
  //             },
  //             {
  //               "name": "misc."
  //             },
  //             {
  //               "name": "trasit"
  //             },
  //             {
  //               "name": "travel"
  //             },
  //             {
  //               "name": "cash"
  //             },
  //           ]

  //           var incomeCategories = [{
  //               "name": "initial"
  //             },
  //             {
  //               "name": "um"
  //             },
  //             {
  //               "name": "acro"
  //             },
  //             {
  //               "name": "taxes"
  //             },
  //             {
  //               "name": "interest Aally"
  //             },
  //             {
  //               "name": "interest charles schwab"
  //             },
  //             {
  //               "name": "interert chase"
  //             },
  //             {
  //               "name": "freelance"
  //             },
  //             {
  //               "name": "other"
  //             },
  //           ]

  //           var IncomeAccounts = [{
  //               name: "chase",
  //               primary: 1
  //             },
  //             {
  //               name: "charles schwab"
  //             },
  //             {
  //               name: "revolut"
  //             },
  //           ]

  //           var SavingsAccounts = [{
  //               name: "chase"
  //             },
  //             {
  //               name: "ally"
  //             },
  //           ]

  //           var InvestAccounts = [{
  //               name: "charles schwab"
  //             },
  //             {
  //               name: "vanguard"
  //             },
  //           ]

  //           var expensesCreatedCategories = [];
  //           var createdIncomeCategories = [];
  //           var incomeCreatedNames = [];
  //           var savingsCreatedNames = [];
  //           var investCreatedNames = [];
  //           var createCurrentTotalIncome = [];
  //           var createCurrentTotalExpenses = [];
  //           var createCurrentTotalSavings = [];
  //           var createCurrentTotalInvest = [];

  //           _.each(expensesCategories, function(category) {
  //             expensesCreatedCategories.push(db.ExpensesCategory.create({
  //               name: category.name,
  //               userId: 1
  //             }))
  //           })

  //           _.each(incomeCategories, function(category) {
  //             createdIncomeCategories.push(db.IncomeCategory.create({
  //               name: category.name,
  //               userId: 1
  //             }))
  //           })

  //           _.each(IncomeAccounts, function(account) {
  //             incomeCreatedNames.push(db.IncomeAccount.create({
  //               name: account.name,
  //               userId: 1
  //             }))
  //           })

  //           createCurrentTotalIncome.push(db.CurrentTotalIncome.create({
  //             userId: 1,
  //             amount: 0
  //           }))

  //           createCurrentTotalExpenses.push(db.CurrentTotalExpenses.create({
  //             userId: 1,
  //             amount: 0
  //           }))

  //           _.each(SavingsAccounts, function(account) {
  //             savingsCreatedNames.push(db.SavingsAccount.create({
  //               name: account.name,
  //               userId: 1
  //             }))
  //           })

  //           createCurrentTotalSavings.push(db.CurrentTotalSavings.create({
  //             userId: 1,
  //             amount: 0
  //           }))

  //           _.each(InvestAccounts, function(account) {
  //             investCreatedNames.push(db.InvestAccount.create({
  //               name: account.name,
  //               userId: 1
  //             }))
  //           })

  //           createCurrentTotalInvest.push(db.CurrentTotalInvest.create({
  //             userId: 1,
  //             amount: 0
  //           }))

  //           Promise.all([
  //               expensesCreatedCategories,
  //               createdIncomeCategories,
  //               incomeCreatedNames,
  //               savingsCreatedNames,
  //               investCreatedNames,
  //               createCurrentTotalIncome,
  //               createCurrentTotalExpenses,
  //               createCurrentTotalSavings,
  //               createCurrentTotalInvest,
  //             ])
  //             .then(function() {
  //               console.log("created start data completed")
  //             })
  //         })
  //     }
  //   })
// }