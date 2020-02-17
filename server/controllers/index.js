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
      console.log("+++ 20 index.js payload: ", payload)
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
              initial_done: isUser.dataValues.initial_done,
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
                amount: total.amount + totalsByAccountId[total.id].amount,
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
  },

  funds: {
    patch: function (req, res) {
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };
      _.forEach(req.body, function(value, key) {
        if (key === "date") {
          payload[key] = finUtils.startOfDay(value);
        } else {
          payload[key] = value
        }
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
    }
  },

  expenses: {
    patch: function (req, res) {
      var userId = req.headers.userId;
      
      var payload = {
        userId: userId,
      };
      _.forEach(req.body, function(value, key) {
        if (key === "date") {
          payload[key] = finUtils.startOfDay(value);
        } else {
          payload[key] = value
        }
      })
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
      } else {
        payload['startDate'] = finUtils.startOfMonth();
        payload['endDate'] = finUtils.endOfMonth();
        payload.timeframe = "month";
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
        timeframe: "month",
        userId: req.headers.userId,
        deleted: false,
        startDate: finUtils.startOfMonth(),
        endDate: finUtils.endOfMonth()
      }
      
      if (req.query.timeframe === 'year') {
        payload['timeframe'] = "year";
        payload['startDate'] = finUtils.startOfYear();
        payload['endDate'] = finUtils.endOfYear();
      }
      models.all_totals.get(payload, function(results, message) {
        if (results) {
          var expensesTotals = calcUtils.add_expenses_totals(results.expenses);
          var fundTotals = calcUtils.add_fund_totals(results.funds);
          var data = {
            timeframe: payload.timeframe,
            currentAvailable: results.currentavailable.amount,
            availableByAccount: [],
          }
          _.forEach(results.accounttotals, function (total) {
            data.availableByAccount.push({
              amount: total.amount,
              accountId: total.useraccount.id,
              account: total.useraccount.account,
              typeId: total.type.id,
              type: total.type.type,
            })
          })
          _.forEach(expensesTotals, function(value, key) {
            data[key] = value;
          })
          _.forEach(fundTotals, function(value, key) {
            data[key] = value;
          })
          successResponse(res, data);
        } else {
          failedResponse(res, message)
        }
      })
    }
  },

  search: {
    get: function (req, res) {
      var userId = req.headers.userId;
      var type = finUtils.capitalizeFirst(req.query.type);
      if(type === "Accounts"){
        type = "UserAccounts";
      } 
      else if (type === "Categories") {
        type = "ExpensesCategories";
      } else if (type === "Sources") {
        type = "FundSources";
      }

      var payload = {
        userId: userId,
        type: type,
        deleted: false,
        include: [],
        orderBy: "date",
        order: "asc"
      };

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
        payload.typeId = req.query.typeId;
        payload.include.push({
          model: db.Types,
          attributes: ['type', 'id'],
        })
      }

      // if(type === "ExpensesCategories"){
      //   payload.categoryId = req.query.categoryId;
      // }

      if (req.query.comment) {
        payload.comment = req.query.comment
      }
      if (req.query.minAmount) {
        payload.minAmount = req.query.minAmount
      }
      if (req.query.maxAmount) {
        payload.maxAmount = req.query.maxAmount
      }
      if (req.query.deleted) {
        payload.deleted = true;
      };
      if (req.query.limit) {
        payload.limit = Number(req.query.limit);
      };
      if (req.query.orderBy) {
        payload.orderBy = req.query.orderBy;
      };
      if (req.query.order) {
        payload.order = req.query.order;
      };
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

      models.search.get(payload, function(foundResults, message) {
        if (foundResults) {
          console.log("+++ 846 index.js foundResults: ", foundResults)
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


  // categories_bulk: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var data = req.body.newCategories;
  //     _.forEach(data, function(item) {
  //       item['userId'] = req.headers.userId;
  //       item['name'] = item['name'].toLowerCase();
  //     })
  //     var payload = {
  //       type: type,
  //       data: data
  //     };
  //     models.categories_bulk.post(payload, function(categoriesAdded, categoriesMessage) {
  //       if (categoriesAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             type: type,
  //             categoriesAdded: categoriesAdded
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: categoriesMessage
  //           }
  //         });
  //       };
  //     })
  //   },
  // },

  // categories: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var data = req.body.newCategory;
  //     data['userId'] = req.headers.userId;
  //     var payload = {
  //       type: type,
  //       data: data
  //     };
  //     models.categories.post(payload, function(categoriesAdded, categoriesMessage) {
  //       if (categoriesAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             type: type,
  //             categoriesAdded: categoriesAdded
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: categoriesMessage
  //           }
  //         });
  //       };
  //     })
  //   },

  //   get: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //     }
  //     models.categories.get(payload, function(allCategories, categoriesMessage) {
  //       if (allCategories) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             expensesCategories: allCategories.expensescategories,
  //             incomeCategories: allCategories.incomecategories
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: categoriesMessage
  //           }
  //         });
  //       };
  //     })
  //   },

  //   patch: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //       type: finUtils.type(req.body.type),
  //       name: req.body.name,
  //       id: req.body.id,
  //     };
  //     models.categories.patch(payload, function(categoriesAdded, categoriesMessage) {
  //       if (categoriesAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: categoriesAdded
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: categoriesMessage
  //           }
  //         });
  //       }

  //     })
  //   },
  //   delete: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var payload = {
  //       type: type,
  //       userId: req.headers.userId,
  //       categoryId: req.body.id,
  //       deleted: false,
  //     };
  //     models.search.get(payload, function(results) {
  //       if (!results) {
  //         models.categories.delete(payload, function(result, categoriesMessage) {
  //           if (result) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 id: result.dataValues.id,
  //                 categoryDeleted: true,
  //                 result: result.dataValues
  //               }
  //             });
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: categoriesMessage
  //               }
  //             });
  //           };
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: "This category is being used by " + results.length + " lines in " + type,
  //             found: results
  //           }
  //         });
  //       };
  //     })
  //   }
  // },

  // accounts_bulk: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var data = req.body.newAccounts;
  //     _.forEach(data, function(item) {
  //       item['userId'] = req.headers.userId;
  //       item['name'] = item['name'].toLowerCase();
  //     })
  //     var payload = {
  //       type: type,
  //       data: data
  //     };
  //     models.accounts_bulk.post(payload, function(accountsAdded, accountsMessage) {
  //       if (accountsAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             type: type,
  //             accountsAdded: accountsAdded
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: accountsMessage
  //           }
  //         });
  //       };
  //     })
  //   },
  // },

  // accounts: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var data = req.body.newAccount;
  //     data['userId'] = req.headers.userId;
  //     var payload = {
  //       type: type,
  //       data: data
  //     };
  //     models.accounts.post(payload, function(accountsAdded, accountsMessage) {
  //       if (accountsAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             type: type,
  //             accountsAdded: accountsAdded
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: accountsMessage
  //           }
  //         });
  //       };
  //     })
  //   },

  //   get: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //     }
  //     models.accounts.get(payload, function(allAccounts, accountsMessage) {
  //       if (allAccounts) {
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             incomeAccounts: allAccounts.incomeaccounts,
  //             savingsAccounts: allAccounts.savingsaccounts,
  //             investAccounts: allAccounts.investaccounts,
  //           }
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: accountsMessage
  //           }
  //         });
  //       };
  //     })
  //   },

  //   patch: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //       type: finUtils.type(req.body.type),
  //       name: req.body.name,
  //       id: req.body.id,
  //     };
  //     models.accounts.patch(payload, function(accountsAdded, accountsMessage) {
  //       if (accountsAdded) {
  //         res.status(200).json({
  //           success: true,
  //           data: accountsAdded
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: accountsMessage
  //           }
  //         });
  //       }

  //     })
  //   },
  //   delete: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var payload = {
  //       type: type,
  //       userId: req.headers.userId,
  //       accountId: req.body.id,
  //       deleted: false,
  //       startDate: '01-01-2020',
  //       endDate: '12-31-2100',
  //     };
  //     models.search.get(payload, function(results) {
  //       if (!results) {
  //         models.accounts.delete(payload, function(result, accountsMessage) {
  //           if (result) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 id: result.dataValues.id,
  //                 accountDeleted: true,
  //                 result: result.dataValues
  //               }
  //             });
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: accountsMessage
  //               }
  //             });
  //           };
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: "This account is being used by " + results.length + " lines in " + type,
  //             found: results
  //           }
  //         });
  //       };
  //     })
  //   }
  // },

  // income: {
  //   post: function(req, res) {
  //     var userId = req.headers.userId;
  //     var type = finUtils.type(req.body.type);
  //     var payload = {
  //       type: type,
  //       data: req.body.data
  //     }
  //     var totalAmounts = {
  //       userId: userId,
  //       type: type,
  //       amount: 0
  //     };
  //     _.forEach(payload.data, function(amount) {
  //       amount['userId'] = userId;
  //       amount['date'] = amount.date;
  //       totalAmounts['amount'] = totalAmounts['amount'] + amount.amount;
  //     })
  //     models.bulk_add.post(payload, function(amountsCreated, bulkMessage) {
  //       if (amountsCreated) {
  //         models.updateTotalAmount.patch(totalAmounts, function(currentTotalIncome, currentIncomeMessage) {
  //           if (currentTotalIncome) {
  //             var currentAvailableValues = {
  //               userId: userId,
  //               totalToUpdate: totalAmounts['amount']
  //             }
  //             models.current_available.patch(currentAvailableValues, function(currentAvailable, currentAvailableMessage) {
  //               if (currentAvailable) {
  //                 res.status(200).json({
  //                   success: true,
  //                   data: {
  //                     amountsCreated: amountsCreated,
  //                     amountIncrease: Number(totalAmounts['amount'].toFixed(2)),
  //                     currentTotalIncome: Number(currentTotalIncome.amount),
  //                     currentAvailable: Number(currentAvailable.amount),
  //                   }
  //                 })
  //               } else {
  //                 res.status(200).json({
  //                   success: false,
  //                   data: {
  //                     message: currentAvailableMessage
  //                   }
  //                 })
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: currentIncomeMessage
  //               }
  //             })
  //           };
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: bulkMessage
  //           }

  //         })
  //       }
  //     })
  //   },
  //   get: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //     }
  //     if (req.query.startDate) {
  //       payload['startDate'] = req.query.startDate;
  //     } else {
  //       payload['startDate'] = finUtils.startOfMonth();

  //     };
  //     if (req.query.endDate) {
  //       payload['endDate'] = req.query.endDate;
  //     } else {
  //       payload['endDate'] = finUtils.endOfMonth();
  //     };

  //     models.income.get(payload, function(userIncome) {
  //       if (userIncome) {
  //         res.status(200).json(userIncome)
  //       } else {
  //         res.status(404)
  //       };

  //     })
  //   },
  //   patch: function(req, res) {
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //     }
  //     _.forEach(req.body, function(value, key) {
  //       if (key === "date") {
  //         payload[key] = finUtils.startOfDay(value);
  //       } else {
  //         payload[key] = value
  //       }
  //     })
  //     models.income.patch(payload, function(updatedIncome, message) {
  //       if (updatedIncome) {
  //         if (payload.amount) {
  //           var totalToUpdate = updatedIncome._previousDataValues.amount - payload.amount;
  //           var updateAmount = {
  //             userId: userId,
  //             type: "Income",
  //             amount: -totalToUpdate,
  //             totalToUpdate: -totalToUpdate
  //           };
  //           models.updateTotalAmount.patch(updateAmount, function(newTotalIncome, totalIncomeMessage) {
  //             if (newTotalIncome) {
  //               models.current_available.patch(updateAmount, function(currentAvailable, currentAvailableMessage) {
  //                 if (currentAvailable) {
  //                   res.status(200).json({
  //                     success: true,
  //                     data: {
  //                       updatedIncome: updatedIncome,
  //                       newTotalIncome: Number(newTotalIncome.amount),
  //                       currentAvailable: Number(currentAvailable.amount),
  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: currentAvailableMessage
  //                     }
  //                   })
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalIncomeMessage
  //                 }
  //               })
  //             }

  //           })
  //         } else {
  //           res.status(200).json({
  //             success: true,
  //             data: updatedIncome
  //           })
  //         }
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: message
  //           }
  //         });
  //       }
  //     })
  //   },
  //   delete: function(req, res) {
  //     var userId = req.headers.userId;
  //     var type = "Income";
  //     var payload = {
  //       type: type,
  //       id: req.body.id,
  //       userId: userId,
  //     }
  //     models.income.delete(payload, function(income, incomeMessage) {
  //       if (income) {
  //         var deletedAmount = {
  //           type: type,
  //           userId: userId,
  //           amount: -income.dataValues.amount,
  //           totalToUpdate: -income.dataValues.amount
  //         }
  //         models.updateTotalAmount.patch(deletedAmount, function(currentTotalIncome, currentIncomeMessage) {
  //           if (currentTotalIncome) {
  //             models.current_available.patch(deletedAmount, function(currentAvailable, currentAvailableMessage) {
  //               if (currentAvailable) {
  //                 res.status(200).json({
  //                   success: true,
  //                   data: {
  //                     id: income.dataValues.id,
  //                     incomeDeleted: true,
  //                     currentTotalIncome: Number(currentTotalIncome.amount),
  //                     currentAvailable: Number(currentAvailable.amount),
  //                   }
  //                 })
  //               } else {
  //                 res.status(200).json({
  //                   success: false,
  //                   data: {
  //                     message: currentAvailableMessage
  //                   }
  //                 })
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: currentIncomeMessage
  //               }
  //             })
  //           };
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: incomeMessage
  //           }
  //         });
  //       }
  //     })
  //   }
  // },

  // expenses: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //       expensesData: req.body.expensesData
  //     }
  //     var newExpensesTotal = {
  //       type: type,
  //       userId: userId,
  //       amount: 0
  //     };
  //     _.forEach(payload.expensesData, function(amount) {
  //       amount['userId'] = req.headers.userId;
  //       amount['date'] = amount.date;
  //       newExpensesTotal.amount = newExpensesTotal.amount + amount.amount;
  //     })
  //     newExpensesTotal['totalToUpdate'] = -newExpensesTotal.amount;
  //     models.expenses.post(payload, function(expensesCreated) {
  //       if (expensesCreated) {
  //         // UPDATE EXPENSES TOTAL
  //         models.updateTotalAmount.patch(newExpensesTotal, function(newTotalExpenses, totalExpensesMessage) {
  //           if (newTotalExpenses) {
  //             models.current_available.patch(newExpensesTotal, function(currentAvailable, currentAvailableMessage) {
  //               if (currentAvailable) {
  //                 res.status(200).json({
  //                   success: true,
  //                   data: {
  //                     expensesCreated: expensesCreated,
  //                     newTotalExpenses: Number(newTotalExpenses.amount),
  //                     currentAvailable: Number(currentAvailable.amount),
  //                   }
  //                 })
  //               } else {
  //                 res.status(200).json({
  //                   success: false,
  //                   data: {
  //                     message: currentAvailableMessage
  //                   }
  //                 })
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: totalExpensesMessage
  //               }
  //             });
  //           }

  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: "Expense not added"
  //           }
  //         });
  //       }
  //     })
  //   },
  //   get: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId
  //     };

  //     if (req.query.startDate) {
  //       payload['startDate'] = req.query.startDate;
  //     } else {
  //       payload['startDate'] = finUtils.startOfMonth();

  //     };
  //     if (req.query.endDate) {
  //       payload['endDate'] = req.query.endDate;
  //     } else {
  //       payload['endDate'] = finUtils.endOfMonth();
  //     };

  //     models.expenses.get(payload, function(allExpenses) {
  //       if (allExpenses) {
  //         res.status(200).json(allExpenses)
  //       } else {
  //         console.log("This user has no expenses to show")
  //         res.sendStatus(404)
  //       };
  //     })
  //   },
  //   patch: function(req, res) {
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //     }
  //     _.forEach(req.body, function(value, key) {
  //       if (key === "date") {
  //         payload[key] = finUtils.startOfDay(value);
  //       } else {
  //         payload[key] = value
  //       }
  //     })
  //     models.expenses.patch(payload, function(updatedExpenses, expensesMessage) {
  //       if (updatedExpenses) {
  //         if (payload.amount) {
  //           var totalToUpdate = updatedExpenses._previousDataValues.amount - payload.amount;
  //           var updateAmount = {
  //             userId: userId,
  //             type: "Expenses",
  //             amount: -totalToUpdate,
  //             totalToUpdate: totalToUpdate
  //           };
  //           models.updateTotalAmount.patch(updateAmount, function(newTotalExpenses, totalExpensesMessage) {
  //             if (newTotalExpenses) {
  //               models.current_available.patch(updateAmount, function(currentAvailable, currentAvailableMessage) {
  //                 if (currentAvailable) {
  //                   res.status(200).json({
  //                     success: true,
  //                     data: {
  //                       updatedExpenses: updatedExpenses,
  //                       newTotalExpenses: Number(newTotalExpenses.amount),
  //                       currentAvailable: Number(currentAvailable.amount),
  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: currentAvailableMessage
  //                     }
  //                   })
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalExpensesMessage
  //                 }
  //               })
  //             };
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: true,
  //             updatedExpenses: updatedExpenses
  //           });
  //         }
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: expensesMessage
  //           }
  //         });
  //       };
  //     })
  //   },
  //   delete: function(req, res) {
  //     var userId = req.headers.userId;
  //     var type = "Expenses";
  //     var payload = {
  //       type: type,
  //       id: req.body.id,
  //       userId: userId,
  //     }
  //     models.expenses.delete(payload, function(expenses, expensesMessage) {
  //       if (expenses) {
  //         var deletedAmount = {
  //           type: type,
  //           userId: userId,
  //           amount: -expenses.dataValues.amount,
  //           totalToUpdate: expenses.dataValues.amount
  //         }
  //         models.updateTotalAmount.patch(deletedAmount, function(currentTotalExpenses, currentExpensesMessage) {
  //           if (currentTotalExpenses) {
  //             models.current_available.patch(deletedAmount, function(currentAvailable, currentAvailableMessage) {
  //               if (currentAvailable) {
  //                 res.status(200).json({
  //                   success: true,
  //                   data: {
  //                     id: expenses.dataValues.id,
  //                     expensesDeleted: true,
  //                     currentTotalExpenses: Number(currentTotalExpenses.amount),
  //                     currentAvailable: Number(currentAvailable.amount),
  //                   }
  //                 })
  //               } else {
  //                 res.status(200).json({
  //                   success: false,
  //                   data: {
  //                     message: currentAvailableMessage
  //                   }
  //                 })
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: currentExpensesMessage
  //               }
  //             })
  //           };
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: expensesMessage
  //           }
  //         });
  //       }
  //     })
  //   }
  // },

  // savings: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //       data: req.body.data
  //     }
  //     var newSavingsTotal = {
  //       type: type,
  //       userId: userId,
  //       amount: 0
  //     };
  //     _.forEach(payload.data, function(amount) {
  //       amount['userId'] = req.headers.userId;
  //       amount['date'] = amount.date;
  //       newSavingsTotal.amount = newSavingsTotal.amount + amount.amount;
  //     })
  //     models.savings.post(payload, function(savingsCreated, savingsMessage) {
  //       if (savingsCreated) {
  //         models.updateTotalAmount.patch(newSavingsTotal, function(newTotalSavings, totalSavingsMessage) {
  //           if (newTotalSavings) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 savingsCreated: savingsCreated,
  //                 newTotalSavings: Number(newTotalSavings.amount),
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: totalSavingsMessage
  //               }
  //             });
  //           }
  //         })

  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: savingsMessage
  //           }
  //         });
  //       }
  //     })
  //   },
  //   patch: function(req, res) {
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //     }
  //     _.forEach(req.body, function(value, key) {
  //       if (key === "date") {
  //         payload[key] = finUtils.startOfDay(value);
  //       } else {
  //         payload[key] = value
  //       }
  //     })
  //     models.savings.patch(payload, function(updatedSavings, savingsMessage) {
  //       if (updatedSavings) {
  //         if (payload.amount) {
  //           var totalToUpdate = updatedSavings._previousDataValues.amount - payload.amount;
  //           var updateAmount = {
  //             userId: userId,
  //             type: "Savings",
  //             amount: -totalToUpdate,
  //           };
  //           models.updateTotalAmount.patch(updateAmount, function(newTotalSavings, totalSavingsMessage) {
  //             if (newTotalSavings) {
  //               res.status(200).json({
  //                 success: true,
  //                 data: {
  //                   updatedSavings: updatedSavings,
  //                   newTotalSavings: Number(newTotalSavings.amount),
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalSavingsMessage
  //                 }
  //               })
  //             }
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: true,
  //             updatedSavings: updatedSavings
  //           });
  //         }
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: savingsMessage
  //           }
  //         });
  //       };
  //     })
  //   },
  //   delete: function(req, res) {
  //     var userId = req.headers.userId;
  //     var type = "Savings";
  //     var payload = {
  //       type: type,
  //       id: req.body.id,
  //       userId: userId,
  //     }
  //     models.savings.delete(payload, function(savings, savingsMessage) {
  //       if (savings) {
  //         var deletedAmount = {
  //           type: type,
  //           userId: userId,
  //           amount: -savings.dataValues.amount
  //         }
  //         models.updateTotalAmount.patch(deletedAmount, function(currentTotalSavings, currentSavingsMessage) {
  //           if (currentTotalSavings) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 id: savings.dataValues.id,
  //                 savingsDeleted: true,
  //                 currentTotalSavings: Number(currentTotalSavings.amount),
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: currentSavingsMessage
  //               }
  //             })
  //           }
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: savingsMessage
  //           }
  //         });
  //       }
  //     })
  //   }
  // },

  // invest: {
  //   post: function(req, res) {
  //     var type = finUtils.type(req.body.type);
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //       data: req.body.data
  //     }
  //     var newInvestTotal = {
  //       type: type,
  //       userId: userId,
  //       amount: 0
  //     };
  //     _.forEach(payload.investData, function(amount) {
  //       amount['userId'] = req.headers.userId;
  //       amount['date'] = amount.date;
  //       newInvestTotal.amount = newInvestTotal.amount + amount.amount;
  //     })
  //     models.invest.post(payload, function(investCreated, investMessage) {
  //       if (investCreated) {
  //         models.updateTotalAmount.patch(newInvestTotal, function(newTotalInvest, totalInvestMessage) {
  //           if (newTotalInvest) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 investCreated: investCreated,
  //                 newTotalInvest: Number(newTotalInvest.amount),
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: totalInvestMessage
  //               }
  //             });
  //           }
  //         })

  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: investMessage
  //           }
  //         });
  //       }
  //     })
  //   },
  //   patch: function(req, res) {
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId,
  //     }
  //     _.forEach(req.body, function(value, key) {
  //       if (key === "date") {
  //         payload[key] = finUtils.startOfDay(value);
  //       } else {
  //         payload[key] = value
  //       }
  //     })
  //     models.invest.patch(payload, function(updatedInvest, investMessage) {
  //       if (updatedInvest) {
  //         if (payload.amount) {
  //           var totalToUpdate = updatedInvest._previousDataValues.amount - payload.amount;
  //           var updateAmount = {
  //             userId: userId,
  //             type: "Invest",
  //             amount: -totalToUpdate,
  //           };
  //           models.updateTotalAmount.patch(updateAmount, function(newTotalInvest, totalInvestMessage) {
  //             if (newTotalInvest) {
  //               res.status(200).json({
  //                 success: true,
  //                 data: {
  //                   updatedInvest: updatedInvest,
  //                   newTotalInvest: newTotalInvest,
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalInvestMessage
  //                 }
  //               })
  //             }
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: true,
  //             updatedInvest: updatedInvest
  //           });
  //         }
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: investMessage
  //           }
  //         });
  //       };
  //     })
  //   },
  //   delete: function(req, res) {
  //     var userId = req.headers.userId;
  //     var type = "Invest";
  //     var payload = {
  //       type: type,
  //       id: req.body.id,
  //       userId: userId,
  //     }
  //     models.invest.delete(payload, function(invest, investMessage) {
  //       if (invest) {
  //         var deletedAmount = {
  //           type: type,
  //           userId: userId,
  //           amount: -invest.dataValues.amount
  //         }
  //         models.updateTotalAmount.patch(deletedAmount, function(currentTotalInvest, currentInvestMessage) {
  //           if (currentTotalInvest) {
  //             res.status(200).json({
  //               success: true,
  //               data: {
  //                 id: invest.dataValues.id,
  //                 investDeleted: true,
  //                 currentTotalInvest: Number(currentTotalInvest.amount),
  //               }
  //             })
  //           } else {
  //             res.status(200).json({
  //               success: false,
  //               data: {
  //                 message: currentInvestMessage
  //               }
  //             })
  //           }
  //         })
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: investMessage
  //           }
  //         });
  //       }
  //     })
  //   }
  // },

  // transfer: {
  //   post: function(req, res) {
  //     var userId = req.headers.userId;

  //     var details = {
  //       amount: req.body.amount,
  //       fromType: finUtils.type(req.body.from),
  //       fromAccountId: req.body.fromAccountId,
  //       toType: finUtils.type(req.body.to),
  //       toAccountId: req.body.toAccountId,
  //       type: finUtils.type(req.body.to),
  //       comment: req.body.comment,
  //       date: req.body.date,
  //       categoryId: req.body.categoryId
  //     }

  //     //Transfer Involving Income
  //     if (details.fromType === "Income" || details.toType === "Income") {
  //       if (details.fromType === "Income") {
  //         details.model = finUtils.toLowerCase(details.type);
  //         details.toUpdate = -details.amount;
  //       } else {
  //         details.model = finUtils.toLowerCase(details.fromType);
  //         details.toUpdate = details.amount;
  //       }
  //       var payload = {
  //         userId: userId,
  //         "data": [{
  //           userId: userId,
  //           amount: details.amount,
  //           accountId: details.toAccountId,
  //           comment: details.comment,
  //           date: details.date,
  //           transferDetail: details.fromType,
  //           transferAccountId: details.fromAccountId,
  //           categoryId: details.categoryId
  //         }]
  //       }
  //       models[details.model].post(payload, function(transferCreated, transferMessage) {
  //         if (transferCreated) {
  //           var newTotalAdded = {
  //             type: details.toType,
  //             userId: userId,
  //             amount: details.amount,
  //           };
  //           if (details.fromType === "Income") {
  //             newTotalAdded.amount = 0
  //           }
  //           models.updateTotalAmount.patch(newTotalAdded, function(newTotalTo, totalAddedMessage) {
  //             if (newTotalTo) {
  //               var newTotalIncome = {
  //                 type: details.fromType,
  //                 userId: userId,
  //                 amount: -details.amount,
  //               };
  //               models.updateTotalAmount.patch(newTotalIncome, function(newTotalFrom, totalIncomeMessage) {
  //                 if (newTotalFrom) {
  //                   var currentAvailableValues = {
  //                     userId: userId,
  //                     totalToUpdate: details.toUpdate
  //                   }
  //                   models.current_available.patch(currentAvailableValues, function(currentAvailable, currentAvailableMessage) {
  //                     if (currentAvailable) {
  //                       var responseData = {
  //                         transferCreated: transferCreated,
  //                         currentAvailable: Number(currentAvailable.amount),
  //                       }
  //                       responseData['currentTotal' + details.fromType] = Number(newTotalFrom.amount);
  //                       responseData['currentTotal' + details.toType] = Number(newTotalTo.amount);
  //                       res.status(200).json({
  //                         success: true,
  //                         data: responseData
  //                       })
  //                     } else {
  //                       res.status(200).json({
  //                         success: false,
  //                         data: {
  //                           message: currentAvailableMessage
  //                         }
  //                       });
  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: totalIncomeMessage
  //                     }
  //                   });
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalAddedMessage
  //                 }
  //               });
  //             };
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: transferMessage
  //             }
  //           });
  //         }
  //       })
  //     } else {
  //       // Transfers NOT involving Income
  //       var payload = {
  //         userId: userId,
  //         "data": [{
  //           userId: userId,
  //           amount: details.amount,
  //           accountId: details.toAccountId,
  //           comment: details.comment,
  //           date: details.date,
  //           transferDetail: details.fromType,
  //           transferAccountId: details.fromAccountId,
  //           categoryId: details.categoryId
  //         }, ]
  //       }
  //       var toAddModel = finUtils.toLowerCase(details.toType);
  //       payload.data[0].amount = details.amount
  //       models[toAddModel].post(payload, function(transferAdded, transferAddedMessage) {
  //         if (transferAdded) {
  //           var newTotalAdded = {
  //             type: details.toType,
  //             userId: userId,
  //             amount: details.amount,
  //           };
  //           models.updateTotalAmount.patch(newTotalAdded, function(newTotalTo, totalAddedMessage) {
  //             if (newTotalTo) {
  //               var fromAddModel = finUtils.toLowerCase(details.fromType);
  //               payload.data[0].amount = -details.amount;
  //               models[fromAddModel].post(payload, function(transferDeduct, transferDeductMessage) {
  //                 if (transferDeduct) {
  //                   var newTotalRemoved = {
  //                     type: details.fromType,
  //                     userId: userId,
  //                     amount: -details.amount,
  //                   };
  //                   models.updateTotalAmount.patch(newTotalRemoved, function(newTotalFrom, totalRemovedMessage) {
  //                     if (newTotalFrom) {
  //                       var responseData = {};
  //                       responseData['transferAdd'] = transferAdded;
  //                       responseData['transferDeduct'] = transferDeduct;
  //                       responseData['currentTotal' + details.toType] = Number(newTotalTo.amount);
  //                       responseData['currentTotal' + details.fromType] = Number(newTotalFrom.amount);
  //                       res.status(200).json({
  //                         success: true,
  //                         data: responseData
  //                       })
  //                     } else {
  //                       res.status(200).json({
  //                         success: false,
  //                         data: {
  //                           message: totalRemovedMessage
  //                         }
  //                       });
  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: transferDeductMessage
  //                     }
  //                   });
  //                 }
  //               })

  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalAddedMessage
  //                 }
  //               });
  //             }

  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: transferAddedMessage
  //             }
  //           });
  //         }

  //       })
  //     }
  //   }
  // },

  // transfers: {
  //   post: function(req, res) {
  //     var userId = req.headers.userId;
  //     var details = {
  //       amount: req.body.amount,
  //       fromType: finUtils.type(req.body.from),
  //       fromAccountId: req.body.fromAccountId,
  //       toType: finUtils.type(req.body.to),
  //       toAccountId: req.body.toAccountId,
  //       type: finUtils.type(req.body.to),
  //       comment: req.body.comment,
  //       date: req.body.date,
  //       categoryId: req.body.categoryId
  //     }
      
  //     if (details.fromType === details.toType) {
  //       var payload = {
  //         userId: userId,
  //         "data": [{
  //           userId: userId,
  //           accountId: details.fromAccountId,
  //           comment: details.comment,
  //           date: details.date,
  //           transferDetail: details.fromType + "To" + details.toType,
  //           transferAccountId: details.fromAccountId,
  //           categoryId: details.categoryId,
  //           amount: details.amount,
  //         }]
  //       }

  //       details.model = finUtils.toLowerCase(details.fromType);
  //       payload.data[0].amount = -details.amount;
  //       console.log("+++ 1653 index.js details.model: ", details.model)
  //       console.log("+++ 1654 index.js payload: ", payload)
        
  //       models[details.model].post(payload, function(substractionCreated, substractionMessage) {
  //         if (substractionCreated) {
  //           details.model = finUtils.toLowerCase(details.toType);
  //           payload.data[0].amount = details.amount;
  //           payload.data[0].accountId = details.toAccountId;

  //           console.log("+++ 1662 index.js details.model: ", details.model)
  //           console.log("+++ 1663 index.js payload: ", payload)
  //           models[details.model].post(payload, function(additionCreated, additionMessage) {
  //             if (additionCreated) {
  //               res.status(200).json({
  //                 success: true,
  //                 data: {
  //                   substractionCreated: substractionCreated,
  //                   additionCreated: additionCreated,
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: additionMessage
  //                 }
  //               });
  //             }

  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: substractionMessage
  //             }
  //           });
  //         }

  //       })
  //       return;
  //     }
  //     console.log("+++ 1693 index.js NOT HERE")
  //     if (details.fromType === "Income" || details.toType === "Income") {
  //       var payload = {
  //         userId: userId,
  //         "data": [{
  //           userId: userId,
  //           accountId: details.toAccountId,
  //           comment: details.comment,
  //           date: details.date,
  //           transferDetail: details.fromType,
  //           transferAccountId: details.fromAccountId,
  //           categoryId: details.categoryId,
  //           amount: details.amount,
  //         }]
  //       }
  //       var newTotalAdded = {
  //         userId: userId,
  //       };
  //       if (details.fromType === "Income") {
  //         details.model = finUtils.toLowerCase(details.type);
  //         payload.data[0].amount = details.amount;
  //         newTotalAdded.type = details.type;
  //         newTotalAdded.amount = details.amount;
  //         newTotalAdded.totalToUpdate = -details.amount;
  //         var currentTotalItem = 'currentTotal' + details.type;
  //       }
  //       if (details.toType === "Income") {
  //         details.model = finUtils.toLowerCase(details.fromType);
  //         payload.data[0].amount = -details.amount;
  //         newTotalAdded.type = details.fromType;
  //         newTotalAdded.amount = -details.amount
  //         newTotalAdded.totalToUpdate = details.amount;
  //         var currentTotalItem = 'currentTotal' + details.fromType;
  //       }
  //       models[details.model].post(payload, function(transferCreated, transferMessage) {
  //         if (transferCreated) {
  //           models.updateTotalAmount.patch(newTotalAdded, function(newTotal, totalAddedMessage) {
  //             if (newTotal) {
  //               models.current_available.patch(newTotalAdded, function(currentAvailable, currentAvailableMessage) {
  //                 if (currentAvailable) {
  //                   var responseData = {
  //                     transferCreated: transferCreated,
  //                     currentAvailable: Number(currentAvailable.amount),
  //                   }
  //                   responseData[currentTotalItem] = Number(newTotal.amount);
  //                   res.status(200).json({
  //                     success: true,
  //                     data: responseData
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: currentAvailableMessage
  //                     }
  //                   });
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalAddedMessage
  //                 }
  //               });
  //             }
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: transferMessage
  //             }
  //           });
  //         }
  //       })
  //     } else {
  //       // Transfers NOT involving Income
  //       var payload = {
  //         userId: userId,
  //         "data": [{
  //           userId: userId,
  //           amount: details.amount,
  //           accountId: details.toAccountId,
  //           comment: details.comment,
  //           date: details.date,
  //           transferDetail: details.fromType,
  //           transferAccountId: details.fromAccountId,
  //           categoryId: details.categoryId
  //         }, ]
  //       }
  //       var toAddModel = finUtils.toLowerCase(details.toType);
  //       payload.data[0].amount = details.amount
  //       models[toAddModel].post(payload, function(transferAdded, transferAddedMessage) {
  //         if (transferAdded) {
  //           var newTotalAdded = {
  //             type: details.toType,
  //             userId: userId,
  //             amount: details.amount,
  //           };
  //           models.updateTotalAmount.patch(newTotalAdded, function(newTotalTo, totalAddedMessage) {
  //             if (newTotalTo) {
  //               var fromAddModel = finUtils.toLowerCase(details.fromType);
  //               payload.data[0].amount = -details.amount;
  //               models[fromAddModel].post(payload, function(transferDeduct, transferDeductMessage) {
  //                 if (transferDeduct) {
  //                   var newTotalRemoved = {
  //                     type: details.fromType,
  //                     userId: userId,
  //                     amount: -details.amount,
  //                   };
  //                   models.updateTotalAmount.patch(newTotalRemoved, function(newTotalFrom, totalRemovedMessage) {
  //                     if (newTotalFrom) {
  //                       var responseData = {};
  //                       responseData['transferAdd'] = transferAdded;
  //                       responseData['transferDeduct'] = transferDeduct;
  //                       responseData['currentTotal' + details.toType] = Number(newTotalTo.amount);
  //                       responseData['currentTotal' + details.fromType] = Number(newTotalFrom.amount);
  //                       res.status(200).json({
  //                         success: true,
  //                         data: responseData
  //                       })
  //                     } else {
  //                       res.status(200).json({
  //                         success: false,
  //                         data: {
  //                           message: totalRemovedMessage
  //                         }
  //                       });
  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: transferDeductMessage
  //                     }
  //                   });
  //                 }
  //               })

  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: totalAddedMessage
  //                 }
  //               });
  //             }

  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: transferAddedMessage
  //             }
  //           });
  //         }

  //       })
  //     }
  //   }
  // },

  // expenses_totals: {
  //   get: function(req, res) {
  //     var payload = {
  //       userId: req.headers.userId,
  //     }

  //     if (req.query.timeframe && req.query.timeframe === 'year') {
  //       payload['startDate'] = finUtils.startOfYear();
  //       payload['endDate'] = finUtils.endOfYear();
  //       payload.timeframe = req.query.timeframe;
  //     } else {
  //       payload['startDate'] = finUtils.startOfMonth();
  //       payload['endDate'] = finUtils.endOfMonth();
  //       payload.timeframe = "month";
  //     }
  //     models.expenses_totals.get(payload, function(expensesData, message) {
  //       if (expensesData) {
  //         var addedExpensesTotals = finUtils.addExpensesTotals(expensesData);
  //         var finalData = {
  //           totals: addedExpensesTotals.totals,
  //           timeframe: payload.timeframe,
  //           expensesCount: expensesData.length,
  //           totalAmount: addedExpensesTotals.totalAmount.toFixed(2),
  //         }
  //         res.status(200).json({
  //           success: true,
  //           data: finalData
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: message
  //           }
  //         });
  //       };
  //     })
  //   }
  // },

  // all_totals: {
  //   get: function(req, res) {
  //     var payload = {
  //       timeframe: "month",
  //       userId: req.headers.userId,
  //       deleted: false,
  //       startDate: finUtils.startOfMonth(),
  //       endDate: finUtils.endOfMonth()
  //     }
      
  //     if (req.query.timeframe === 'year') {
  //       payload['timeframe'] = "year";
  //       payload['startDate'] = finUtils.startOfYear();
  //       payload['endDate'] = finUtils.endOfYear();
  //     }
  //     models.all_totals.get(payload, function(results, message) {
  //       if (results) {
  //         results.primaryTotals['timeframe'] = payload.timeframe;
  //         _.forEach(finUtils.types, function (type) {
  //           if(results.user.dataValues[type.dbName]){
  //             var totals;
  //             if(type.name === "expenses"){
  //               totals = finUtils.addExpensesTotals(results.user.dataValues.expenses);
  //             } else {
  //               totals = finUtils.addAccountsTotals(results.user.dataValues[type.dbName], type.name)
  //             }
  //             results.primaryTotals[type.name + 'Totals'] = totals.totals;
  //             results.primaryTotals[type.name + 'Count'] = results.user.dataValues[type.dbName].length;
  //             results.primaryTotals['total' + type.capitalName + 'Amount'] = Number(totals.totalAmount.toFixed(2));
  //           }
  //         })
  //         res.status(200).json({
  //           success: true,
  //           data: results.primaryTotals
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: message
  //           }
  //         });
  //       }
  //     })
  //   }
  // },

  // recalculate_totals: {
  //   get: function(req, res) {
  //     var start = moment().format('HH:mm:ss:SSS')
  //     console.log("+++ recalculate_totals start time: ", start)
  //     var userId = req.headers.userId;
  //     var payload = {
  //       userId: userId
  //     }
  //     models.recalculate_totals.get(payload, function(results, resultsMessage) {
  //       if (results) {
  //         var initials = {};
  //         var subsequent = {};
  //         var transfers = {};
  //         var transfersFromIncome = {};
  //         var transfersNotFromIncome = {};
  //         _.forEach(results, function(collection, key) {
  //           subsequent[key] = 0;
  //           transfers[key] = 0;
  //           transfersFromIncome[key] = 0;
  //           transfersNotFromIncome[key] = 0;
  //           if (key !== "expenses") {
  //             initials[key] = 0;
  //           }
  //           _.forEach(collection, function(item) {
  //             if (item.dataValues.comment && item.dataValues.comment === "Initial amount added") {
  //               initials[key] = initials[key] + item.dataValues.amount;
  //               initials[key] = Number(initials[key].toFixed(2))
  //             } else {
  //               subsequent[key] = subsequent[key] + item.dataValues.amount;
  //               subsequent[key] = Number(subsequent[key].toFixed(2))
  //               if (item.dataValues.transferDetail) {
  //                 transfers[key] = transfers[key] + item.dataValues.amount;
  //                 transfers[key] = Number(transfers[key].toFixed(2))
  //               }
  //               if (item.dataValues.transferDetail === "Income") {
  //                 transfersFromIncome[key] = transfersFromIncome[key] + item.dataValues.amount;
  //                 transfersFromIncome[key] = Number(transfersFromIncome[key].toFixed(2))
  //               }

  //               if (item.dataValues.transferDetail !== "Income") {
  //                 transfersNotFromIncome[key] = transfersNotFromIncome[key] + item.dataValues.amount;
  //                 transfersNotFromIncome[key] = Number(transfersNotFromIncome[key].toFixed(2))
  //               }
  //             }
  //           })
  //         })
  //         var totalIncome = (initials.income + subsequent.income);
  //         var totalAvailable = totalIncome - subsequent.expenses - subsequent.savings - subsequent.invest;
  //         var totalSpent = subsequent.expenses;
  //         var totalSaved = initials.savings + subsequent.savings;
  //         var totalInvested = initials.invest + subsequent.invest;
  //         res.status(200).json({
  //           success: true,
  //           data: {
  //             initials: initials,
  //             subsequent: subsequent,
  //             transfers: transfers,
  //             transfersFromIncome: transfersFromIncome,
  //             transfersNotFromIncome: transfersNotFromIncome,
  //             currentTotalSavings: Number(totalSaved.toFixed(2)),
  //             currentTotalInvest: Number(totalInvested.toFixed(2)),
  //             currentTotalIncome: Number(totalIncome.toFixed(2)),
  //             currentAvailable: Number(totalAvailable.toFixed(2)),
  //             totalSpent: Number(totalSpent.toFixed(2)),
  //           }
  //         });
  //         var end = moment().format('HH:mm:ss:SSS');
  //         console.log("+++ recalculate_totals end time: ", end)
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: "Something went wrong"
  //           }
  //         });
  //       }
  //     })
  //   }
  // },
// }
