// Models
var db = require('../db/db.js');
var utils = require('../helpers/utils.js');
var Promise = require('bluebird');
var _ = require('lodash');


module.exports = {

  login: {
    post: function (payload, callback) {
      db.User.findOne({
        where: {
          username: payload.username
        }
      })
      .then(function (found) {
        utils.checkPasswordHash(payload.password, found.password, function (res) {
          if (res) {
            callback(found)
          } else {
            callback(false)
          }
          
        })
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
        console.log("+++ 40 index.js create: ", create)
        if (create) {
          utils.createPasswordHash(payload.password, function (passwordHash) {
            found.username = payload.username;
            found.password = passwordHash;
            found.email = payload.email;
            found.save();
            callback(found);
          })
        }else{
          callback(false);
        }
      })
    }
  },

  set_initials: {
    post: function (payload, callback) {
      var type = payload.type
      if(payload && payload.initialAmounts.length > 0){
         db[type].bulkCreate(payload.initialAmounts)
           .then(function (initialAmountCreated) {
             if (initialAmountCreated) {
               callback(initialAmountCreated)
             }else{
               callback(false)
             };
           })
      } else{
        callback(false)
      };
    }
  },

  categories: {
    get: function (callback) {
      db.Category.findAll()
      .then(function (allCategories) {
        callback(allCategories)
      })
    }
  },

  expenses: {
    post: function (userId, amount, comment, categoryId, category, createdAt, callback) {
      db.Expense.bulkCreate({
        userId: userId,
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
          userId: userId
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

  totalAmount: {
    get: function (data, callback) {
      var tableName = 'CurrentTotal' + data.type
      db[tableName].find({
        where: {
          userId: data.userId
        }
      })
      .then(function (currentTotalIncome) {
        if (currentTotalIncome) {
          callback(currentTotalIncome)
        } else{
          callback(false)
        };
      })
    },
    patch: function (newTotalData, callback) {
      var tableName = 'CurrentTotal' + newTotalData.type;
      db[tableName].update(
        {
          amount: newTotalData.newAmount
        },
        {
          returning: true, 
          where: {
            id: newTotalData.userId
          } 
        }
      )
        .then(function(updated) {
          callback(updated)
      })
    }
  },

  income: {
    post: function (userId, amount, source, callback) {
       db.Income.create({
        userId: userId,
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
          userId: userId
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
