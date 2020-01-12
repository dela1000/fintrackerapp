// Models
var db = require('../db/db.js');
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
var authUtils = require('../helpers/authUtils.js');
var finUtils = require('../helpers/finUtils.js');
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
      console.log("+++ 37 index.js payload: ", payload)
      db.User.findOrCreate({
        where: {
          [Op.or]: [
            {
              username: {
                [Op.like]: payload.username
              }
            }, {
              email: {
                [Op.like]: payload.email
              }
            }
          ]
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
          },{
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

  categories_bulk: {
    post: function (payload, callback) {
      var tableName = payload.type + 'Category';
      db[tableName].bulkCreate(
          payload.data,
          {
            ignoreDuplicates: true,
            individualHooks: true
          }
        )
        .then(function (categoriesAdded) {
          if (categoriesAdded) {
            callback(categoriesAdded)
          }else{
            callback(false, "New " + payload.type + " categories not added")
          };
        })
    },
  }

  categories: {
    post: function (payload, callback) {
      console.log("+++ 147 index.js payload: ", payload)
      var tableName = payload.type + 'Category';

        db[tableName].findOrCreate({
          where: {
            [Op.and]: [
            {
              name: payload.data.name
            }, {
              userId: payload.data.userId
            }]
          }
        })
        .spread(function (found, create) {
          if (create) {
            found.name = payload.name;
            found.userId = payload.userId;
            found.save()
          } else{
            callback(found)
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
    },

    patch: function (payload, callback) {
      var tableName = payload.type + 'Category';

      db[tableName].findOne({
        where: {
          id: payload.id,
          userId: payload.userId
        }
      })
      .then(function (category) {
        if(category !== null){
          category.name = payload.name;
          category.save();
          callback(category);
        } else{
          callback(false, payload.type + " category not found")
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
  // Single Total Amount 
  totalAmount: {
    get: function (data, callback) {
      var tableName = 'CurrentTotal' + data.type;
      db[tableName].findOne({
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
      db[tableName].findOne({
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
      db.CurrentTotalIncome.findOne({
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
      db.CurrentTotalIncome.findOne({
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
          [Op.gte]: payload.startDate,
          [Op.lte]: payload.endDate
        },
        deleted: payload.deleted
      };
      if(payload.categoryId){
        searchData['categoryId'] = payload.categoryId
      }
      if(payload.comment){
        searchData['comment'] = {
          [Op.like]: "%" + payload.comment + "%"
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
      var query = {
        where: searchData,
        include: payload.include
      }

      console.log("query: ", JSON.stringify(query, null, "\t"));
      db[tableName].findAll(query)
      .then(function (foundResults) {
        if (foundResults.length > 0) {
          callback(foundResults)
        } else{
          callback(false, "No " + payload.type + " data found")
        };
      })
    }
  },

  expenses_totals: {
    get: function (payload, callback) {

      var searchData = {
        userId: payload.userId,
        date: {
          [Op.gte]: moment().startOf(payload.timeframe).format('x'),
          [Op.lte]: moment().endOf(payload.timeframe).format('x')
        },
        deleted: false
      };
      db.Expenses.findAll({
        where: searchData,
        include: [{
          model: db.ExpensesCategory, 
          attributes: ['name'],
        }]
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
            primaryTotals['currentTotalExpenses'] = user.currenttotalexpense.amount;
          }
          if(user.currenttotalincome){
            primaryTotals['currentTotalIncome'] = user.currenttotalincome.amount;
          }
          if(user.currenttotalsaving){
            primaryTotals['currentTotalSavings'] = user.currenttotalsaving.amount;
          }
          if(user.currenttotalinvest){
            primaryTotals['currentTotalInvest'] = user.currenttotalinvest.amount;
          }

          db.Expenses.findAll({
            where: {
              userId: payload.userId,
              deleted: false,
              date: {
                [Op.gte]: finUtils.startOfMonth(),
                [Op.lte]: finUtils.endOfMonth()
              },
            },
            include: [
              {
                model: db.ExpensesCategory, 
                attributes: ['name'],
              },
            ]
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
  },

  test: {
    get: function (payload, callback) {
      console.log("+++ 547 index.js payload: ", payload)
      db.Income.findAll({ 
        where: {
          userId: payload.userId
        }, 
        include: [{
          model: db.IncomeCategory, 
          attributes: ['name'],
          required: false 
        }, {
          model: db.IncomeAccount,
          attributes: ['name'],
          required: false 
        }]
      })
      .then(function (foundData) {
        if(foundData){
          callback(foundData)
        } else{
          callback(false, "no data found")
        };
      })
    }
  }

}


























