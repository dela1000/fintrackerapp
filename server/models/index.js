// Models
var db = require('../db/db.js');
var Promise = require('bluebird');
var _ = require('lodash');


module.exports = {

  login: {
    post: function (payload, callback) {
      db.User.find({
        where: {
          username: payload.username
        }
      })
      .then(function (found)  {
        if (found && found.password === payload.password) {
          delete found.password
          callback(found)
        } else {
          callback(false)
        }
      })
    }
  },

  signup: {
    post: function (payload, callback) {
      db.User.findOrCreate({ // TODO -- Something strange is going on here. Returns "Unhandled rejection SequelizeValidationError: notNull Violation: username cannot be null,"
        where: {
          $or:[{
            username: payload.username
          }, {
            email: payload.email
          }]
        }
      })
      .spread(function (found, create) {
        if (create) {
          found.username = payload.username;
          found.password = payload.password; //gotta crypt this
          found.email = payload.email;
          found.save();
          callback(found);
        }else{
          callback(false);
        }
      })
    }
  },

  categories: {
    get: function (callback) {
      console.log("+++ 53 index.js Here")
      db.Category.findAll()
      .then(function (allCategories) {
        callback(allCategories)
      })
    }
  },

  expenses: {
    post: function (userId, amount, comment, categoryId, category, createdAt, callback) {
      db.Expense.create({
        user_id: userId,
        amount: amount,
        comment: comment,
        category: category,
        categoryid: categoryId,
        createdAt: createdAt
      })
      .then(function (expenseAdded) {
        if (expenseAdded !== null) {
          callback(expenseAdded)
        } else{
          callback(false)
        };
      })
    },
    get: function (userId, callback) {
      db.Expense.findAll({
        where: {
          user_id: userId
        }
      })
      .then(function (allExpenses) {
        if (allExpenses.length) {
        callback(allExpenses)
        } else{
          callback(false)
        };
      })
    },
    put: function (expenseId, amount, comment, categoryId, callback) {
      db.Expense.find({
        where: {
          id: expenseId
        }
      })
      .then(function (expense) {
        if(expense !== null){
          expense.amount = amount;
          expense.comment = comment;
          expense.categoryid = categoryId;
          expense.save();
          callback(expense)
        } else{
          callback(false)
        };
      })
    }
  },
  income: {
    post: function (userId, amount, source, callback) {
       db.Income.create({
        user_id: userId,
        amount: amount,
        source: source
      })
       .then(function (incomeCreated) {
         if (incomeCreated) {
           callback(incomeCreated)
         }else{
           callback(false)
         };
       })
    },
    get: function (userId, callback) {
      db.Income.findAll({
        where: {
          user_id: userId
        }
      })
      .then(function (userIncome) {
        if (userIncome) {
          callback(userIncome)
        } else{
          callback(false)
        };
      })
    },
    put: function (incomeId, amount, source, callback) {
      db.Income.find({
        where: {
          id: incomeId
        }
      })
      .then(function (income) {
        if(income !== null){
          income.amount = amount;
          income.source = source;
          income.save();
          callback(income)
        } else{
          callback(false)
        };
      })
    }
  }
}
