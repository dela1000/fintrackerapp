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
            var createTotal = {
              amount: 0,
              userId: found.dataValues.id
            }
            db.CurrentTotalIncome.create(createTotal)
              .then(function () {
                db.CurrentTotalExpenses.create(createTotal)
                  .then(function () {
                    db.CurrentTotalSavings.create(createTotal)
                      .then(function () {
                        db.CurrentTotalInvest.create(createTotal)
                          .then(function () {
                            callback(found);
                          })
                      })
                  })
              })
          })
        }else{
          callback(false, "User name or email already used");
        }
      })
    }
  },

  bulk_add: {
    post: function (payload, callback) {
      var type = payload.type;
      db[type].bulkCreate(
        payload.data,
        { individualHooks: true }
      )
        .then(function (amountCreated) {
          if (amountCreated) {
            callback(amountCreated)
          }else{
            callback(false, payload.type + " item not created")
          };
        })
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
      db[tableName].bulkCreate(
          payload.data,
          { individualHooks: true },
        )
        .then(function (categoriesAdded) {
          if (categoriesAdded) {
            callback(categoriesAdded)
          }else{
            callback(false, "New " + payload.type + " categories not added")
          };
        })
    },

    get: function (payload, callback) {
      db.User.findOne({
        where: {
          id: payload.userId,
        },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: [
          {
            model: db.IncomeCategory, 
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false 
          },
          {
            model: db.ExpensesCategory, 
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false 
          }]
      })
      .then(function (allCategories) {
        if(allCategories){
          callback(allCategories)
        } else{
          callback(false, "No categories found")
        };
      })
    }
  },

  accounts: {
    post: function (payload, callback) {
      var tableName = payload.type + 'Account';
      db[tableName].bulkCreate(
          payload.data,
          { individualHooks: true }
        )
        .then(function (accountsAdded) {
          if (accountsAdded) {
            callback(accountsAdded)
          }else{
            callback(false, payload.type + " new Account not added")
          };
        })
    },
  },

  income: {
    post: function (payload, callback) {
      if(payload && payload.incomeData.length > 0){
        db.Income.bulkCreate(
          payload.incomeData,
          { individualHooks: true }
        )
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
        db.Expenses.bulkCreate(
          payload.expensesData,
          { individualHooks: true }
        )
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
  },

  increaseTotalAmount: {
    patch: function (payload, callback) {
      var tableName = "CurrentTotal" + payload.type;
      db[tableName].find({
        where: {
          id: payload.userId
        },
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'deleted'] },
      })
      .then(function (currentTotal) {
        if(currentTotal !== null){
          currentTotal.amount = currentTotal.amount + payload.amount;
          currentTotal.amount = currentTotal.amount.toFixed(2);
          currentTotal.save();
          callback(currentTotal)
        } else{
          callback(false, "Current Total " + payload.type + " not found")
        };
      })
    }
  },

  updateTotalIncomeAfterExpenses: {
    patch: function (payload, callback) {
      db.CurrentTotalIncome.find({
        where: {
          id: payload.userId
        },
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'deleted'] },
      })
      .then(function (currentIncomeTotal) {
        currentIncomeTotal.amount = currentIncomeTotal.amount - payload.amount;
        currentIncomeTotal.amount = currentIncomeTotal.amount.toFixed(2);
        currentIncomeTotal.save();
        console.log("+++ 390 index.js currentIncomeTotal.dataValues: ", currentIncomeTotal.dataValues)
        callback(currentIncomeTotal)
      })
    }
  },

  updateTotalIncome: {
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
          payload.minAmount = 0;
        };
        if(!payload.maxAmount){
          payload.maxAmount = 99999;
        };
        searchData['amount'] = {$between: [payload.minAmount, payload.maxAmount]}
      }

      var tableName = payload.type;
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


























