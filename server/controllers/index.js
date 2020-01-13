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
      console.log("controllers: BEGIN SETTING INITIAL AMOUNTS")
      var userId = req.headers.userId;
      var initialData = req.body;
      
      var initialIncomeCategories = {
        type: "Income",
        data: {
          userId: userId,
          name: "initial",
        }
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
          amount['userId'] = userId;
          amount['date'] = finUtils.unixDate(amount.date);
          newIncomeAccounts[key]['data'].push({
            userId: userId,
            name: amount.accountName
          });
        })
      })
      var newAccountsAdded = {};
      // ADD NEW CATEGORIES
      console.log("controllers: ADD NEW CATEGORIES")
      models.categories.post(initialIncomeCategories, function (categoryAdded, categoriesMessage) {
        if(categoryAdded){
          var initialCategoryCreated = categoryAdded.dataValues;

          // ADD NEW ACCOUNTS
          console.log("controllers: ADD NEW ACCOUNTS")
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
                      console.log("controllers: COMBINE CATEGORIES AND ACCOUNTS TO AMOUNTS")
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
                          userId: userId,
                          type: "Income",
                          amount: 0
                        },
                        Savings: {
                          userId: userId,
                          type: "Savings",
                          amount: 0
                        },
                        Invest: {
                          userId: userId,
                          type: "Invest",
                          amount: 0
                        },
                      }
                      _.forEach(initialData, function (initialDataType, key) {
                        _.forEach(initialDataType, function (amount) {
                          _.forEach(newAccountsAdded[key], function (newAccount) {
                            if(amount.accountName === newAccount.dataValues.name){
                              amount.accountId = newAccount.dataValues.id;
                              amount.categoryId = initialCategoryCreated.id;
                              amount.comment = "Initial amount added";
                              finalInitial[key].data.push(amount);
                              totalAmounts[key].amount = totalAmounts[key].amount + amount.amount;
                            }
                          })
                        })
                      })
                      // ADD INCOMES WITH CORRECT ACCOUNT AND CATEGORY IDS TO DB
                      console.log("controllers: ADD INCOMES WITH CORRECT ACCOUNT AND CATEGORY IDS TO DB")
                      models.bulk_add.post(finalInitial.Income, function (incomeResult, incomeMessage) {
                        if(incomeResult){
                          models.bulk_add.post(finalInitial.Savings, function (savingsResult, savingsMessage) {
                            if(savingsResult){
                              models.bulk_add.post(finalInitial.Invest, function (investResult, investMessage) {
                                if(investResult){
                                    console.log("+++ 226 index.js ALL INITIAL ITEMS ADDED")
                                    // UPDATE CURRENT TOTALS WITH INITIAL AMOUNTS
                                    console.log("controllers: UPDATE CURRENT TOTALS WITH INITIAL AMOUNTS")
                                    models.increaseTotalAmount.patch(totalAmounts.Income, function (currentIncome, currentIncomeMessage) {
                                      if(currentIncome){
                                        models.increaseTotalAmount.patch(totalAmounts.Savings, function (currentSavings, currentSavingsMessage) {
                                          if(currentSavings){
                                            models.increaseTotalAmount.patch(totalAmounts.Invest, function (currentInvest, currentInvestMessage) {
                                              if (currentInvest) {
                                                var data = {
                                                  userId: userId
                                                }
                                                console.log("controllers: UPDATE INITIAL USER FLAG")
                                                models.initials_done.post(data, function (updated) {
                                                  if(updated){
                                                    console.log("controllers: INITIALS DONE - RETURNING DATA TO CLIENT")
                                                    res.status(200).json({
                                                      success: true,
                                                      data: {
                                                        itemsAdded: finalInitial,
                                                        currentTotalIncome: Number(currentIncome.amount), 
                                                        currentTotalSavings: Number(currentSavings.amount),
                                                        currentTotalInvest: Number(currentInvest.amount),
                                                        currentTotalExpenses: 0,
                                                      }
                                                    });
                                                  } else{
                                                    res.status(200).json({
                                                        success: false,
                                                        message: "User not updated"
                                                      });
                                                  };
                                                })
                                                
                                              } else {
                                                res.status(200).json({
                                                  success: false,
                                                  data: {
                                                    message: currentInvestMessage
                                                  }
                                                })
                                              }

                                            })
                                          } else{
                                            res.status(200).json({
                                              success: false,
                                              data: {
                                                message: currentSavingsMessage
                                              }
                                            })
                                          };
                                        })
                                      } else {
                                        res.status(200).json({
                                          success: false,
                                          data: {
                                            message: currentIncomeMessage
                                          }
                                        })
                                      }
                                    })
                                } else{
                                  res.status(200).json({
                                    success: false,
                                    data: {
                                      message: investMessage
                                    }
                                  })
                                };
                              })
                            }else{
                              res.status(200).json({
                                success: false,
                                data: {
                                  message: savingsMessage
                                }
                              })
                            };
                          })
                        } else {
                          res.status(200).json({
                            success: false,
                            data: {
                              message: incomeMessage
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

  categories_bulk: {
    post: function (req, res) {
      var type = finUtils.type(req.body.type);
      var data = req.body.newCategories;
      _.forEach(data, function (item) {
        item['userId'] = req.headers.userId;
        item['name'] = item['name'].toLowerCase();
      })
      var payload = {
        type: type,
        data: data
      };
      models.categories_bulk.post(payload, function (categoriesAdded, categoriesMessage) {
        if(categoriesAdded){
          res.status(200).json({
              success: true,
              data: {
                type: type,
                categoriesAdded: categoriesAdded
              }
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: categoriesMessage
            }
          });
        };
      })
    },
  },

  categories: {
    post: function (req, res) {
      var type = finUtils.type(req.body.type);
      var data = req.body.newCategories;
      _.forEach(data, function (item) {
        item['userId'] = req.headers.userId;
        item['name'] = item['name'].toLowerCase();
      })
      var payload = {
        type: type,
        data: data
      };
      console.log("+++ 347 index.js payload: ", payload)
      models.categories.post(payload, function (categoriesAdded, categoriesMessage) {
        if(categoriesAdded){
          res.status(200).json({
              success: true,
              data: {
                type: type,
                categoriesAdded: categoriesAdded
              }
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: categoriesMessage
            }
          });
        };
      })
    },

    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
      }
      models.categories.get(payload, function (allCategories, categoriesMessage) {
        if(allCategories){
          res.status(200).json({
              success: true,
              data: {
                expensesCategories: allCategories.expensescategories,
                incomeCategories: allCategories.incomecategories
              }
            });
        } else{
          res.status(200).json({
              success: false,
              data: {
                message: categoriesMessage
              }
            });
        };
      })
    },

    patch: function (req, res) {
      var payload = {
        userId: req.headers.userId,
        type: finUtils.type(req.body.type),
        name: req.body.name,
        id: req.body.id,
      };
      models.categories.patch(payload, function (categoriesAdded, categoriesMessage) {
        if (categoriesAdded) {
          res.status(200).json({
              success: true,
              data: categoriesAdded
            });
        } else {
          res.status(200).json({
              success: false,
              data: {
                message: categoriesMessage
              }
            });
        }

      })
    }
  },

  income: {
    post: function (req, res) {
      var userId = req.headers.userId;
      var type = finUtils.type(req.body.type);
      var payload = {
        type: type,
        data: req.body.incomeData
      }
      totalAmounts = {
        userId: userId,
        type: type,
        amount: 0
      };
      _.forEach(payload.data, function(amount) {
        amount['userId'] = userId;
        amount['date'] = finUtils.unixDate(amount.date);
        totalAmounts['amount'] = totalAmounts['amount'] + amount.amount;
      })
      models.bulk_add.post(payload, function (amountCreated, bulkMessage) {
        if(amountCreated){
          models.increaseTotalAmount.patch(totalAmounts, function (currentTotal, currentIncomeMessage) {
            if(currentTotal){
              res.status(200).json({
                success: true,
                data: {
                  amountCreated: amountCreated,
                  currentIncome: Number(currentTotal.amount),
                }
              })
            } else{
              res.status(200).json({
                success: false,
                data: {
                  message: currentIncomeMessage
                }
              })
            };
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: bulkMessage
            }
            
          })
        }
      })
    },
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
      }
      if(req.query.startDate){
        payload['startDate'] = finUtils.unixDate(req.query.startDate);
      } else{
        payload['startDate'] = finUtils.startOfMonth();
        
      };
      if(req.query.endDate){
        payload['endDate'] = finUtils.unixDate(req.query.endDate);
      } else{
        payload['endDate'] = finUtils.endOfMonth();
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
          payload[key] = finUtils.startOfDay(value);
        } else{
          payload[key] = value
        }

      })
      models.income.patch(payload, function (updatedIncome, message) {
        if (updatedIncome) {
          if(payload.amount){
            var updateTotalPayload = {
              userId: payload.id,
              newAmount: payload.amount,
              previousAmount: updatedIncome._previousDataValues.amount,
            }
            models.updateTotalIncome.patch(updateTotalPayload, function (updatedTotal, message) {
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
      var type = finUtils.type(req.body.type);
      var userId = req.headers.userId;
      var payload = {
        userId: userId,
        expensesData: req.body.expensesData
      }
      var newExpensesTotal = {
        type: type,
        userId: userId,
        amount: 0
      };
      _.forEach(payload.expensesData, function(amount) {
        amount['userId'] = req.headers.userId;
        amount['date'] = finUtils.unixDate(amount.date);
        newExpensesTotal.amount = newExpensesTotal.amount + amount.amount;
      })
      models.expenses.post(payload, function (expensesCreated) {
        if(expensesCreated){
          // UPDATE EXPENSES TOTAL
          models.increaseTotalAmount.patch(newExpensesTotal, function (newTotalExpenses, totalExpensesMessage) {
            if(newTotalExpenses){
              models.updateTotalIncomeAfterExpenses.patch(newExpensesTotal, function (newTotalIncome, totalIncomeMessage) {
                if(newTotalIncome){
                  res.status(200).json({
                    success: true,
                    data: {
                      expensesCreated: expensesCreated,
                      newTotalExpenses: Number(newTotalExpenses.amount),
                      newTotalIncome: Number(newTotalIncome.amount),
                    }
                  });
                } else{
                  res.status(200).json({
                    success: false,
                    data: {
                      message: totalIncomeMessage
                    }
                  });
                };
              })
            } else {
              res.status(200).json({
                success: false,
                data: {
                  message: totalExpensesMessage
                }
              });
            }

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
      // res.status(200).json({
      //   success: true,
      // })
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
      var type = finUtils.type(req.query.type);
      var payload = {
        userId: req.headers.userId,
        type: type,
        categoryId: req.query.categoryId,
        comment: req.query.comment,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount,
        deleted: false,
        include: [],
      }
      if(req.query.deleted){
        payload.deleted = true;
      }
      if(req.query.startDate){
        payload['startDate'] = finUtils.unixDate(req.query.startDate)
      } else{
        payload['startDate'] = finUtils.startOfMonth();
      };
      if(req.query.endDate){
        payload['endDate'] = finUtils.unixDate(req.query.endDate);
      } else{
        payload['endDate'] = finUtils.endOfMonth();
      };

      if(type === "Income" || type === "Expenses"){
        var categoryModel = type + "Category"
        payload.include.push({
          model: db[categoryModel], 
          attributes: ['name'],
        })
      }
      if(type === "Income" || type === "Savings" || type === "Invest"){
        var accountModel = type + "Account";
        payload.include.push({
          model: db[accountModel], 
          attributes: ['name'],
        })
      }
      
      models.search_specifics.get(payload, function (foundResults, message) {
        if (foundResults) {
          var finalData  = [];

          _.forEach(foundResults, function (found) {
            var lowerType = finUtils.lowerType(payload.type);
            var item = {
              id: found.id,
              amount: found.amount,
              comment: found.comment,
              categoryId: found.categoryId,
              accountId: found.accountId,
              date: finUtils.readableDate(found.date),
              deleted: found.deleted,
              createdAt: found.createdAt,
              updatedAt: found.updatedAt,
              userId: found.userId,
            }
            if(type === "Income" || type === "Expenses"){
              var category = lowerType + "category";
              var addCategory = lowerType + "Category";
              item[addCategory] = found[category].name
            }
            if(type === "Income" || type === "Savings" || type === "Invest"){
                var account = lowerType + "account";
                var addAccount = lowerType + "Account";
                item[addAccount] = found[account].name
            }
            finalData.push(item)
          })

          res.status(200).json({
            success: true,
            type: payload.type,
            data: finalData,
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

  // TEST PING
  ping: {
    get: function (req, res){
      res.status(200).json({
        ping: "System Working",
        headers:req.headers
      })
    }
  },

  test: {
    get: (function (req, res) {
      payload = {
        userId: 1,
      }
      models.test.get(payload, function (foundData, message) {
        if(foundData){
          res.status(200).json({found: foundData})
        } else {
          res.status(200).json({message: message})
        }
      })
    })
  }


}
