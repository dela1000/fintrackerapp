// Models
var db = require('../db/db.js');
var utils = require('../helpers/utils.js');
var Promise = require('bluebird');
var _ = require('lodash');
var moment = require('moment');


module.exports = {

  login: {
    post: function (payload, callback) {
      db.User.findOne({
        where: {
          username: payload.username
        },
      })
      .then(function (found) {
        if(found){
          utils.checkPasswordHash(payload.password, found.password, function (res) {
            if (res) {
              callback(found)
            } else {
              callback(false, 'incorect username and password')
            }
          })
        } else{
          callback(false, "username not found")
        };
      })
    }
  },

  signup: {
    post: function (payload, callback) {
      db.User.findOrCreate({
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
          utils.createPasswordHash(payload.password, function (passwordHash) {
            found.username = payload.username;
            found.password = passwordHash;
            found.email = payload.email;
            found.save();
            callback(found);
          })
        }else{
          callback(false, "User name or email already used");
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

  initials_done: {
    post: function (payload, callback) {
      db.User.findOne({
        where: {
          id: payload.userId
        },
        include: [
          {
            model: db.CurrentTotalExpenses, 
            attributes: { 
              exclude: ["id", "deleted", "createdAt", "updatedAt", "userId"] 
            }, 
            required: false 
          },
          {
            model: db.CurrentTotalIncome, 
            attributes: { 
              exclude: ["id", "deleted", "createdAt", "updatedAt", "userId"] 
            }, 
            required: false 
          },{
            model: db.CurrentTotalSavings, 
            attributes: { 
              exclude: ["id", "deleted", "createdAt", "updatedAt", "userId"] 
            }, 
            required: false 
          },{
            model: db.CurrentTotalInvest, 
            attributes: { 
              exclude: ["id", "deleted", "createdAt", "updatedAt", "userId"] 
            }, 
            required: false 
          }]
      })
        .then(function (user) {
          if(user){
            user.initial = true;
            user.save();
            callback(user);
          } else {
            callback(false)
          }
        })
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

  income: {
    post: function (payload, callback) {
      if(payload && payload.incomeData.length > 0){
        db.Income.bulkCreate(payload.incomeData)
          .then(function (incomeAdded) {
            if (incomeAdded) {
              callback(incomeAdded)
            }else{
              callback(false)
            };
          })
      } else{
       callback(false)
      };
    },
    get: function (payload, callback) {
      db.Income.findAll({
        where: {
          userId: payload.userId,
          date: {
              $gte: payload.startDate,
              $lte: payload.endDate
          }
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
  },

  expenses: {
    post: function (payload, callback) {
      if(payload && payload.expensesData.length > 0){
        db.Expenses.bulkCreate(payload.expensesData)
        .then(function (expensesAdded) {
          if (expensesAdded) {
            callback(expensesAdded)
          } else{
            callback(false)
          };
        })
      } else {
        callback(false)
      };
    },
    get: function (payload, callback) {
      db.Expenses.findAll({
        where: {
          userId: payload.userId,
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
      db.Expenses.find({
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
      var tableName = 'CurrentTotal' + data.type;
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
      console.log("+++ 219 index.js tableName: ", tableName)
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
          console.log("+++ 231 index.js updated: ", updated)
          callback(updated)
      })
    }
  },

  search_specifics: {
    get: function (payload, callback) {
      var tableName = payload.table.charAt(0).toUpperCase() + payload.table.slice(1)
      db[tableName].findAll({
        where: {
          userId: payload.userId,
          date: {
              $gte: payload.startDate,
              $lte: payload.endDate
          },
          categoryId: payload.categoryId
        }
      })
      .then(function (userIncome) {
        if (userIncome) {
          callback(userIncome)
        } else{
          callback(false)
        };
      })
    }
  }

}
