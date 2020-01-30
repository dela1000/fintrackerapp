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
      var userId = req.headers.userId;
      var initialData = req.body;
      //Check that user has not set his initials yet.
      var userData = {
        userId: userId
      }
      models.get_user.get(userData, function (user, getUserMessage) {
        if(user) {
          if(!user.dataValues.initials_done){
            console.log("controllers: BEGIN SETTING INITIAL AMOUNTS")
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
            //if initials_done is false continue
            // ADD NEW CATEGORIES
            console.log("controllers: ADD NEW CATEGORIES")
            models.categories.post(initialIncomeCategories, function (categoryAdded, categoriesMessage) {
              if(categoryAdded){
                var initialCategoryCreated = categoryAdded.dataValues;
                // ADD NEW ACCOUNTS
                console.log("controllers: ADD NEW ACCOUNTS")
                var newAccountsAdded = {};
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
                                          models.updateTotalAmount.patch(totalAmounts.Income, function (currentIncome, currentIncomeMessage) {
                                            if(currentIncome){
                                              models.updateTotalAmount.patch(totalAmounts.Savings, function (currentSavings, currentSavingsMessage) {
                                                if(currentSavings){
                                                  models.updateTotalAmount.patch(totalAmounts.Invest, function (currentInvest, currentInvestMessage) {
                                                    if (currentInvest) {
                                                      var currentAvailableValues = {
                                                        userId: userId,
                                                        totalToUpdate: Number(currentIncome.amount)
                                                      }
                                                      console.log("controllers: UPDATE CURRENT AVAILABLE")
                                                      models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                                                        if (currentAvailable) {
                                                          console.log("controllers: UPDATE INITIAL USER FLAG")
                                                          models.initials_done.post(userData, function (updated, userInitialsMessage) {
                                                            if(updated){
                                                              console.log("controllers: INITIALS DONE - RETURNING DATA TO CLIENT")
                                                              res.status(200).json({
                                                                success: true,
                                                                data: {
                                                                  itemsAdded: finalInitial,
                                                                  currentTotalIncome: Number(currentIncome.amount), 
                                                                  currentTotalSavings: Number(currentSavings.amount),
                                                                  currentTotalInvest: Number(currentInvest.amount),
                                                                  currentAvailable:  Number(currentAvailable.amount),
                                                                  currentTotalExpenses: 0,
                                                                }
                                                              });
                                                            } else{
                                                              res.status(200).json({
                                                                success: false,
                                                                data: {
                                                                  message: userInitialsMessage
                                                                }
                                                              })
                                                            };
                                                          })
                                                        } else {
                                                          res.status(200).json({
                                                            success: false,
                                                            data: {
                                                              message: currentAvailableMessage
                                                            }
                                                          })
                                                        }
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
          } else{
            res.status(200).json({
              success: false,
              data: {
                message: "User Initials already setup"
              }
            })
          };
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: getUserMessage
            }
          })
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
      var data = req.body.newCategory;
      data['userId'] = req.headers.userId;
      var payload = {
        type: type,
        data: data
      };
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
      var totalAmounts = {
        userId: userId,
        type: type,
        amount: 0
      };
      _.forEach(payload.data, function(amount) {
        amount['userId'] = userId;
        amount['date'] = finUtils.unixDate(amount.date);
        totalAmounts['amount'] = totalAmounts['amount'] + amount.amount;
      })
      models.bulk_add.post(payload, function (amountsCreated, bulkMessage) {
        if(amountsCreated){
          models.updateTotalAmount.patch(totalAmounts, function (currentTotalIncome, currentIncomeMessage) {
            if(currentTotalIncome){
              var currentAvailableValues = {
                userId: userId,
                totalToUpdate: totalAmounts['amount']
              }
              models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                if (currentAvailable) {
                  res.status(200).json({
                    success: true,
                    data: {
                      amountsCreated: amountsCreated,
                      currentTotalIncome: Number(currentTotalIncome.amount),
                      currentAvailable: Number(currentAvailable.amount),
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: currentAvailableMessage
                    }
                  })
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
        userId: req.headers.userId,
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
            var amount = updatedIncome._previousDataValues.amount - payload.amount;
            var updateTotalPayload = {
              type: "Income",
              userId: payload.userId,
              amount: -amount
            }
            models.updateTotalAmount.patch(updateTotalPayload, function (updatedTotal, patchMessage) {
              if(updatedTotal){
                res.status(200).json({
                  success: true,
                  data: {
                    updatedIncome: updatedIncome,
                    updatedTotal: Number(updatedTotal.amount)
                  }
                })
              } else{
                res.status(200).json({
                  success: false,
                  data: {
                    message: patchMessage
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
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var type = "Income";
      var payload = {
        type: type,
        id: req.body.id,
        userId: userId,
      }
      models.income.delete(payload, function (income, incomeMessage) {
        if (income) {
          var deletedAmount = {
            type: type,
            userId: userId,
            amount: -income.dataValues.amount
          }
          models.updateTotalAmount.patch(deletedAmount, function (currentTotalIncome, currentIncomeMessage) {
            if(currentTotalIncome){
              var currentAvailableValues = {
                userId: userId,
                totalToUpdate: -income.dataValues.amount
              }
              models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                if (currentAvailable) {
                  res.status(200).json({
                    success: true,
                    data: {
                      id: income.dataValues.id,
                      incomeDeleted: true,
                      currentTotalIncome: Number(currentTotalIncome.amount),
                      currentAvailable: Number(currentAvailable.amount),
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: currentAvailableMessage
                    }
                  })
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
              message: incomeMessage
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
          models.updateTotalAmount.patch(newExpensesTotal, function (newTotalExpenses, totalExpensesMessage) {
            if(newTotalExpenses){
              var currentAvailableValues = {
                userId: userId,
                totalToUpdate: -newExpensesTotal.amount
              }
              models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                if (currentAvailable) {
                  res.status(200).json({
                    success: true,
                    data: {
                      expensesCreated: expensesCreated,
                      newTotalExpenses: Number(newTotalExpenses.amount),
                      currentAvailable: Number(currentAvailable.amount),
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: currentAvailableMessage
                    }
                  })
                }
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
      var userId = req.headers.userId;
      var payload = { 
        userId: userId,
      }
      _.forEach(req.body, function (value, key) {
        if(key === "date"){
          payload[key] = finUtils.startOfDay(value);
        } else{
          payload[key] = value
        }
      })
      models.expenses.patch(payload, function (updatedExpenses, expensesMessage) {
        if (updatedExpenses) {
          if(payload.amount){
            var totalToUpdate = updatedExpenses._previousDataValues.amount - payload.amount;
            var currentAvailableValues = {
              userId: userId,
              totalToUpdate: totalToUpdate
            }
            models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
              if (currentAvailable) {
                res.status(200).json({
                  success: true,
                  data: {
                    updatedExpenses: updatedExpenses,
                    currentAvailable: Number(currentAvailable.amount),
                  }
                })
              } else {
                res.status(200).json({
                  success: false,
                  data: {
                    message: currentAvailableMessage
                  }
                })
              }
            })
          } else {
            res.status(200).json({
              success: true,
              updatedExpenses: updatedExpenses
            });
          }
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: expensesMessage
            }
          });
        };
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var type = "Expenses";
      var payload = {
        type: type,
        id: req.body.id,
        userId: userId,
      }
      models.expenses.delete(payload, function (expenses, expensesMessage) {
        if (expenses) {
          var deletedAmount = {
            type: type,
            userId: userId,
            amount: -expenses.dataValues.amount
          }
          models.updateTotalAmount.patch(deletedAmount, function (currentTotalExpenses, currentExpensesMessage) {
            if(currentTotalExpenses){
              var currentAvailableValues = {
                userId: userId,
                totalToUpdate: -expenses.dataValues.amount
              }
              models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                if (currentAvailable) {
                  res.status(200).json({
                    success: true,
                    data: {
                      id: expenses.dataValues.id,
                      expensesDeleted: true,
                      currentTotalExpenses: Number(currentTotalExpenses.amount),
                      currentAvailable: Number(currentAvailable.amount),
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: currentAvailableMessage
                    }
                  })
                }
              })
            } else{
              res.status(200).json({
                success: false,
                data: {
                  message: currentExpensesMessage
                }
              })
            };
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: expensesMessage
            }
          });
        }
      })
    }
  },

  savings: {
    post: function (req, res) {
      var type = finUtils.type(req.body.type);
      var userId = req.headers.userId;
      var payload = {
        userId: userId,
        savingsData: req.body.savingsData
      }
      var newSavingsTotal = {
        type: type,
        userId: userId,
        amount: 0
      };
      _.forEach(payload.savingsData, function(amount) {
        amount['userId'] = req.headers.userId;
        amount['date'] = finUtils.unixDate(amount.date);
        newSavingsTotal.amount = newSavingsTotal.amount + amount.amount;
      })
      models.savings.post(payload, function (savingsCreated, savingsMessage) {
        if (savingsCreated) {
          models.updateTotalAmount.patch(newSavingsTotal, function (newTotalSavings, totalSavingsMessage){
            if (newTotalSavings) {
              var newIncomeTotal = {
                type: "Income",
                userId: userId,
                amount: -newSavingsTotal.amount
              }
              models.updateTotalAmount.patch(newIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                if (newTotalIncome) {
                  var currentAvailableValues = {
                    userId: userId,
                    totalToUpdate: -newSavingsTotal.amount
                  }
                  models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                    if (currentAvailable) {
                      res.status(200).json({
                        success: true,
                        data: {
                          savingsCreated: savingsCreated,
                          newTotalSavings: Number(newTotalSavings.amount),
                          newTotalIncome: Number(newTotalIncome.amount),
                          currentAvailable: Number(currentAvailable.amount)
                        }
                      })
                      
                    } else {
                      res.status(200).json({
                        success: false,
                        data: {
                          message: totalIncomeMessage
                        }
                      });
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: totalIncomeMessage
                    }
                  });
                }
              })
            } else {
              res.status(200).json({
                success: false,
                data: {
                  message: totalSavingsMessage
                }
              });
            }
          })
          
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: savingsMessage
            }
          });
        }
      })
    },
    patch: function (req, res) {
      var userId = req.headers.userId;
      var payload = { 
        userId: userId,
      }
      _.forEach(req.body, function (value, key) {
        if(key === "date"){
          payload[key] = finUtils.startOfDay(value);
        } else{
          payload[key] = value
        }
      })
      models.savings.patch(payload, function (updatedSavings, savingsMessage) {
        if (updatedSavings) {
          if(payload.amount){
            var totalToUpdate = updatedSavings._previousDataValues.amount - payload.amount;
            var updateAmount = {
              userId: userId,
              type: "Savings",
              amount: -totalToUpdate,
            };
            models.updateTotalAmount.patch(updateAmount, function (newTotalSavings, totalSavingsMessage){
              if (newTotalSavings) {
                var updateIncomeTotal = {
                  userId: userId,
                  type: "Income",
                  amount: totalToUpdate,
                };
                models.updateTotalAmount.patch(updateIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                  if (newTotalIncome) {
                    var currentAvailableValues = {
                      userId: userId,
                      type: "Savings",
                      totalToUpdate: totalToUpdate
                    }
                    models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                      if (currentAvailable) {
                        res.status(200).json({
                          success: true,
                          data: {
                            newTotalSavings: newTotalSavings,
                            newTotalIncome: Number(newTotalIncome.amount),
                            currentAvailable: Number(currentAvailable.amount)
                          }
                        })
                        
                      } else {
                        res.status(200).json({
                          success: false,
                          data: {
                            message: currentAvailableMessage
                          }
                        })
                      }
                    })
                  } else {
                    res.status(200).json({
                      success: false,
                      data: {
                        message: totalIncomeMessage
                      }
                    })
                  }

                })
              } else {
                res.status(200).json({
                  success: false,
                  data: {
                    message: totalSavingsMessage
                  }
                })
              }
            })
          } else {
            res.status(200).json({
              success: true,
              updatedSavings: updatedSavings
            });
          }
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: savingsMessage
            }
          });
        };
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var type = "Savings";
      var payload = {
        type: type,
        id: req.body.id,
        userId: userId,
      }
      models.savings.delete(payload, function (savings, savingsMessage) {
        if(savings){
          var deletedAmount = {
            type: type,
            userId: userId,
            amount: -savings.dataValues.amount
          }
          models.updateTotalAmount.patch(deletedAmount, function (currentTotalSavings, currentSavingsMessage) {
            if (currentTotalSavings) {
              var newIncomeTotal = {
                type: "Income",
                userId: userId,
                amount: savings.amount
              }
              models.updateTotalAmount.patch(newIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                if (newTotalIncome) {
                  var currentAvailableValues = {
                    userId: userId,
                    type: "Savings",
                    totalToUpdate: savings.amount
                  }
                  models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                    if (currentAvailable) {
                      res.status(200).json({
                        success: true,
                        data: {
                          id: savings.dataValues.id,
                          savingsDeleted: true,
                          currentTotalSavings: Number(currentTotalSavings.amount),
                          newTotalIncome: Number(newTotalIncome.amount),
                          currentAvailable: Number(currentAvailable.amount)
                        }
                      })
                    } else {
                      res.status(200).json({
                        success: false,
                        data: {
                          message: currentAvailableMessage
                        }
                      })
                    }

                  })
                  
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: totalIncomeMessage
                    }
                  });
                }
              })
            } else {
              res.status(200).json({
                success: false,
                data: {
                  message: currentSavingsMessage
                }
              })
            }
          })
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: savingsMessage
            }
          });
        }
      })
    }
  },

  invest: {
    post: function (req, res) {
      var type = finUtils.type(req.body.type);
      var userId = req.headers.userId;
      var payload = {
        userId: userId,
        investData: req.body.investData
      }
      var newInvestTotal = {
        type: type,
        userId: userId,
        amount: 0
      };
      _.forEach(payload.investData, function(amount) {
        amount['userId'] = req.headers.userId;
        amount['date'] = finUtils.unixDate(amount.date);
        newInvestTotal.amount = newInvestTotal.amount + amount.amount;
      })
      models.invest.post(payload, function (investCreated, investMessage) {
        if (investCreated) {
          models.updateTotalAmount.patch(newInvestTotal, function (newTotalInvest, totalInvestMessage){
            if (newTotalInvest) {
              var newIncomeTotal = {
                type: "Income",
                userId: userId,
                amount: -newInvestTotal.amount
              }
              models.updateTotalAmount.patch(newIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                if (newTotalIncome) {
                  var currentAvailableValues = {
                    userId: userId,
                    totalToUpdate: -newInvestTotal.amount
                  }
                  models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                    if (currentAvailable) {
                      res.status(200).json({
                        success: true,
                        data: {
                          investCreated: investCreated,
                          newTotalInvest: Number(newTotalInvest.amount),
                          newTotalIncome: Number(newTotalIncome.amount),
                          currentAvailable: Number(currentAvailable.amount)
                        }
                      })
                      
                    } else {
                      res.status(200).json({
                        success: false,
                        data: {
                          message: totalIncomeMessage
                        }
                      });
                    }
                  })
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: totalIncomeMessage
                    }
                  });
                }
              })
            } else {
              res.status(200).json({
                success: false,
                data: {
                  message: totalInvestMessage
                }
              });
            }
          })
          
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: investMessage
            }
          });
        }
      })
    },
    patch: function (req, res) {
      var userId = req.headers.userId;
      var payload = { 
        userId: userId,
      }
      _.forEach(req.body, function (value, key) {
        if(key === "date"){
          payload[key] = finUtils.startOfDay(value);
        } else{
          payload[key] = value
        }
      })
      models.invest.patch(payload, function (updatedInvest, investMessage) {
        if (updatedInvest) {
          if(payload.amount){
            var totalToUpdate = updatedInvest._previousDataValues.amount - payload.amount;
            var updateAmount = {
              userId: userId,
              type: "Invest",
              amount: -totalToUpdate,
            };
            models.updateTotalAmount.patch(updateAmount, function (newTotalInvest, totalInvestMessage){
              if (newTotalInvest) {
                var updateIncomeTotal = {
                  userId: userId,
                  type: "Income",
                  amount: totalToUpdate,
                };
                models.updateTotalAmount.patch(updateIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                  if (newTotalIncome) {
                    var currentAvailableValues = {
                      userId: userId,
                      totalToUpdate: totalToUpdate
                    }
                    console.log("+++ 1271 index.js currentAvailableValues: ", currentAvailableValues)
                    models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                      if (currentAvailable) {
                        res.status(200).json({
                          success: true,
                          data: {
                            newTotalInvest: newTotalInvest,
                            newTotalIncome: Number(newTotalIncome.amount),
                            currentAvailable: Number(currentAvailable.amount)
                          }
                        })
                        
                      } else {
                        res.status(200).json({
                          success: false,
                          data: {
                            message: currentAvailableMessage
                          }
                        })
                      }
                    })
                  } else {
                    res.status(200).json({
                      success: false,
                      data: {
                        message: totalIncomeMessage
                      }
                    })
                  }

                })
              } else {
                res.status(200).json({
                  success: false,
                  data: {
                    message: totalInvestMessage
                  }
                })
              }
            })
          } else {
            res.status(200).json({
              success: true,
              updatedInvest: updatedInvest
            });
          }
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: investMessage
            }
          });
        };
      })
    },
    delete: function (req, res) {
      var userId = req.headers.userId;
      var type = "Invest";
      var payload = {
        type: type,
        id: req.body.id,
        userId: userId,
      }
      models.invest.delete(payload, function (invest, investMessage) {
        if(invest){
          var deletedAmount = {
            type: type,
            userId: userId,
            amount: -invest.dataValues.amount
          }
          models.updateTotalAmount.patch(deletedAmount, function (currentTotalInvest, currentInvestMessage) {
            if (currentTotalInvest) {
              var newIncomeTotal = {
                type: "Income",
                userId: userId,
                amount: invest.amount
              }
              models.updateTotalAmount.patch(newIncomeTotal, function (newTotalIncome, totalIncomeMessage){
                if (newTotalIncome) {
                  var currentAvailableValues = {
                    userId: userId,
                    type: "Invest",
                    totalToUpdate: invest.amount
                  }
                  models.updateCurrentAvailable.patch(currentAvailableValues, function (currentAvailable, currentAvailableMessage) {
                    if (currentAvailable) {
                      res.status(200).json({
                        success: true,
                        data: {
                          id: invest.dataValues.id,
                          investDeleted: true,
                          currentTotalInvest: Number(currentTotalInvest.amount),
                          newTotalIncome: Number(newTotalIncome.amount),
                          currentAvailable: Number(currentAvailable.amount)
                        }
                      })
                    } else {
                      res.status(200).json({
                        success: false,
                        data: {
                          message: currentAvailableMessage
                        }
                      })
                    }

                  })
                  
                } else {
                  res.status(200).json({
                    success: false,
                    data: {
                      message: totalIncomeMessage
                    }
                  });
                }
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
        } else {
          res.status(200).json({
            success: false,
            data: {
              message: investMessage
            }
          });
        }
      })
    }
  },

  search_specifics: {
    get: function (req, res) {
      var type = finUtils.type(req.query.type);
      var payload = {
        userId: req.headers.userId,
        type: type,
        deleted: false,
        include: [],
        orderBy: "date",
        order: "DESC"
      }

      if(req.query.categoryId){
        if(type === "Income" || type === "Expenses"){
          payload.categoryId = req.query.categoryId;
        }
      }
      if(req.query.comment){
        payload.comment = req.query.comment
      }
      if(req.query.minAmount){
        payload.minAmount = req.query.minAmount
      }
      if(req.query.maxAmount){
        payload.maxAmount = req.query.maxAmount
      }
      if(req.query.deleted){
        payload.deleted = true;
      };
      if(req.query.limit){
        payload.limit = Number(req.query.limit);
      };
      if(req.query.orderBy){
        payload.orderBy = req.query.orderBy;
      };
      if(req.query.order){
        payload.order = req.query.order;
      };
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
      
      if(req.query.timeframe && req.query.timeframe === 'year'){
        payload['startDate'] = finUtils.startOfYear();
        payload['endDate'] = finUtils.endOfYear();
      }

      if(req.query.timeframe && req.query.timeframe === 'month'){
        payload['startDate'] = finUtils.startOfMonth();
        payload['endDate'] = finUtils.endOfMonth();
      }

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
          var finalData = [];
          _.forEach(foundResults, function (found) {
            var lowerType = finUtils.toLowerCase(payload.type);
            item = {};
            _.forEach(found.dataValues, function (value, key) {
              if(key === "date") {
                value = finUtils.readableDate(value)
              }
              item[key] = value
            })
            if(type === "Income" || type === "Expenses"){
              var category = lowerType + "category";
              var addCategory = lowerType + "Category";
              item[addCategory] = found[category].name;
              delete item[category];
            }
            if(type === "Income" || type === "Savings" || type === "Invest"){
                var account = lowerType + "account";
                var addAccount = lowerType + "Account";
                item[addAccount] = found[account].name;
                delete item[account];
            }
            finalData.push(item)
          })
          var totalAmountFound = 0;
          if(finalData.length > 0){
            _.forEach(finalData, function (item) {
              totalAmountFound = totalAmountFound + item.amount;
            })
          }

          res.status(200).json({
            success: true,
            type: payload.type,
            data: {
              results: finalData,
              totalFound: finalData.length,
              totalAmountFound: totalAmountFound,
              queryLimit: payload.limit
            },
          });
        } else{
          res.status(200).json({
            success: false,
            data: {
              message: message,
              totalFound: 0,
              queryLimit: payload.limit || "not set"
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

  all_totals: {
    get: function (req, res) {
      var payload = {
        userId: req.headers.userId,
        timeframe: 'month'
      }
      if(req.query.timeframe == "year"){
        payload.timeframe = req.query.timeframe
      }
      models.all_totals.get(payload, function (primaryTotals, expensesData, message) {
        if(primaryTotals && expensesData){
          var addedTotals = finUtils.addTotals(expensesData);

          primaryTotals['currentMonthExpensesTotals'] = addedTotals.totals;
          primaryTotals['timeframe'] = payload.timeframe;
          primaryTotals['expensesCount'] = expensesData.length;
          primaryTotals['totalExpensesAmount'] = Number(addedTotals.totalAmount.toFixed(2));

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

  recalculate_totals: {
    get: function (req, res) {
      var start = moment().format('LTS')
      console.log("+++ 1647 index.js start: ", start)
      var userId = req.headers.userId;
      var payload = {
        userId: userId
      }
      models.recalculate_totals.get(payload, function (results, resultsMessage) {
        var subsequent = {};
        var initials = {};
        _.forEach(results, function (collection, key) {
          subsequent[key] = 0;
          if (key !== "expenses") {
            initials[key] = 0;
          }
          _.forEach(collection, function (item) {
            if(item.dataValues.comment && item.dataValues.comment === "Initial amount added"){
              initials[key] = initials[key] + item.dataValues.amount;
              initials[key] = Number(initials[key].toFixed(2))
            } else {
              subsequent[key] = subsequent[key] + item.dataValues.amount;
              subsequent[key] = Number(subsequent[key].toFixed(2))
            }
          })
        })
        
        var totalIncome = initials.income + subsequent.income;
        totalIncome = Number(totalIncome.toFixed(2))
        var totalAvailable = totalIncome - subsequent.expenses - subsequent.savings - subsequent.invest;
        totalAvailable = Number(totalAvailable.toFixed(2))
        var totalUsed = subsequent.expenses + subsequent.savings + subsequent.invest;
        totalUsed  = Number(totalUsed.toFixed(2))
        var end = moment().format('LTS');
        console.log("+++ 1678 index.js end: ", end)
        res.status(200).json({
          success: true,
          data: {
            initials: initials,
            subsequent: subsequent,
            totalIncome: totalIncome,
            totalUsed: totalUsed,
            totalAvailable: totalAvailable
          }
        });
      })
    }
  },

  // TEST PING
  ping: {
    get: function (req, res){
      models.ping.get(function (data) {
        var finDB = "NOT PRESENT";
        if(data){
          _.forEach(data, function (db) {
            if(db.Database === "fin"){
              finDB = "DB PRESENT AND WORKING: " + db.Database;
            }
          })
          res.status(200).json({
            success: true,
            data: {
              ping: "API WORKING",
              finDB: finDB,
              headers:req.headers
            }
          })
        } else{
          res.status(200).json({
            success: false,
            data: {
              ping: "API WORKING",
              finDB: finDB,
              headers:req.headers
            }
          })
        };
      })
    }
  },


}
