var db = require('../db/db.js');
var _ = require('lodash');
var Promise = require('bluebird');

exports.testData = function () {
  db.User.find({
      username: "aa"
  })
  .then(function (found) {
    if(!found){
      // db.User.create({
      //   username: "aa",
      //   password: "aa",
      //   email: "1@1.com"
      // })
      // .then(function (user) {
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
            category: "INITIAL"
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
            name: "Chase"
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
            name: "Charles Schwab"
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
        var incomeCreatedCategories = [];
        var incomeCreatedNames = [];
        var savingsCreatedNames = [];
        var investCreatedNames = [];

        _.each(expensesCategories, function (category) {
        expensesCreatedCategories.push(db.ExpensesCategory.create({
            category: category.category
          }))
        })
        
        _.each(incomeCategories, function (category) {
        incomeCreatedCategories.push(db.IncomeCategory.create({
            category: category.category
          }))
        })

        _.each(IncomeAccounts, function (account) {
        incomeCreatedNames.push(db.IncomeAccount.create({
            name: account.name
          }))
        })

        _.each(SavingsAccounts, function (account) {
        savingsCreatedNames.push(db.SavingsAccount.create({
            name: account.name
          }))
        })

        _.each(InvestAccounts, function (account) {
        investCreatedNames.push(db.InvestAccount.create({
            name: account.name
          }))
        })
        
        Promise.all([
            expensesCreatedCategories, 
            incomeCreatedCategories, 
            incomeCreatedNames, 
            savingsCreatedNames,
            investCreatedNames
          ])
          .then(function () {
            console.log("created start data completed")
          })
      // })
    }
  })
}
