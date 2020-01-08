var models = require('../models');
var authUtils = require('../helpers/authUtils.js');
var finUtils = require('../helpers/finUtils.js');
var Promise = require('bluebird');
var db = require('../db/db.js');
var _ = require('lodash');
var moment = require('moment');

var controllers;
module.exports = controllers = {
  login: {
    get: function (req, res) {
      var payload = {
        username: req.body.username,
        password: req.body.password
      }
      models.login.post(payload, function (isUser, message) {
        if (isUser) {
          authUtils.createToken(req, res, isUser, function (token, name) {
           res.status(200).send({
            success: true,
            data: {
             username: name,
             fintrackToken: token,
             userId: isUser.dataValues.id,
             initial: isUser.dataValues.initial,
             userEmail: isUser.dataValues.email,
            }
           });
          })
        }else{
         res.status(200).json({
            success: false,
            data: {
              message: message
            }
          });
        };
      })
    }
  },

  signup: {
    post: function (req, res) {
      var payload = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }

      models.signup.post(payload, function (isUser, message) {
        if(isUser){
          authUtils.createToken(req, res, isUser, function (token, name) {
           res.status(200).json({
            success: true,
            data: {
              username: name,
              fintrackToken: token,
              userId: isUser.dataValues.id,
              initial: isUser.dataValues.initial,
              userEmail: isUser.dataValues.email,
              }
            });
          })
        }else{
          res.status(200).json({
            success: false,
            data: {
              message: message
            }
          });
        };
      })
    }
  },

  logout: {
    get: function (req, res) {
      res.status(202).json({
        success: true,
        data: {
          username: null,
          fintrackToken: null,
          userId: null
        }
      })
    }
  },

  set_initials: {
    post: function (req, res) {
      var initialData = req.body;
      
      var newIncomeCategories = {
        type: "Income",
        data: [
          {
            userId: req.headers.userId,
            name: "initial",
          }
        ]
      }

      var newIncomeAccounts = {
        Income: {
          type: "Income",
          data: [] 
        },
        Savings: {
          type: "Savings",
          data: [] 
        },
        Invest: {
          type: "Invest",
          data: [] 
        },
      }

      _.forEach(initialData, function(amounts, key) {
        _.forEach(amounts, function (amount) {
          amount['userId'] = req.headers.userId;
          amount['date'] = finUtils.unixDate(amount.date);
          newIncomeAccounts[key]['data'].push({
            userId: req.headers.userId,
            name: amount.accountName
          });
        })
      })
      var createdIncomeCategories = [];
      var newIncomeCategoriesCreated;
      var newAccountsAdded = {};
      // ADD NEW CATEGORIES
      models.categories.post(newIncomeCategories, function (categoriesAdded, categoriesMessage) {
        if(categoriesAdded){

          newIncomeCategoriesCreated = categoriesAdded[0].dataValues;

          // ADD NEW ACCOUNTS
          models.accounts.post(newIncomeAccounts.Income, function (incomeAccountsAdded, incomeAccountsMessage) {
            if(incomeAccountsAdded){
              newAccountsAdded['Income'] = incomeAccountsAdded
              models.accounts.post(newIncomeAccounts.Savings, function (savingsAccountsAdded, savingAccountsMessage) {
                if(savingsAccountsAdded){
                  newAccountsAdded['Savings'] = savingsAccountsAdded
                  models.accounts.post(newIncomeAccounts.Invest, function (investAccountsAdded, investAccountsMessage) {
                    if(investAccountsAdded){
                      newAccountsAdded['Invest'] = investAccountsAdded

                      // COMBINE CATEGORIES AND ACCOUNTS TO AMOUNTS
                      var finalInitial = {
                        Income: {
                          type: "Income",
                          data: []
                        },
                        Savings: {
                          type: "Savings",
                          data: []
                        },
                        Invest: {
                          type: "Invest",
                          data: []
                        },
                      }
                      totalAmounts = {
                        Income: {
                          type: "Income",
                          amount: 0
                        },
                        Savings: {
                          type: "Savings",
                          amount: 0
                        },
                        Invest: {
                          type: "Invest",
                          amount: 0
                        },
                      }
                      _.forEach(initialData, function (initialDataType, key) {
                        if(key === "Income"){
                          _.forEach(initialDataType, function (amount) {
                            _.forEach(newAccountsAdded.Income, function (newAccount) {
                              if(amount.accountName === newAccount.dataValues.name){
                                amount.accountId = newAccount.dataValues.id;
                                amount.categoryId = newIncomeCategoriesCreated.id;
                                finalInitial.Income.data.push(amount);
                                totalAmounts.Income.amount = totalAmounts.Income.amount + amount.amount;
                              }
                            })
                          })
                        }
                        if(key === "Savings"){
                          _.forEach(initialDataType, function (amount) {
                            _.forEach(newAccountsAdded.Savings, function (newAccount) {
                              if(amount.accountName === newAccount.dataValues.name){
                                amount.accountId = newAccount.dataValues.id;
                                amount.categoryId = newIncomeCategoriesCreated.id;
                                finalInitial.Savings.data.push(amount);
                                totalAmounts.Savings.amount = totalAmounts.Savings.amount + amount.amount;
                              }
                            })
                          })

                        }
                        if(key === "Invest"){
                          _.forEach(initialDataType, function (amount) {
                            _.forEach(newAccountsAdded.Invest, function (newAccount) {
                              if(amount.accountName === newAccount.dataValues.name){
                                amount.accountId = newAccount.dataValues.id;
                                amount.categoryId = newIncomeCategoriesCreated.id;
                                finalInitial.Invest.data.push(amount);
                                totalAmounts.Invest.amount = totalAmounts.Invest.amount + amount.amount;
                              }
                            })
                          })
                        }
                      })
                      console.log("+++ 200 index.js finalInitial: ", finalInitial)
                      console.log("+++ 218 index.js totalAmounts: ", totalAmounts)
                      // ADD INCOMES WITH CORRECT ACCOUNT AND CATEGORY IDS TO DB
                      models.bulk_add.post(finalInitial.Income, function (incomeResult, incomeMessage) {
                        if(incomeResult){
                          models.bulk_add.post(finalInitial.Savings, function (savingsResult, savingsMessage) {
                            if(savingsResult){
                              models.bulk_add.post(finalInitial.Invest, function (investResult, investMessage) {
                                if(investResult){
                                    console.log("+++ 226 index.js ALL INITIAL ITEMS ADDED")
                                    
                                } else{
                                  res.status(200).json({
                                    success: false,
                                    data: {
                                      message: "Invest " + investAccountsMessage
                                    }
                                  })
                                };
                              })
                            }else{
                              res.status(200).json({
                                success: false,
                                data: {
                                  message: "Savings " + investAccountsMessage
                                }
                              })
                            };
                          })
                        } else {
                          res.status(200).json({
                            success: false,
                            data: {
                              message: "Income " + investAccountsMessage
                            }
                          })
                        }
                      })
                      


                    } else{
                      res.status(200).json({
                        success: false,
                        data: {
                          message: "Initial " + investAccountsMessage
                        }
                      });
                    };
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: "Initial " + savingAccountsMessage
                    }
                  });
                  
                }
              })
            } else {
              res.status(200).json({
                success: false,
                data: {
                  message: "Initial " + incomeAccountsMessage
                }
              });
            }
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: "Initial " + categoriesMessage
            }
          });
        }
      })

    }
  },

  set_initials_old: {
    post: function (req, res) {
      var type = req.body.type;
      var payload = {
        type: type,
        initialAmounts: req.body.initialAmounts
      }
      _.forEach(payload.initialAmounts, function(amount) {
        amount['userId'] = req.headers.userId
        amount['date'] = moment(amount.date).startOf('day').format('x')
      })
      if(payload.initialAmounts.length > 0){
        models.set_initials.post(payload, function (initialAmountCreated) {
          if(initialAmountCreated){
            var data = {
              userId: req.headers.userId,
              type: type
            }
            models.totalAmount.get(data, function (currentTotalAmount) {
              var totalAmount = _.sumBy(initialAmountCreated, 'amount');
              newTotalData = {
                newAmount: currentTotalAmount.dataValues.amount + totalAmount,
                userId: req.headers.userId,
                type: type
              }
              models.totalAmount.patch(newTotalData, function (newTotalAmount) {
                res.status(200).json({
                    success: true,
                    data: {
                      type: type,
                      initialAmountCreated: initialAmountCreated, 
                      newTotalData: newTotalData.newAmount
                    }
                });
              })
            })
          } else {
            res.status(200).json({
              success: false,
              data: {
                message: "Initial amounts not added"
              }
            });
          }
        })
      } else{
        res.status(200).json({
          success: false,
          data: {
            message: "Initial incomes needs to exist"
          }
        });
      };
    }
  },

  initials_done: {
    post: function (req, res) {
      var data = {
        userId: req.headers.userId,
      }
      models.initials_done.post(data, function (updated) {
        if(updated){
          res.status(200).json({
              success: true,
              data: updated
            });
        } else{
          res.status(200).json({
              success: false,
              message: "User not updated"
            });
        };
      })
    }
  },

  categories: {
    get: function (req, res) {
      models.categories.get(function (allCategories) {
        res.status(200).json({
            success: true,
            data: allCategories
          });
      })
    }
  },

  income: {
    post: function (req, res) {
      var type = req.body.type;
      var payload = {
        userId: req.headers.userId,
        incomeData: req.body.incomeData
      }
      _.forEach(payload.incomeData, function(amount) {
        amount['userId'] = req.headers.userId
        amount['date'] = moment(amount.date).startOf('day').format('x')
      })
      models.income.post(payload, function (incomeCreated) {
        if(incomeCreated){
          var data = {
            userId: req.headers.userId,
            type: type
          }
          models.totalAmount.get(data, function (currentTotalAmount) {
            var totalAmount = _.sumBy(incomeCreated, 'amount');
            newTotalData = {
              newAmount: currentTotalAmount.dataValues.amount + totalAmount,
              userId: req.headers.userId,
              type: type
            }
            models.totalAmount.patch(newTotalData, function (newTotalAmount) {
              res.status(200).json({
                  success: true,
                  data: {
                    type: type,
                    incomeAdded: incomeCreated, 
                    newTotalData: newTotalData.newAmount
                  }
              });
            })
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: "Income not added"
            }
          });
        }
      })
    },
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
      }
      if(req.query.startDate){
        payload['startDate'] = moment(req.query.startDate).format('x');
      } else{
        payload['startDate'] = moment().startOf('month').format('x');
        
      };
      if(req.query.endDate){
        payload['endDate'] = moment(req.query.endDate).format('x');
      } else{
        payload['endDate'] = moment().endOf('month').format('x');
      };

      models.income.get(payload, function (userIncome) {
        if (userIncome) {
          res.status(200).json(userIncome)
        } else{
          res.status(404)
        };

      })
    },
    patch: function (req, res) {
      var payload = { 
        id: req.body.id,
      }
      _.forEach(req.body, function (value, key) {
        if(key === "date"){
          payload[key] = moment(value).startOf('day').format('x')
        } else{
          payload[key] = value
        }

      })
      models.income.patch(payload, function (updatedIncome, message) {
        if (updatedIncome) {
          console.log("+++ 260 index.js payload.amount: ", payload.amount)
          if(payload.amount){
            var updateTotalPayload = {
              userId: payload.id,
              newAmount: payload.amount,
              previousAmount: updatedIncome._previousDataValues.amount,
            }
            console.log("+++ 265 index.js updateTotalPayload: ", updateTotalPayload)
            models.updateTotalAmount.patch(updateTotalPayload, function (updatedTotal, message) {
              if(updatedTotal){
                res.status(200).json({
                  success: true,
                  data: {
                    updatedIncome: updatedIncome,
                    updatedTotal: updatedTotal
                  }
                })
              } else{
                res.status(200).json({
                  success: false,
                  data: {
                    message: message
                  }
                  
                })
              };
            })
          } else {
            res.status(200).json({
              success: true,
              data : updatedIncome
            })
          }
        }else{
          res.status(200).json({
            success: false,
            data: {
              message: message
            }
          });
        }
      })
    }
  },

  expenses: {
    post: function (req, res) {
      var type = req.body.type;
      var payload = {
        userId: req.headers.userId,
        expensesData: req.body.expensesData
      }
      _.forEach(payload.expensesData, function(amount) {
        amount['userId'] = req.headers.userId,
        amount['date'] = moment(amount.date).startOf('day').format('x')
      })
      models.expenses.post(payload, function (expensesCreated) {
        if(expensesCreated){
          // UPDATE EXPENSES TOTAL
          var data = {
            userId: req.headers.userId,
            type: type
          }
          models.totalAmount.get(data, function (currentTotalAmount) {
            var totalAmount = _.sumBy(expensesCreated, 'amount');
            var newAmount = currentTotalAmount.dataValues.amount + totalAmount
            newAmount = newAmount.toFixed(2);
            newTotalData = {
              newAmount: newAmount,
              userId: req.headers.userId,
              type: type
            }
            models.totalAmount.patch(newTotalData, function (newExpensesTotalAmount) {
              // UPDATE INCOME TOTAL
              if(newExpensesTotalAmount){
                var updatedIncomeTotal = {
                  userId: req.headers.userId,
                  type: "Income"
                }
                models.totalAmount.get(updatedIncomeTotal, function (currentIncomeTotalAmount) {
                  var newUpdatedAmount = currentIncomeTotalAmount.dataValues.amount - newAmount
                  newUpdatedAmount = newUpdatedAmount.toFixed(2);
                  var newIncomeTotalData = {
                    newAmount: newUpdatedAmount,
                    userId: req.headers.userId,
                    type: "Income"
                  }
                  models.totalAmount.patch(newIncomeTotalData, function (newIncomeTotalAmount) {
                    if(newIncomeTotalAmount){
                      res.status(200).json({
                          success: true,
                          data: {
                            type: type,
                            expensesCreated: expensesCreated, 
                            totalExpensesAdded: newTotalData.newAmount,
                            newIncomeTotalAmount: newIncomeTotalData.newAmount
                          }
                      });
                    } else{
                      res.status(200).json({
                        success: false,
                        data: {
                          message: "Something went wrong"
                        }
                      });
                    };

                  })
                })

              } else {
                res.status(200).json({
                  success: false,
                  data: {
                    message: "Something went wrong"
                  }
                });
              }
            })
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: "Expense not added"
            }
          });
        }
      })
    },
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId
      };
      models.expenses.get(payload, function (allExpenses) {
        if (allExpenses) {
          res.status(200).json(allExpenses)
        } else{
          console.log("This user has no expenses to show")
          res.sendStatus(404)
        };
      })
    },
    patch: function (req, res) {
      var payload = { 
        id: req.body.id,
        amount: req.body.amount,
        comment: req.body.comment,
        categoryId: req.body.categoryId,
        date: req.body.date,
      }
      console.log("+++ 368 index.js payload: ", payload)
      res.status(200).json({
        success: true,
      })
      // models.expenses.patch(payload, function (updatedExpense) {
      //   if (updatedExpense) {
      //     res.status(200).json(updatedExpense)
      //   }else{
      //     console.log("That expense does not exist")
      //     res.sendStatus(404)
      //   }
      // })
    }
  },

  search_specifics: {
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
        table: req.query.table,
        categoryId: req.query.categoryId,
        comment: req.query.comment,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount
      }
      if(req.query.startDate){
        payload['startDate'] = moment(req.query.startDate).format('x');
      } else{
        payload['startDate'] = moment().startOf('month').format('x');
      };
      if(req.query.endDate){
        payload['endDate'] = moment(req.query.endDate).format('x');
      } else{
        payload['endDate'] = moment().endOf('month').format('x');
      };

      models.search_specifics.get(payload, function (data) {
        if (data) {
          res.status(200).json({
            success: true,
            table: payload.table,
            data: data
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: "no data found"
            }
          });
        };

      })
    },
  },

  expenses_totals: {
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
        timeframe: "month"
      }
      if(req.query.timeframe == "year"){
        payload.timeframe = req.query.timeframe
      }
      models.expenses_totals.get(payload, function (expensesData, message) {
        if(expensesData){
          
          var addedTotals = finUtils.addTotals(expensesData);

          var finalData = {
            totals: addedTotals.totals,
            timeframe: payload.timeframe,
            expensesCount: expensesData.length,
            totalAmount: addedTotals.totalAmount.toFixed(2),
          }
          res.status(200).json({
            success: true,
            data: finalData
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: message
            }
          });
        };
      })
    }
  },

  primary_totals: {
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
        timeframe: 'month'
      }
      models.primary_totals.get(payload, function (primaryTotals, expensesData, message) {
        if(primaryTotals && expensesData){
          var addedTotals = finUtils.addTotals(expensesData);

          primaryTotals['currentMonthExpensesTotals'] = addedTotals.totals;
          primaryTotals['timeframe'] = payload.timeframe;
          primaryTotals['expensesCount'] = expensesData.length;
          primaryTotals['totalAmount'] = addedTotals.totalAmount.toFixed(2);

          res.status(200).json({
            success: true,
            data: primaryTotals
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: message
            }
          });
        };

      })
    }
  },


  ping: {
    get: function (req, res){
      res.status(200).json({
        ping: "System Working",
        headers:req.headers
      })
    }
  }
}
