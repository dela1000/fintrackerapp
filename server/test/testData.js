var db = require('../db/db.js');
var _ = require('lodash');
var Promise = require('bluebird');

exports.testData = function () {
  db.User.find({
      username: "aa"
  })
  .then(function (found) {
    if(!found){
      db.User.create({
        username: "aa",
        password: "aa",
        email: "1@1.com"
      })
      .then(function (user) {
        var expensesCategories = [
          {
            category: "Groceries"
          },
          {
            category: "Dining"
          },
          {
            category: "Me"
          },
          {
            category: "Small Fun"
          },
          {
            category: "Big Fun"
          },
          {
            category: "Housing"
          },
          {
            category: "Bills"
          },
          {
            category: "Misc."
          },
          {
            category: "Trasit"
          },
          {
            category: "Travel"
          },
          {
            category: "Cash"
          },
        ]

        var incomeCategories = [
          {
            category: "Initial"
          },
          {
            category: "UM"
          },
          {
            category: "Acro"
          },
          {
            category: "Taxes"
          },
          {
            category: "IntAlly"
          },
          {
            category: "IntChaSch"
          },
          {
            category: "IntChase"
          },
          {
            category: "Freelance"
          },
          {
            category: "Other"
          },
        ]

        var IncomeAccounts = [
          {
            name: "Chase",
            primary: 1
          },
          {
            name: "Charles Schwab"
          },
          {
            name: "Revolut"
          },
        ]

        var SavingsAccounts = [
          {
            name: "Chase"
          },
          {
            name: "Ally"
          },
        ]

        var InvestAccounts = [
          {
            name: "Charles Schwab"
          },
          {
            name: "Vanguard"
          },
        ]

        var expensesCreatedCategories = [];
        var createdIncomeCategories = [];
        var incomeCreatedNames = [];
        var savingsCreatedNames = [];
        var investCreatedNames = [];
        var createCurrentTotalIncome = [];
        var createCurrentTotalExpenses = [];
        var createCurrentTotalSavings = [];
        var createCurrentTotalInvest = [];

        _.each(expensesCategories, function (category) {
          expensesCreatedCategories.push(db.ExpensesCategory.create({
            name: category.category
          }))
        })
        
        _.each(incomeCategories, function (category) {
          createdIncomeCategories.push(db.IncomeCategory.create({
            name: category.category
          }))
        })

        _.each(IncomeAccounts, function (account) {
          incomeCreatedNames.push(db.IncomeAccount.create({
            name: account.name,
            userId: 1
          }))
        })
        
        createCurrentTotalIncome.push(db.CurrentTotalIncome.create({
          userId: 1,
          amount: 0
        }))

        createCurrentTotalExpenses.push(db.CurrentTotalExpenses.create({
          userId: 1,
          amount: 0
        }))

        _.each(SavingsAccounts, function (account) {
        savingsCreatedNames.push(db.SavingsAccount.create({
            name: account.name,
            userId: 1
          }))
        })

        createCurrentTotalSavings.push(db.CurrentTotalSavings.create({
          userId: 1,
          amount: 0
        }))

        _.each(InvestAccounts, function (account) {
        investCreatedNames.push(db.InvestAccount.create({
            name: account.name,
            userId: 1
          }))
        })

        createCurrentTotalInvest.push(db.CurrentTotalInvest.create({
          userId: 1,
          amount: 0
        }))
        
        Promise.all([
            expensesCreatedCategories, 
            createdIncomeCategories, 
            incomeCreatedNames, 
            savingsCreatedNames,
            investCreatedNames,
            createCurrentTotalIncome,
            createCurrentTotalExpenses,
            createCurrentTotalSavings,
            createCurrentTotalInvest,
          ])
          .then(function () {
            console.log("created start data completed")
          })
      })
    }
  })
}
