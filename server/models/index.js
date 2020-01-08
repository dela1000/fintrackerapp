// Models
var db = require('../db/db.js');
var Sequelize = require("sequelize");
var authUtils = require('../helpers/authUtils.js');
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
          authUtils.checkPasswordHash(payload.password, found.password, function (res) {
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
          authUtils.createPasswordHash(payload.password, function (passwordHash) {
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
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: [
          {
            model: db.CurrentTotalExpenses, 
            attributes: ['amount'],
            required: false 
          },
          {
            model: db.CurrentTotalIncome, 
            attributes: ['amount'],
            required: false 
          },{
            model: db.CurrentTotalSavings, 
            attributes: ['amount'],
            required: false 
          },{
            model: db.CurrentTotalInvest, 
            attributes: ['amount'],
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
    post: function (payload, callback) {
      var tableName = payload.type + 'Category';
      db[tableName].bulkCreate(payload.data)
        .then(function (categoriesAdded) {
          if (categoriesAdded) {
            callback(categoriesAdded)
          }else{
            callback(false)
          };
        })
    },

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
    patch: function (payload, callback) {
      db.Income.find({
        where: {
          id: payload.id
        }
      })
      .then(function (income) {
        if(income !== null){
          _.forEach(payload, function (value, key) {
            if(key !== "id"){
              income[key] = value;
            }
          })
          income.save();
          callback(income)
        } else{
          callback(false, "Income not found")
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

  updateTotalAmount: {
    patch: function (payload, callback) {
      db.CurrentTotalIncome.find({
        where: {
          id: payload.userId
        }
      })
      .then(function (currentTotalIncome) {
        if(currentTotalIncome !== null){
          currentTotalIncome.amount = currentTotalIncome.amount - payload.previousAmount + payload.newAmount;
          currentTotalIncome.save();
          callback(currentTotalIncome)
        } else{
          callback(false, "Current Total Income not found")
        };
      })
    }
  },

  search_specifics: {
    get: function (payload, callback) {
      var searchData = {
        userId: payload.userId,
        date: {
          $gte: payload.startDate,
          $lte: payload.endDate
        },
      };
      if(payload.categoryId){
        searchData['categoryId'] = payload.categoryId
      }
      if(payload.comment){
        searchData['comment'] = {
          $like: "%" + payload.comment + "%"
        }
      }
      if(payload.minAmount || payload.maxAmount){
        if(!payload.minAmount){
          payload.minAmount = 0
        };
        if(!payload.maxAmount){
          payload.maxAmount = 99999
        };
        searchData['amount'] = {$between: [payload.minAmount, payload.maxAmount]}
      }

      var tableName = payload.table.charAt(0).toUpperCase() + payload.table.slice(1)
      db[tableName].findAll({
        where: searchData
      })
      .then(function (userIncome) {
        if (userIncome) {
          callback(userIncome)
        } else{
          callback(false)
        };
      })
    }
  },

  expenses_totals: {
    get: function (payload, callback) {

      var searchData = {
        userId: payload.userId,
        date: {
          $gte: moment().startOf(payload.timeframe).format('x'),
          $lte: moment().endOf(payload.timeframe).format('x')
        },
        deleted: false
      };
      db.Expenses.findAll({
        where: searchData
      })
        .then(function (expensesData) {
          if(expensesData){
            callback(expensesData)
          } else {
            callback(false, "No data found")
          }
        })
    }
  },

  primary_totals: {
    get: function (payload, callback) {
      var primaryTotals = {};
      db.User.findOne({
        where: {
          id: payload.userId
        },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: [
          {
            model: db.CurrentTotalExpenses, 
            attributes: ['amount'],
            required: false 
          },
          {
            model: db.CurrentTotalIncome, 
            attributes: ['amount'],
            required: false 
          },{
            model: db.CurrentTotalSavings, 
            attributes: ['amount'],
            required: false 
          },{
            model: db.CurrentTotalInvest, 
            attributes: ['amount'],
            required: false 
          }]
      })
        .then(function (user) {
          if(user){
            primaryTotals['user'] = {
              userId: user.id,
              username: user.username,
              email: user.email,
            };
            if(user.currenttotalexpense){
              primaryTotals['currentTotalExpenses'] = user.currenttotalexpense.amount
            }
            if(user.currenttotalincome){
              primaryTotals['currentTotalIncome'] = user.currenttotalincome.amount
            }
            if(user.currenttotalsaving){
              primaryTotals['currentTotalSavings'] = user.currenttotalsaving.amount
            }
            if(user.currenttotalinvest){
              primaryTotals['currentTotalInvest'] = user.currenttotalinvest.amount
            }

            db.Expenses.findAll({
              where: {
                userId: payload.userId,
                date: {
                  $gte: moment().startOf(payload.timeframe).format('x'),
                  $lte: moment().endOf(payload.timeframe).format('x')
                },
                deleted: false
              }
            })
              .then(function (expensesData) {
                if(expensesData){
                  callback(primaryTotals, expensesData)
                } else {
                  callback(false, null, "No expenses data found")
                }
              })
          } else {
            callback(false, null, "User not found")
          }
        })
    }
  }

}


























