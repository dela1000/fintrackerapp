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
    post: function(payload, callback) {
      db.Users.findOne({
          where: {
            username: payload.username
          },
        })
        .then(function(found) {
          if (found) {
            authUtils.checkPasswordHash(payload.password, found.password, function(res) {
              if (res) {
                callback(found)
              } else {
                callback(false, 'Incorrect username and password')
              }
            })
          } else {
            callback(false, "Username not found")
          };
        })
    }
  },

  signup: {
    post: function(payload, callback) {
      db.Users.findOrCreate({
          where: {
            [Op.or]: [{
              username: {
                [Op.like]: payload.username
              }
            }, {
              email: {
                [Op.like]: payload.email
              }
            }]
          }
        })
        .spread(function(found, create) {
          if (create) {
            authUtils.createPasswordHash(payload.password, function(passwordHash) {
              found.username = payload.username;
              found.password = passwordHash;
              found.email = payload.email;
              found.save();

              var createTotal = {
                amount: 0,
                userId: found.dataValues.id
              }
              db.CurrentAvailables.create(createTotal)
                .then(function() {
                  callback(found);
                })
            })
          } else {
            callback(false, "User name or email already used");
          }
        })
    }
  },

  get_user: {
    get: function(payload, callback) {
      db.Users.findOne({
          where: {
            id: payload.userId
          },
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        })
        .then(function(user) {
          if (user) {
            callback(user);
          } else {
            callback(false, "User not found")
          }
        })
    }
  },

  get_types: {
    get: function(callback) {
      db.Types.findAll()
        .then(function(types) {
          if (types) {
            callback(types);
          } else {
            callback(false, "Types not found")
          }
        })
    }
  },
  types: {
    get: function (callback) {
      db.Types.findAll({
        where: {
          Type: {
            [Op.not]: ['transfers']
          }
        },
        attributes: ['type', 'id'],
      })
        .then(function (types) {
          if (types) {
            callback(types)
          } else {
            callback(false, "Types not found")
          }
        })
    }
  },

  get_type: {
    get: function(payload, callback) {
      db.Types.findOne({
        where: {
          name: payload.type
        }
      })
        .then(function(type) {
          if (type) {
            callback(type);
          } else {
            callback(false, "Type not found")
          }
        })
    }
  },

  initials_done: {
    post: function(payload, callback) {
      db.Users.findOne({
          where: {
            id: payload.userId
          },
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        })
        .then(function(user) {
          if (user) {
            user.initials_done = true;
            user.save();
            callback(user);
          } else {
            callback(false, "User Initials not updated")
          }
        })
    }
  },

  ping: {
    get: function(callback) {
      console.log("+++ 147 index.js MODEL PING!")
      db.sequelize.query('show databases')
        .then(function(rows) {
          callback(rows[0])
        })
        .catch((err) => {
          callback(false)
        })
    }
  },

  user_accounts_bulk: {
    post: function(payload, callback) {
      db.UserAccounts.bulkCreate(payload)
        .then(function(userAccountsAdded) {
          if (userAccountsAdded) {
            callback(userAccountsAdded)
          } else {
            callback(false, "New fund accounts not added")
          };
        })
    },
    get: function (payload, callback) {
      var query = {
        where: {
          userId: payload.userId,
        }
      }
      if(payload.accountsArray){
        query.where[Op.or] = payload.accountsArray;
      }
      db.UserAccounts.findAll(query)
      .then(function (results) {
        if(results.length > 0){
          callback(results)
        } else{
          callback(false, "User Accounts not found")
        };
      })
    }
  },

  user_account: {
    post: function(payload, callback) {
      db.UserAccounts.create(payload)
        .then(function(create) {
          if (create) {
            callback(create)
          } else {
            callback(false, "User Account not created")
          };
        })
    },
    get: function (payload, callback) {
      db.UserAccounts.findOne({
        where: {
          userId: payload.userId,
          name: payload.name
        }
      })
      .then(function(fundAccount) {
        if (fundAccount) {
          callback(fundAccount);
        } else {
          callback(false, "Fund Account not found")
        }
      })
    },
    patch: function(payload, callback) {
      db.UserAccounts.findOne({
          where: {
            id: payload.id,
            userId: payload.userId
          }
        })
        .then(function(account) {
          if (account !== null) {
            account.account = payload.account;
            account.save();
            callback(account);
          } else {
            callback(false, "Account not found")
          };
        })
    },
  },

  fund_sources_bulk: {
    post: function(payload, callback) {
      db.FundSources.bulkCreate(payload)
        .then(function(sourcesCreated) {
          if (sourcesCreated) {
            callback(sourcesCreated)
          } else {
            callback(false, "Fund Sources not created")
          };
        })
    },
  },

  fund_source: {
    post: function(payload, callback) {
      db.FundSources.create(payload)
        .then(function(create) {
          if (create) {
            callback(create)
          } else {
            callback(false, "Fund Source not created")
          };
        })
    },
    patch: function(payload, callback) {
      db.FundSources.findOne({
          where: {
            id: payload.id,
            userId: payload.userId
          }
        })
        .then(function(source) {
          if (source !== null) {
            source.source = payload.source;
            source.save();
            callback(source);
          } else {
            callback(false, "Source not found")
          };
        })
    },
    find_or_create: function (payload, callback) {
      db.FundSources.findOrCreate({
        where: {
          userId: payload.userId,
          source: "Internal Transfer"
        }
      })
      .spread(function(found, create) {
        callback(found)
      })
    }
  },

  funds_bulk: {
    post: function(payload, callback) {
      db.Funds.bulkCreate(payload)
        .then(function(funds) {
          if (funds) {
            callback(funds)
          } else {
            callback(false, "New funds not added")
          };
        })
    },
    get: function (payload, callback) {
      db.Funds.findAll(payload)
      .then(function (results) {
        if(results){
          callback(results)
        } else{
          callback(false, "Funds not found")
        };
      })
    }
  },

  account_totals_bulk: {
    post: function(payload, callback) {
      db.AccountTotals.bulkCreate(payload)
        .then(function(accountTotals) {
          if (accountTotals) {
            callback(accountTotals)
          } else {
            callback(false, "New Account Totals not added")
          };
        })
    },
    get: function (payload, callback) {
      db.AccountTotals.findAll({
        where: {
          userId: payload.userId,
          deleted: false
        },
        include: [{
            model: db.UserAccounts,
            where: {
              deleted: false
            },
            attributes: ['account', 'id'],
            required: false
          },
          {
            model: db.Types,
            attributes: ['type', 'id'],
            required: false
          }]
      })
      .then(function (results) {
        if(results){
          callback(results)
        } else{
          callback(false, "Account Totals not found")
        };
      })
    }
  },

  current_available: {
    patch: function(payload, callback) {
      db.CurrentAvailables.findOne({
          where: {
            userId: payload.userId
          },
          attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'deleted'] },
        })
        .then(function(currentAvailable) {
          if(currentAvailable){
            currentAvailable.amount = currentAvailable.amount + payload.totalToUpdate;
            if(currentAvailable.amount !== 0){
              currentAvailable.amount = currentAvailable.amount.toFixed(2);
            }
            currentAvailable.save();
            callback(currentAvailable)
          } else {
            callback(false, "Current Available not found")
          }
        })
    }
  },

  recalculated_current_available: {
    patch: function(payload, callback) {
      db.CurrentAvailables.findOne({
          where: {
            userId: payload.userId
          },
          attributes: { exclude: ['createdAt', 'updatedAt', 'userId', 'deleted'] },
        })
        .then(function(currentAvailable) {
          if(currentAvailable){
            currentAvailable.amount = payload.newCurrentAvailable;
            currentAvailable.amount = currentAvailable.amount.toFixed(2);
            currentAvailable.save();
            callback(currentAvailable)
          } else {
            callback(false, "Current Available not found")
          }
        })
    }
  },

  categories_bulk: {
    post: function(payload, callback) {
      db.ExpensesCategories.bulkCreate(payload)
        .then(function(categoriesAdded) {
          if (categoriesAdded) {
            callback(categoriesAdded)
          } else {
            callback(false, "New categories not added")
          };
        })
    },
    get: function (payload, callback) {
      db.ExpensesCategories.findAll({
        where: {
          userId: payload.userId,
        }
      })
      .then(function (results) {
        if(results){
          callback(results)
        } else{
          callback(false, "Expenses not found")
        };
      })
    }
  },

  categories: {
    post: function(payload, callback) {
      db.ExpensesCategories.create(payload)
        .then(function(create) {
          if (create) {
            callback(create)
          } else {
            callback(false, "Category not created")
          };
        })
    },
    patch: function(payload, callback) {
      db.ExpensesCategories.findOne({
          where: {
            id: payload.id,
            userId: payload.userId
          }
        })
        .then(function(category) {
          if (category !== null) {
            category.name = payload.name;
            category.save();
            callback(category);
          } else {
            callback(false, "Expenses Category not found")
          };
        })
    },
    delete: function (payload, callback) {
      db.ExpensesCategories.findOne({
          where: {
            id: payload.id,
            userId: payload.userId
          }
        })
        .then(function (found) {
          if(found){
            found.deleted = true;
            found.save();
            callback(found);
          } else{
            callback(false, "Category not found")
          };
        })
    }
  },

  account_totals: {
    get_by_id: function (payload, callback){
      db.AccountTotals.findAll({
        where: {
          [Op.or]: payload
        }
      })
      .then(function (results) {
        if(results){
          callback(results)
        } else{
          callback(false, "No totals found")
        };
      })
    },
    upsert: function (payload, callback) {
      db.AccountTotals.bulkCreate(payload, {
        fields:["id", "amount", "accountId", "typeId"],
        updateOnDuplicate: ["amount"] 
      })
      .then(function(results){
        if (results) {
          callback(results)
        } else {
          callback(false, "Accounts Totals not updated")
        }
        
      })
    },
  },

  funds: {
    patch: function (payload, callback) {
      db.Funds.findOne({
          where: {
            userId: payload.userId,
            id: payload.id,
            deleted: false,
          }
        })
        .then(function(fund) {
          if (fund) {
            _.forEach(payload, function(value, key) {
              if (key !== "id" && key !== "userId") {
                fund[key] = value;
              }
            })
            fund.save();
            callback(fund)
          } else {
            callback(false, "Fund not found")
          };
        })
    },
    delete: function (payload, callback) {
      db.Funds.findOne({
          where: {
            userId: payload.userId,
            id: payload.id,
          }
        })
        .then(function(fund) {
          if (fund) {
            fund.deleted = true;
            fund.save();
            callback(fund)
          } else {
            callback(false, "Fund not found")
          };
        })
    },
  },

  expenses_bulk: {
    post: function(payload, callback) {
      db.Expenses.bulkCreate(
          payload
        )
        .then(function(expensesAdded) {
          if (expensesAdded) {
            callback(expensesAdded)
          } else {
            callback(false, "Expenses not added")
          };
        })
    },
    get: function (payload, callback) {
      db.Expenses.findAll(payload)
      .then(function (results) {
        if(results){
          callback(results)
        } else{
          callback(false, "Expenses not found")
        };
      })
    }
  },

  expenses: {
    patch: function (payload, callback) {
      db.Expenses.findOne({
          where: {
            userId: payload.userId,
            id: payload.id,
            deleted: false,
          }
        })
        .then(function(expense) {
          if (expense) {
            _.forEach(payload, function(value, key) {
              if (key !== "id" && key !== "userId") {
                expense[key] = value;
              }
            })
            expense.save();
            callback(expense)
          } else {
            callback(false, "Fund not found")
          };
        })
    },
    delete: function (payload, callback) {
      db.Expenses.findOne({
          where: {
            userId: payload.userId,
            id: payload.id,
          }
        })
        .then(function(expense) {
          if (expense) {
            expense.deleted = true;
            expense.save();
            callback(expense)
          } else {
            callback(false, "Expense not found")
          };
        })
    },
  },

  expenses_totals: {
    get: function(payload, callback) {
      var searchData = {
        userId: payload.userId,
        date: {
          [Op.gte]: payload.startDate,
          [Op.lte]: payload.endDate
        },
        deleted: false
      };
      db.Expenses.findAll({
          where: searchData,
          include: [{
            model: db.ExpensesCategories,
            attributes: ['name'],
          },{
            model: db.UserAccounts,
            attributes: ['account'],
          }]
        })
        .then(function(expensesData) {
          if (expensesData) {
            callback(expensesData)
          } else {
            callback(false, "No data found")
          }
        })
    }
  },

  all_totals: {
    get: function(payload, callback) {
      var primaryTotals = {};
      var searchData = {
        userId: payload.userId,
        date: {
          [Op.gte]: payload.startDate,
          [Op.lte]: payload.endDate,
        },
        deleted: payload.deleted
      };
      db.Users.findOne({
        where: {
          id: payload.userId
        },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: [{
            model: db.AccountTotals,
            attributes: ['amount'],
            include: [{
                model: db.UserAccounts,
                where: {
                  deleted: false
                },
                attributes: ['account', 'id'],
                required: false
              }, {
                model: db.Types,
                attributes: ['type', 'id'],
                required: false
              }
            ],
            required: false
          }, {
            model: db.Expenses,
            where: searchData,
            include: [{
              model: db.ExpensesCategories,
              where: {
                deleted: false
              },
              attributes: ['name', 'id'],
              required: false
            },{
              model: db.UserAccounts,
              where: {
                deleted: false
              },
              attributes: ['account', 'id'],
              required: false
            }],
            required: false
          }, {
            model: db.Funds,
            where: searchData,
            include: [{
                model: db.Types,
                attributes: ['type', 'id'],
                required: false
              }, {
                model: db.UserAccounts,
                where: {
                  deleted: false
                },
                attributes: ['account', 'id'],
                required: false
              }, {
                model: db.FundSources,
                where: {
                  deleted: false
                },
                attributes: ['source', 'id'],
                required: false
              },
              
            ],
            required: false
          }, {
            model: db.CurrentAvailables,
          }]
      })
      .then(function (results) {
        if (results) {
          callback(results)
        } else {
          callback(false, "User data not found")
        }
      })
    }
  },

  search: {
    get: function(payload, callback) {
      console.log("+++ 752 index.js payload: ", payload)
      var searchData = {
        userId: payload.userId,
        date: {
          [Op.gte]: payload.startDate,
          [Op.lte]: payload.endDate,
        },
        deleted: payload.deleted
      };
      if (payload.categoryId) {
        searchData['categoryId'] = payload.categoryId
      }
      if (payload.accountId) {
        searchData['accountId'] = payload.accountId
      }
      if (payload.typeId) {
        searchData['typeId'] = payload.typeId
      }
      if (payload.comment) {
        searchData['comment'] = {
          [Op.like]: "%" + payload.comment + "%"
        }
      }
      if (payload.minAmount || payload.maxAmount) {
        if (!payload.minAmount) {
          payload.minAmount = 0;
        };
        if (!payload.maxAmount) {
          payload.maxAmount = 99999;
        };
        searchData['amount'] = {
          [Op.between]: [Number(payload.minAmount) - .001, Number(payload.maxAmount) + .001],
          // // THIS BELOW DOES NOT INCLUDE LESS THAN OR EQUALS WHEN DECIMALS ARE INVOLVED
          // [Op.gte]: Number(payload.minAmount) - .001,
          // [Op.lte]: Number(payload.maxAmount) + .001
        }
      };


      var tableName = payload.type;
      var query = {
        where: searchData
      }
      if(payload.offset){
        query['offset'] = payload.offset;
      }

      if (payload.limit) {
        query['limit'] = payload.limit
      }
      if (payload.include) {
        query['include'] = payload.include;
      }
      if (payload.orderBy) {
        query['order'] = [[payload.orderBy, payload.order]];
        if (payload.type === "Expenses") {
          query['order'].push(["categoryId", "asc"])
        }
        if (payload.type === "Funds") {
          query['order'].push(["accountId", "asc"])
        }
        query['order'].push(["amount", "desc"])
      }
      // if(tableName === "ExpensesCategories"){
      //   delete query.where.date;
      //   delete query.order;
      //   query.where.id = query.where.categoryId;
      //   delete query.where.categoryId;
      // }
      console.log("+++ 821 index.js query.where: ", query.where)
      console.log("models - Search query: ", JSON.stringify(query, null, "\t"))

      db[tableName].findAll(query)
        .then(function(foundResults) {
          if (foundResults.length > 0) {
            callback(foundResults)
          } else {
            callback(false, "No " + payload.type + " data found")
          };
        })
    }
  },

  all_user_data_types: {
    get: function (payload, callback) {
      db.Users.findOne({
        where: {
          id: payload.userId,
          deleted: false,
        },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: [{
            model: db.UserAccounts,
            where: {
              deleted: false
            },
            attributes: ['account', 'id', 'typeId', 'primary'],
            required: false,
            include: [{
                model: db.Types,
                attributes: ['type', 'id'],
                required: false
              }]
          }, {
            model: db.FundSources,
            where: {
              deleted: false,
              source: {
                [Op.not]: ['Initial', 'Internal Transfer']
              }
            },
            attributes: ['source', 'id'],
            required: false
          }, {
            model: db.ExpensesCategories,
            where: {
              deleted: false
            },
            attributes: ['name', 'id'],
            required: false
          }
        ],
      })
      .then(function (dataFound) {
        if(dataFound){
          callback(dataFound)
        } else{
          callback(false, "Data not found")
        };
      })
    }
  },

}