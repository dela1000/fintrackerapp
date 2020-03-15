var models = require('../models');
var authUtils = require('../helpers/authUtils.js');
var finUtils = require('../helpers/finUtils.js');
var calcUtils = require('../helpers/calcUtils.js');
var Promise = require('bluebird');
var db = require('../db/db.js');
var _ = require('lodash');
var moment = require('moment');
var passwordValidator = require('password-validator');
var emailValidator  = require('email-validator');

var controllers;
module.exports = controllers = {
  login: {
    post: function(req, res) {
      var payload = {
        username: req.body.username,
        password: req.body.password
      };
      if(!payload.username || !payload.password){
        failedResponse(res, "Please submit a username and password")
        return;
      }
      models.login.post(payload, function(isUser, message) {
        if (isUser) {
          authUtils.createToken(req, res, isUser, function(token) {
            var data = {
              fintracktoken: token,
              userId: isUser.dataValues.id,
              username: isUser.dataValues.username,
              userEmail: isUser.dataValues.email,
              initials_done: isUser.dataValues.initials_done,
            }
            successResponse(res, data)
            
          })
        } else {
          failedResponse(res, message)
        };
      })
    }
  },

  signup: {
    post: function(req, res) {
      var payload = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }
      
      // Username, password and email validation
      var userSchema = new passwordValidator().is().min(3).is().max(20).has().not().spaces();
      var passSchema = new passwordValidator().is().min(8).is().max(20).has().not().spaces().is().not().oneOf(authUtils.commonPassword);

      var nameVal = userSchema.validate(payload.username, { list: true });
      var passVal = passSchema.validate(payload.password, { list: true });
      
      if(!_.isEmpty(nameVal)){
        failedResponse(res, 'Username must be between 3 and 20 characters long and have no spaces.')
        return;
      }
      if(!_.isEmpty(passVal)){
          failedResponse(res, 'Password must be at least 8 characters long, have no spaces, and be unique.')
          return;
      }
      if(!emailValidator.validate(payload.email)){
        failedResponse(res, 'Please use a valid email address.')
        return;
      }

      models.signup.post(payload, function(isUser, message) {
        if (isUser) {
          authUtils.createToken(req, res, isUser, function(token, name) {
            var data = {
              username: name,
              fintracktoken: token,
              userId: isUser.dataValues.id,
              initial_done: isUser.dataValues.initials_done,
              userEmail: isUser.dataValues.email,
            }
            successResponse(res, data)
          })
        } else {
          failedResponse(res, message)
          
        };
      })
    }
  },

  logout: {
    get: function(req, res) {
      var data = {
        username: null,
        fintracktoken: null,
        userId: null
      }
      successResponse(res, data)
    }
  },

  whoami: {
    get: function (req, res) {
      var userData = {
        userId: req.headers.userId
      }
      models.get_user.get(userData, function(user, getUserMessage) {
        if(user){
          var data = {
            userId: user.id,
            username: user.username,
            initial_done: user.initials_done,
            userEmail: user.email,
          }
          successResponse(res, data)
        } else{
          failedResponse(res, getUserMessage)
        };
      })
    }
  },

  // TEST PING
  ping: {
    get: function(req, res) {
      console.log("+++ 80 index.js COMPONENT PING")
      models.ping.get(function(data) {
        var finDB = "NOT PRESENT";
        if (data) {
          _.forEach(data, function(db) {
            if (db.Database === "fin") {
              finDB = "DB PRESENT AND WORKING: " + db.Database;
            }
          })
          res.status(200).json({
            success: true,
            data: {
              ping: "API WORKING",
              finDB: finDB,
              headers: req.headers
            }
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              ping: "API WORKING",
              finDB: finDB,
              headers: req.headers
            }
          })
        };
      })
    }
  },

  set_initials: {
    post: function(req, res) {
      var userId = req.headers.userId;
      var lineItems = req.body;
      var userData = {
        userId: userId,
        totalToUpdate: 0
      }
      models.get_user.get(userData, function(user, getUserMessage) {
        if (user) {
          if (!user.initials_done) {
            var source = {
              source: "Initial",
              userId: userId
            }
            models.fund_source.post(source, function (sourceCreated, sourceMessage) {
              if (sourceCreated) {
                _.forEach(lineItems, function (lineItem) {
                  lineItem.userId = userId;
                  lineItem.sourceId = sourceCreated.id;
                  lineItem.source = sourceCreated.source;
                  if(lineItem.typeId === 1){
                    userData.totalToUpdate = userData.totalToUpdate + lineItem.amount;
                  }
                })
                models.user_accounts_bulk.post(lineItems, function (accountsAdded, accountsMessage) {
                  if (accountsAdded) {
                    _.forEach(lineItems, function (lineItem) {
                      lineItem.comment = "Initial amount added";
                      _.forEach(accountsAdded, function (accountData) {
                        if(lineItem.typeId === accountData.typeId && lineItem.account === accountData.account){
                          lineItem.accountId = accountData.id;
                        }
                      })
                    })
                    models.funds_bulk.post(lineItems, function (fundsAdded, fundsMessage) {
                      if (fundsAdded) {
                        models.account_totals_bulk.post(lineItems, function (accountsTotals, totalsMessage) {
                          if (accountsTotals) {
                            models.current_available.patch(userData, function(availableTotal, availableMessage) {
                              if (availableTotal) {
                                models.initials_done.post(userData, function (userUpdated, userMessages) {
                                  if (userUpdated) {
                                    var data = {
                                      fundsAdded: lineItems,
                                      accountsAdded: accountsAdded,
                                      accountsTotals: accountsTotals,
                                      availableTotal: Number(availableTotal.amount),
                                    }
                                    successResponse(res, data)
                                  } else {
                                    failedResponse(res, userMessages)
                                  }
                                })
                              } else {
                                failedResponse(res, availableMessage)
                              }
                            })
                          } else {
                            failedResponse(res, totalsMessage)
                          }
                        })
                      } else {
                        failedResponse(res, fundsMessage)
                      }
                    })
                  } else {
                    failedResponse(res, accountsMessage)
                  }
                })
              } else {
                failedResponse(res, sourceMessage)
              }
            })
          } else {
            failedResponse(res, "User Initials already setup")
          }
        } else {
          failedResponse(res, getUserMessage)
        }
      })
    }
  },

  fund_sources: {
    post: function(req, res) {
      var userId = req.headers.userId;
      var sources = req.body;
      _.forEach(sources, function (source) {
        source.userId = userId
      })
      models.fund_sources_bulk.post(sources, function (sourcesCreated, sourcesMessage) {
        if (sourcesCreated) {
          var data = {
            sourcesCreated: sourcesCreated
          }
          successResponse(res, data)
        } else {
          failedResponse(res, sourcesMessage)
        }
      })
    }
  },

  fund_source: {
    post: function(req, res) {
      var userId = req.headers.userId;
      var source = req.body;
      source.userId = userId
      models.fund_source.post(source, function (sourceCreated, sourceMessage) {
        if (sourceCreated) {
          var data = {
            sourceCreated: sourceCreated
          }
          successResponse(res, data)
        } else {
          failedResponse(res, sourceMessage)
        }
      })
    },
    patch: function(req, res) {
      var payload = {
        userId: req.headers.userId,
        source: req.body.source,
        id: req.body.id,
      };
      models.fund_source.patch(payload, function(sourceUpdated, sourceMessage) {
        if (sourceUpdated) {
          successResponse(res, sourceUpdated)
        } else {
          failedResponse(res, sourceMessage)
        }
      })
    },
  },

  user_accounts: {
    post: function(req, res) {
      var userId = req.headers.userId;
      var accounts = req.body;
      _.forEach(accounts, function (account) {
        account.userId = userId
      })
      models.user_accounts_bulk.post(accounts, function (accountsCreated, accountsMessage) {
        if (accountsCreated) {
          var data = {
            accountsCreated: accountsCreated
          }
          successResponse(res, data)
        } else {
          failedResponse(res, accountsMessage)
        }
      })
    }
  },

  user_account: {
    post: function(req, res) {
      var userId = req.headers.userId;
      var account = req.body;
      account.userId = userId
      models.user_account.post(account, function (accountCreated, accountMessage) {
        if (accountCreated) {
          var data = {
            accountCreated: accountCreated
          }
          successResponse(res, data)
        } else {
          failedResponse(res, accountMessage)
        }
      })
    },
    patch: function(req, res) {
      var payload = {
        userId: req.headers.userId,
        account: req.body.account,
        id: req.body.id,
      };
      models.user_account.patch(payload, function(accountUpdated, accountMessage) {
        if (accountUpdated) {
          successResponse(res, accountUpdated)
        } else {
          failedResponse(res, accountMessage)
        }
      })
    },
  },

  categories_bulk: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var categories = req.body;
      _.forEach(categories, function (category) {
        category.userId = userId
      })
      models.categories_bulk.post(categories, function (categoriesAdded, categoriesMessage) {
        if (categoriesAdded) {
          var data = {
            categoriesAdded: categoriesAdded
          }
          successResponse(res, data)
        } else {
          failedResponse(res, categoriesMessage)
        }
      })
    },

    get: function(req, res) {
      var payload = {
        userId: req.headers.userId,
      }
      models.categories_bulk.get(payload, function(allCategories, categoriesMessage) {
        if (allCategories) {
          var data = {
            expensesCategories: allCategories
          }
          successResponse(res, data)
        } else {
          failedResponse(res, categoriesMessage)
        };
      })
    },
  },

  categories: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var category = req.body;
      category.userId = userId
      models.categories.post(category, function (categoryAdded, categoryMessage) {
        if (categoryAdded) {
          var data = {
            categoryAdded: categoryAdded
          }
          successResponse(res, data)
        } else {
          failedResponse(res, categoryMessage)
        }
      })
    },
    patch: function(req, res) {
      var payload = {
        userId: req.headers.userId,
        name: req.body.name,
        id: req.body.id,
      };
      models.categories.patch(payload, function(categoryUpdated, categoryMessage) {
        if (categoryUpdated) {
          successResponse(res, categoryUpdated)
        } else {
          failedResponse(res, categoryMessage)
        }
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var categoryId = req.body.id;

      var search = {
        type: "Expenses",
        userId: userId,
        categoryId: categoryId,
        deleted: false,
        startDate: finUtils.startOfTime(),
        endDate: finUtils.endOfTime(),
      }
      models.search.get(search, function (expensesFound, expensesMessage) {
        if (!expensesFound) {
          var payload = {
            id: categoryId,
            userId: userId
          }
          models.categories.delete(payload, function (deletedCategory, categoryMessage) {
            if (deletedCategory) {
              var data = {
                id: deletedCategory.dataValues.id,
                accountDeleted: true,
                result: deletedCategory.dataValues
              }
              successResponse(res, data)
            } else {
              failedResponse(res, categoryMessage)
            }
          })
        } else {
          var lines = " lines ";
          if(expensesFound.length == 1){
            lines = " line ";
          }
          var data = {
            message: "This category is being used by " + expensesFound.length +  lines + "in Expenses",
            found: expensesFound
          }
          successResponse(res, data)
        }
          
      })
    }
  },

  funds_bulk: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var funds = req.body;
      totalsByAccountId = {};
      totalsData = [];
      var userData = {
        userId: userId,
        totalToUpdate: 0
      }
      _.forEach(funds, function (fund) {
        fund.userId = userId;
        if(!totalsByAccountId[fund.accountId]){
          totalsByAccountId[fund.accountId] = {
            userId: userId,
            accountId: fund.accountId,
            amount: fund.amount
          };
          var item = {
            userId: userId,
            accountId: fund.accountId,
          }
          totalsData.push(item)
        } else {
          totalsByAccountId[fund.accountId].amount = totalsByAccountId[fund.accountId].amount + fund.amount;
        }
        if(fund.typeId === 1){
          userData.totalToUpdate = userData.totalToUpdate + fund.amount;
        }
      })
      models.funds_bulk.post(funds, function (fundsAdded, fundsMessage) {
        if (fundsAdded) {
          models.account_totals.get_by_id(totalsData, function (totalsResults, totalsMessage) {
            newTotals = [];
            _.forEach(totalsResults, function (total) {
              newTotals.push({
                id: total.id,
                amount: total.amount + totalsByAccountId[total.accountId].amount,
                accountId: total.accountId,
                typeId: total.typeId,
              })
            })
            models.account_totals.upsert(newTotals, function (updatedTotals, updateMessage) {
              if (updatedTotals) {
                _.forEach(updatedTotals, function (total) {
                  total.amount = Number(total.amount.toFixed(2));
                })
                models.current_available.patch(userData, function(availableTotal, availableMessage) {
                  if (availableTotal) {
                    var data = {
                      fundsAdded: fundsAdded,
                      updatedTotals: updatedTotals,
                      availableTotal: Number(availableTotal.amount)
                    };
                    successResponse(res, data)
                  } else{
                    failedResponse(res, availableMessage)
                  };
                })
                
              } else {
                failedResponse(res, updateMessage)
              }
            })
          })
        } else {
          failedResponse(res, fundsMessage)
        }
      })
    },
    get: function (req, res){
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };

      var query = {
        where: {
          userId: userId,
          deleted: false
        },
        limit: 10,
        order: [['date', 'DESC']],
        include: [{
          model: db.FundSources,
          attributes: ['source', 'id'],
        },{
          model: db.UserAccounts,
          attributes: ['account', 'id'],
        },{
          model: db.Types,
          attributes: ['type', 'id'],
        }]
      }

      if(req.query.page > 1){
        var item = req.query.page.toString();
        item = item + "0"
        query.offset = Number(item) - 10;
      }
      if(req.query.sourceId){
        query.where['sourceId'] = Number(req.query.sourceId);
      }
      if(req.query.accountId){
        query.where['accountId'] = Number(req.query.accountId);
      }
      if(req.query.typeId){
        query.where['typeId'] = Number(req.query.typeId);
      }

      models.funds_bulk.get(query, function(funds, fundsMessage){
        
        if(funds){
          var finalData = calcUtils.format_funds(funds);
          successResponse(res, finalData);
        } else{
          failedResponse(res, expensesMessage)
        };
      })
    },
  },

  funds: {
    patch: function (req, res) {
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };
      _.forEach(req.body, function(value, key) {
        payload[key] = value
      })
      models.funds.patch(payload, function(fundUpdated, message) {
        if (fundUpdated) {
          if("amount" in payload || "accountId" in payload){
            calcUtils.calculate_totals(res, userId, function (data, failMessage) {
              if(data){
                successResponse(res, data);
              } else{
                failedResponse(res, failMessage)
              };
            });
          } else {
            var data = {
              fundUpdated: fundUpdated
            }
            successResponse(res, data);
          }
        } else{
          failedResponse(res, message)
        };
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var payload = {
        id: req.body.id,
        userId: userId,
      };
      models.funds.delete(payload, function(fundDeleted, message) {
        if (fundDeleted) {
            calcUtils.calculate_totals(res, userId, function (data, failMessage) {
              if(data){
                data.fundDeleted = fundDeleted;
                successResponse(res, data);
              } else{
                failedResponse(res, failMessage)
              };
            });
        } else{
          failedResponse(res, message)
        };
      })
    },
  },

  expenses_bulk: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var expenses = req.body;
      var userData = {
        userId: userId,
        totalToUpdate: 0
      }
      addedTotals = {};

      _.forEach(expenses, function (expense) {
        expense.userId = userId;
        userData.totalToUpdate = userData.totalToUpdate + expense.amount;
        if(!addedTotals[expense.accountId]){
          addedTotals[expense.accountId] = {
            id: expense.accountId,
            amount: expense.amount
          };
        } else {
          addedTotals[expense.accountId].amount = addedTotals[expense.accountId].amount + expense.amount;
        }
      })
      _.forEach(addedTotals, function (item, key) {
        item.amount = Number(item.amount.toFixed(2));
      })
      userData.totalToUpdate = Number(-userData.totalToUpdate.toFixed(2));
      models.expenses_bulk.post(expenses, function (expensesAdded, expensesMessage) {
        if (expensesAdded) {
          models.account_totals_bulk.get(userData, function (totalsData, totalsMessage) {
            if (totalsData) {
              var newAccountTotals = [];
              _.forEach(totalsData, function (total) {
                if(addedTotals[total.accountId] && addedTotals[total.accountId].id){
                  if(total.accountId === addedTotals[total.accountId].id){
                    total.amount = total.amount - addedTotals[total.accountId].amount;
                    total.amount = Number(total.amount.toFixed(2));
                    newAccountTotals.push({
                      id: total.id,
                      amount: total.amount,
                      accountId: total.accountId,
                      typeId: total.typeId,
                    })
                  }
                }
              })  
              models.account_totals.upsert(newAccountTotals, function (updatedTotals, updateMessage) {
                if (updatedTotals) {
                  models.current_available.patch(userData, function(availableTotal, availableMessage) {
                    if (availableTotal) {
                      var data = {
                        expensesAdded: expensesAdded,
                        updatedTotals: updatedTotals,
                        availableTotal: Number(availableTotal.amount)
                      };
                      successResponse(res, data)
                    } else {
                      failedResponse(res, availableMessage)
                    }
                  })
                } else {
                  failedResponse(res, updateMessage)
                }
              })
            } else {
              failedResponse(res, totalsMessage)
            }
          })
        } else {
          failedResponse(res, expensesMessage)
        }
      })
    },
    get: function (req, res){
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };

      var query = {
        where: {
          userId: userId,
          deleted: false
        },
        limit: 10,
        order: [['date', 'DESC']],
        include: [{
          model: db.ExpensesCategories,
          attributes: ['name', 'id'],
        },{
          model: db.UserAccounts,
          attributes: ['account', 'id'],
        }]
      }

      if(req.query.page > 1){
        var item = req.query.page.toString();
        item = item + "0"
        query.offset = Number(item) - 10;
      }
      if(req.query.categoryId){
        query.where['categoryId'] = Number(req.query.categoryId);
      }

      models.expenses_bulk.get(query, function(expenses, expensesMessage){
        if(expenses){
          var finalData = calcUtils.format_expenses(expenses);
          successResponse(res, finalData);
        } else{
          failedResponse(res, expensesMessage)
        };
      })
    },
  },

  expenses: {
    patch: function (req, res) {
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };
      _.forEach(req.body, function(value, key) {
        payload[key] = value
      })
      console.log("+++ 768 index.js payload: ", payload)
      models.expenses.patch(payload, function(expenseUpdated, message) {
        if (expenseUpdated) {
          if("amount" in payload || "accountId" in payload){
            calcUtils.calculate_totals(res, userId, function (data, failMessage) {
              if(data){
                data[expenseUpdated] = expenseUpdated;
                successResponse(res, data);
              } else{
                failedResponse(res, failMessage)
              };
            });
          } else {
            var data = {
              expenseUpdated: expenseUpdated
            }
            successResponse(res, data);
          }
        } else{
          
        };
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var payload = {
        id: req.body.id,
        userId: userId,
      };
      models.expenses.delete(payload, function(expenseDeleted, message) {
        if (expenseDeleted) {
          
            calcUtils.calculate_totals(res, userId, function (data, failMessage) {
              if(data){
                data.expenseDeleted = expenseDeleted;
                successResponse(res, data);
              } else{
                failedResponse(res, failMessage)
              };
            });
        } else{
          failedResponse(res, message)
        };
      })
    },
  },

  calculate_totals: {
    get: function (req, res) {
      var userId =  req.headers.userId
      calcUtils.calculate_totals(res, userId, function (data, failMessage) {
        if(data){
          successResponse(res, data);
        } else{
          failedResponse(res, failMessage)
        };
      });
    },
  },

  expenses_totals: {
    get: function(req, res) {
      var payload = {
        userId: req.headers.userId,
      }

      if (req.query.timeframe && req.query.timeframe === 'year') {
        payload['startDate'] = finUtils.startOfYear();
        payload['endDate'] = finUtils.endOfYear();
        payload.timeframe = req.query.timeframe;
      } 
      if (req.query.timeframe && req.query.timeframe === 'month') {
        payload['startDate'] = finUtils.startOfMonth();
        payload['endDate'] = finUtils.endOfMonth();
        payload.timeframe = "month";
      }
      if (req.query.startDate && req.query.endDate) {
        payload['startDate'] = req.query.startDate;
        payload['endDate'] = req.query.endDate;
        payload.timeframe = "custom";
      }
      models.expenses_totals.get(payload, function(expensesData, message) {
        if (expensesData) {
          var addedExpensesTotals = calcUtils.add_expenses_totals(expensesData);
          var data = {
            totals: addedExpensesTotals.totals,
            timeframe: payload.timeframe,
            totalExpenses: addedExpensesTotals.totalExpenses.toFixed(2),
            expensesCount: expensesData.length,
            expensesByCategory: addedExpensesTotals.expensesByCategory,
            expensesByAccount: addedExpensesTotals.expensesByAccount,
          }
          successResponse(res, data);
        } else {
          failedResponse(res, message)
        };
      })
    }
  },

  all_totals: {
    get: function(req, res) {
      var payload = {
        userId: req.headers.userId,
        deleted: false
      }
      if(req.query.startDate){
        payload.startDate = req.query.startDate;
      } else{
        payload.startDate = finUtils.startOfMonth();
        
      };
      if(req.query.endDate){
        payload.endDate = req.query.endDate;
      } else{
        payload.endDate = finUtils.endOfMonth();
        
      };
      if (req.query.timeframe === 'month') {
        payload['startDate'] = finUtils.startOfMonth();
        payload['endDate'] = finUtils.endOfMonth();
      }
      if (req.query.timeframe === 'year') {
        payload['startDate'] = finUtils.startOfYear();
        payload['endDate'] = finUtils.endOfYear();
      }
      if(!req.query.timeframe){
        payload['timeframe'] = "custom";
      }
      models.all_totals.get(payload, function(results, message) {
        if (results) {
          models.all_user_data_types.get(payload, function (userData, message) {
            if (userData) {
              var dataTypes = finUtils.formatAccounts(userData)
              var expensesTotals = calcUtils.add_expenses_totals(results.expenses);
              var fundTotals = calcUtils.add_fund_totals(results.funds);
              var data = {
                timeframe: payload.timeframe,
                currentAvailable: results.currentavailable.amount,
                availableByAccount: {
                  checking: [],
                  savings: [],
                  investments: [],
                },
              }
              var availablesHolders = [];
              _.forEach(results.accounttotals, function (total) {
                availablesHolders.push({
                  amount: total.amount,
                  accountId: total.useraccount.id,
                  account: total.useraccount.account,
                  typeId: total.type.id,
                  type: total.type.type,
                })
              })
              
              _.forEach(availablesHolders, function (AccountTotal) {
                if(AccountTotal.typeId === 1){
                  data.availableByAccount['checking'].push(AccountTotal);
                };
                if(AccountTotal.typeId === 2){
                  data.availableByAccount['savings'].push(AccountTotal);
                };
                if(AccountTotal.typeId === 3){
                  data.availableByAccount['investments'].push(AccountTotal);
                };
              });

              _.forEach(expensesTotals, function(value, key) {
                data[key] = value;
              });
              _.forEach(fundTotals, function(value, key) {
                data[key] = value;
              });
              // Add user's dataTypes (accounts, expensesCategories, and fundSources) to response
              data['userAccounts'] = dataTypes.accounts;
              data['expensesCategories'] = dataTypes.expensesCategories;
              data['fundSources'] = dataTypes.fundSources;
              successResponse(res, data);
            } else {
              failedResponse(res, message)
            }
          })
        } else {
          failedResponse(res, message)
        };
      });
    },
  },

  search: {
    get: function (req, res) {
      var userId = req.headers.userId;
      var type = finUtils.capitalizeFirst(req.query.type);
      if(type === "Accounts" || type === "accounts"){
        type = "UserAccounts";
      } 
      else if (type === "Categories" || type === "categories") {
        type = "ExpensesCategories";
      } else if (type === "Sources" || type === "sources") {
        type = "FundSources";
      }

      var payload = {
        userId: userId,
        deleted: false,
        include: [],
        orderBy: "date",
        order: "DESC"
      };

      _.forEach(req.query, (value, key) => {
        payload[key] = value;
      })

      payload['type'] = type;

      if (type === "Funds") {
        payload.sourceId = req.query.sourceId;
        payload.include.push({
          model: db.FundSources,
          attributes: ['source', 'id'],
        })
      }
      if (type === "Expenses") {
        payload.categoryId = req.query.categoryId;
        payload.include.push({
          model: db.ExpensesCategories,
          attributes: ['name', 'id'],
        })
      }

      if (type === "Funds" || type === "Expenses") {
        payload.accountId = req.query.accountId;
        payload.include.push({
          model: db.UserAccounts,
          attributes: ['account', 'id'],
        })
      }
      if (type === "Funds" || type === "UserAccounts") {
        // if(req.query.typeId){
        //   payload.typeId = req.query.typeId;
        // } else {
          payload.typeId = [1,2,3,4];
        // }
        payload.include.push({
          model: db.Types,
          attributes: ['type', 'id'],
        })
      }

      if(type === "Type" || type === "type"){
        payload['type'] = "Funds";
        payload['typeId'] = req.query.typeId;
        payload.include.push({
          model: db.FundSources,
          attributes: ['source', 'id'],
        })
      }


      if (req.query.startDate) {
        payload['startDate'] = req.query.startDate
      } else {
        payload['startDate'] = finUtils.startOfMonth();
      };
      if (req.query.endDate) {
        payload['endDate'] = req.query.endDate;
      } else {
        payload['endDate'] = finUtils.endOfMonth();
      };

      if (req.query.timeframe && req.query.timeframe === 'year') {
        payload['startDate'] = finUtils.startOfYear();
        payload['endDate'] = finUtils.endOfYear();
      }

      if (req.query.timeframe && req.query.timeframe === 'month') {
        payload['startDate'] = finUtils.startOfMonth();
        payload['endDate'] = finUtils.endOfMonth();
      }

      if(req.query.page > 1){
        var item = req.query.page.toString();
        item = item + "0"
        payload.offset = Number(item) - 10;
      }
      console.log("+++ 1043 index.js payload: ", JSON.stringify(payload, null, "\t"));
      models.search.get(payload, function(foundResults, message) {
        if (foundResults) {
          var finalData = [];
          _.forEach(foundResults, function(found, index) {
            item = {};
            _.forEach(found.dataValues, function(value, key) {
              item[key] = value;
            })

            if (type === "Funds") {
              if (item.fundsource) {
                item['source'] = item.fundsource.source;
              }
              if (item.useraccount) {
                item['account'] = item.useraccount.account;
              }
              if (item.type) {
                item['type'] = item.type.type;
              }
            }
            if (type === "Expenses") {
              if (item.expensescategory) {
                item['name'] = item.expensescategory.name;
              }
              if (item.useraccount) {
                item['account'] = item.useraccount.account;
              }
            }
          
            // if (type === "UserAccounts") {
            //   if (item.type) {
            //     item['type'] = item.type.type;
            //   }
            // }
            finalData.push(item)
          })
          var data = {
            results: finalData,
            totalFound: finalData.length,
            queryLimit: payload.limit
          }
          if(type === "Funds" || type === "Expenses"){
            var totalAmountFound = 0;
            if (finalData.length > 0) {
              _.forEach(finalData, function(item) {
                totalAmountFound = totalAmountFound + item.amount;
              })
              data['totalAmountFound'] = totalAmountFound.toFixed(2);
            }
          }

          successResponse(res, data)

        } else{
          failedResponse(res, message)
        };
      })
    }
  },

  transfers: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var details = {
        amount: req.body.amount,
        fromAccountId: req.body.fromAccountId,
        toAccountId: req.body.toAccountId,
        comment: req.body.comment,
        date: req.body.date,
      }
      var payload = {
        userId: userId,
        accountsArray: [{id: details.fromAccountId}, {id: details.toAccountId}]
      }
      models.user_accounts_bulk.get(payload, function (userAccounts, accountsMessage) {
        if (userAccounts.length > 0) {
          var sourceData = {
            userId: userId,
            source: "Internal Transfer"
          }
          models.fund_source.find_or_create(sourceData, function (source) {
            var transferFundsData = [];
            _.forEach(userAccounts, function (accountData) {
              var fund = {
                date: details.date,
                userId: userId,
                sourceId: source.id,
                typeId: 4,
              };
              if(accountData.id === details.toAccountId){
                fund['amount'] = details.amount;
                fund['transferAccountId'] = details.fromAccountId;
                fund['accountId'] = details.toAccountId;
              }
              if(accountData.id === details.fromAccountId){
                fund['amount'] = -details.amount;
                fund['transferAccountId'] = details.toAccountId;
                fund['accountId'] = details.fromAccountId;
              }
              transferFundsData.push(fund)
            })
            models.funds_bulk.post(transferFundsData, function (fundsAdded, fundsMessage) {
              if (fundsAdded) {
                calcUtils.calculate_totals(res, userId, function (data, failMessage) {
                  if(data){
                    data.transferFundsData = transferFundsData;
                    successResponse(res, data);
                  } else{
                    failedResponse(res, failMessage)
                  };
                });
              } else {
                failedResponse(res, fundsMessage)
              }
            })
          })
        } else {
          failedResponse(res, accountsMessage)
        }
      })
    }
  },

  all_user_data_types: {
    get:function (req, res) {
      var payload = {
        userId: req.headers.userId,
      }
      models.all_user_data_types.get(payload, function (userData, message) {
        if (userData) {
          var newData = finUtils.formatAccounts(userData)
          
          delete userData.useraccounts;
          successResponse(res, newData)
        } else {
          failedResponse(res, message)
        }
      })
    }
  },

  types: {
    get: function (req, res) {
      models.types.get(function (types, message) {
        if (types) {
          successResponse(res, types)
        } else {
          failedResponse(res, message)
        }
      })
    }
  }
}

// HELPER FUNCTIONS
var successResponse = function (res, data) {
  res.status(200).json({
    success: true,
    data: data
  })
}

var failedResponse = function (res, message) {
  res.status(200).json({
    success: false,
    data: {
      message: message
    }
  })
}

