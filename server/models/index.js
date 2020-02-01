// Models
var db = require('../db/db.js');
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
var secrets = require('../../secrets/secrets.js');
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
                            db.CurrentAvailable.create(createTotal)
                              .then(function () {
                                callback(found);
                              })
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

  get_user: {
    get: function (payload, callback) {
      db.User.findOne({
        where: {
          id: payload.userId
        },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      })
      .then(function (user) {
        if(user){
          callback(user);
        } else {
          callback(false, "User not found")
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
      })
      .then(function (user) {
        if(user){
          user.initials_done = true;
          user.save();
          callback(user);
        } else {
          callback(false, "User Initials not updated")
        }
      })
    }
  },

  categories_bulk: {
    post: function (payload, callback) {
      var tableName = payload.type + 'Category';
      db[tableName].bulkCreate(
          payload.data,
        )
        .then(function (categoriesAdded) {
          if (categoriesAdded) {
            callback(categoriesAdded)
          }else{
            callback(false, "New " + payload.type + " categories not added")
          };
        })
    },
  },

  categories: {
    post: function (payload, callback) {
      var tableName = payload.type + 'Category';
      db[tableName].findOrCreate({
        where: {
          name: payload.data.name,
          userId: payload.data.userId,
        }
      })
      .spread(function (found, create) {
        if (create) {
          found.name = payload.data.name;
          found.userId = payload.data.userId;
          found.save()
          callback(found)
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
    },
    delete: function (payload, callback) {
      var tableName = payload.type + 'Category';
      db[tableName].findOne({
        where: {
          id: payload.categoryId,
          userId: payload.userId,
          deleted: false
        }
      })
      .then(function (result) {
        if(result){
          result.deleted = true;
          result.save()
          callback(result)
        } else{
          callback(false, "No category found")
        };
      })
    }
  },

  accounts_bulk: {
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

  accounts: {
    post: function (payload, callback) {
      var tableName = payload.type + 'Account';
      db[tableName].findOrCreate({
        where: {
          name: payload.data.name,
          userId: payload.data.userId,
        }
      })
      .spread(function (found, create) {
        if (create) {
          found.name = payload.data.name;
          found.userId = payload.data.userId;
          found.save()
          callback(found)
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
            model: db.IncomeAccount, 
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false 
          },
          {
            model: db.SavingsAccount, 
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false 
          },
          {
            model: db.InvestAccount, 
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false 
          }]
      })
      .then(function (allAccounts) {
        if(allAccounts){
          callback(allAccounts)
        } else{
          callback(false, "No accounts found")
        };
      })
    },
    patch: function (payload, callback) {
      var tableName = payload.type + 'Account';

      db[tableName].findOne({
        where: {
          id: payload.id,
          userId: payload.userId
        }
      })
      .then(function (account) {
        if(account !== null){
          account.name = payload.name;
          account.save();
          callback(account);
        } else{
          callback(false, payload.type + " account not found")
        };
      })
    },
    delete: function (payload, callback) {
      var tableName = payload.type + 'Account';
      db[tableName].findOne({
        where: {
          id: payload.accountId,
          userId: payload.userId,
          deleted: false
        }
      })
      .then(function (result) {
        if(result){
          result.deleted = true;
          result.save()
          callback(result)
        } else{
          callback(false, "No account found")
        };
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

  income: {
    post: function (payload, callback) {
      if(payload && payload.incomeData && payload.incomeData.length > 0){
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
          deleted: false,
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
      db.Income.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (incomeLine) {
        if(incomeLine){
          _.forEach(payload, function (value, key) {
            if(key !== "id" && key !== "userId"){
              if(incomeLine[key]){
                incomeLine[key] = value;
              }
            }
          })
          incomeLine.save();
          callback(incomeLine)
        } else{
          callback(false, "Income not found")
        };
      })
    },
    delete: function (payload, callback) {
      db.Income.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (incomeLine) {
        if(incomeLine){
          incomeLine.deleted = true;
          incomeLine.save();
          callback(incomeLine)
        } else{
          callback(false, "Income not found")
        };
      })
    }
  },

  expenses: {
    post: function (payload, callback) {
      if(payload && payload.expensesData && payload.expensesData.length > 0){
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
          deleted: false,
          date: {
            $gte: payload.startDate,
            $lte: payload.endDate
          }
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
    patch: function (payload, callback) {
      db.Expenses.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (expensesLine) {
        if(expensesLine){
          _.forEach(payload, function (value, key) {
            if(key !== "id" && key !== "userId"){
              if(expensesLine[key]){
                expensesLine[key] = value;
              }
            }
          })
          expensesLine.save();
          callback(expensesLine)
        } else{
          callback(false, "Expenses not found")
        };
      })
    },
    delete: function (payload, callback) {
      db.Expenses.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (expensesLine) {
        if(expensesLine){
          expensesLine.deleted = true;
          expensesLine.save();
          callback(expensesLine)
        } else{
          callback(false, "Expenses not found")
        };
      })
    }
  },

  savings: {
    post: function (payload, callback) {
      if(payload && payload.savingsData && payload.savingsData.length > 0){
        db.Savings.bulkCreate(
          payload.savingsData,
          { individualHooks: true }
        )
        .then(function (savingsAdded) {
          if (savingsAdded) {
            callback(savingsAdded)
          } else{
            callback(false)
          };
        })
      } else {
        callback(false, "Savings not added")
      };
    },
    patch: function (payload, callback) {
      db.Savings.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (savingsLine) {
        if(savingsLine){
          _.forEach(payload, function (value, key) {
            if(key !== "id" && key !== "userId"){
              if(savingsLine[key]){
                savingsLine[key] = value;
              }
            }
          })
          savingsLine.save();
          callback(savingsLine)
        } else{
          callback(false, "Savings not found")
        };
      })
    },
    delete: function (payload, callback) {
      db.Savings.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (savingsLine) {
        if(savingsLine){
          savingsLine.deleted = true;
          savingsLine.save();
          callback(savingsLine)
        } else{
          callback(false, "Savings not found")
        };
      })
    },
  },

  invest: {
    post: function (payload, callback) {
      if(payload && payload.investData && payload.investData.length > 0){
        db.Invest.bulkCreate(
          payload.investData,
          { individualHooks: true }
        )
        .then(function (investAdded) {
          if (investAdded) {
            callback(investAdded)
          } else{
            callback(false)
          };
        })
      } else {
        callback(false, "Invest not added")
      };
    },
    patch: function (payload, callback) {
      db.Invest.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (investLine) {
        if(investLine){
          _.forEach(payload, function (value, key) {
            if(key !== "id" && key !== "userId"){
              if(investLine[key]){
                investLine[key] = value;
              }
            }
          })
          investLine.save();
          callback(investLine)
        } else{
          callback(false, "Invest not found")
        };
      })
    },
    delete: function (payload, callback) {
      db.Invest.findOne({
        where: {
          userId: payload.userId,
          id: payload.id,
          deleted: false,
        }
      })
      .then(function (investLine) {
        if(investLine){
          investLine.deleted = true;
          investLine.save();
          callback(investLine)
        } else{
          callback(false, "Invest not found")
        };
      })
    },
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

  updateTotalAmount: {
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

  updateCurrentAvailable: {
    patch: function (payload, callback) {
      db.CurrentAvailable.findOne({
        where: {
          userId: payload.userId
        },
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'deleted'] },
      })
      .then(function (currentAvailable) {
        currentAvailable.amount = currentAvailable.amount + payload.totalToUpdate;
        currentAvailable.amount = currentAvailable.amount.toFixed(2);
        currentAvailable.save();
        callback(currentAvailable)
      })
    }
  },

  search: {
    get: function (payload, callback) {
      var searchData = {
        userId: payload.userId,
        date: {
          [Op.gte]: payload.startDate,
          [Op.lte]: payload.endDate,
        },
        deleted: payload.deleted
      };
      if(payload.categoryId){
        searchData['categoryId'] = payload.categoryId
      }
      if(payload.accountId){
        searchData['accountId'] = payload.accountId
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
        searchData['amount'] = {
          [Op.between]: [Number(payload.minAmount) - .001, Number(payload.maxAmount) + .001],
          // // THIS BELOW DOES NOT INCLUDE LESS THAN OR EQUALS WHEN DECIMALS ARE INVOLVED
          // [Op.gte]: Number(payload.minAmount) - .001,
          // [Op.lte]: Number(payload.maxAmount) + .001
        }
      }

      var tableName = payload.type;
      var query = {
        where: searchData
      }
      if(payload.limit){
        query['limit'] = payload.limit
      }
      if (payload.include) {
        query['include'] = payload.include;
      }
      if(payload.orderBy){
        query['order'] = [];
        if(payload.type === "Income" || payload.type === "Expenses"){
          query['order'].push(["categoryId", "asc"])
        }
        if(payload.type === "Income" || payload.type === "Savings" || payload.type === "Invest"){
          query['order'].push(["accountId", "asc"])
        }
        query['order'].push(["amount", "desc"])

        if(payload.order){
          query['order'].push([payload.orderBy, payload.order])
        } else {
          query['order'].push([payload.orderBy])
        }
      }
      console.log("+++ 771 index.js query.where.amount: ", query.where.amount)
      console.log("+++ 771 index.js query: ", query)
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

  all_totals: {
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
          },{
            model: db.CurrentAvailable, 
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
          if(user.currentavailable){
            primaryTotals['currentAvailable'] = user.currentavailable.amount;
          }
          var searchData = {
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
          }

          if(payload.timeframe === 'year'){
            searchData['where']['date'] = {
              [Op.gte]: finUtils.startOfYear(),
              [Op.lte]: finUtils.endOfYear()
            }
          }

          db.Expenses.findAll(searchData)
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

  ping: {
    get: function (callback) {
      console.log("+++ 605 index.js Here")
      db.sequelize.query('show databases')
        .then(function(rows) {
            callback(rows[0])
        })
        .catch((err) => {
            callback(false)
        })
    }
  },

  recalculate_totals: {
    get: function (payload, callback) {
      
      db.Income.findAll({
        where: {
          userId: payload.userId,
          deleted: false
        }
      })
      .then(function(income){
        db.Expenses.findAll({
          where: {
            userId: payload.userId,
            deleted: false
          }
        })
        .then(function(expenses){
          db.Savings.findAll({
            where: {
              userId: payload.userId,
              deleted: false
            }
          })
          .then(function(savings){
            db.Invest.findAll({
              where: {
                userId: payload.userId,
                deleted: false
              }
            })
            .then(function(invest){
              callback({
                income: income,
                expenses: expenses,
                savings: savings,
                invest: invest,
              })
            })
          })
        })
      });
    }
  }

}


























