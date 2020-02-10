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
    get: function(req, res) {
      var payload = {
        username: req.body.username,
        password: req.body.password
      }
      models.login.post(payload, function(isUser, message) {
        if (isUser) {
          authUtils.createToken(req, res, isUser, function(token) {
            var data = {
              fintrackToken: token,
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

      models.signup.post(payload, function(isUser, message) {
        if (isUser) {
          authUtils.createToken(req, res, isUser, function(token, name) {
            var data = {
              username: name,
              fintrackToken: token,
              userId: isUser.dataValues.id,
              initial: isUser.dataValues.initial,
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
      res.status(200).json({
        success: true,
        data: {
          username: null,
          fintrackToken: null,
          userId: null
        }
      })
    }
  },

  // TEST PING
  ping: {
    get: function(req, res) {
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
                        models.updateCurrentAvailable.patch(userData, function(availableTotal, availableMessage) {
                          if (availableTotal) {
                            var data = {
                              fundsAdded: lineItems,
                              accountsAdded: accountsAdded,
                              availableTotal: Number(availableTotal.amount),
                            }
                            successResponse(res, data)
                          } else {
                            failedResponse(res, availableMessage)
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
  }
}

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

  // set_initials: {
  //   post: function(req, res) {
  //     var userId = req.headers.userId;
  //     var initialData = req.body;
  //     //Check that user has not set his initials yet.
  //     var userData = {
  //       userId: userId
  //     }
  //     models.get_user.get(userData, function(user, getUserMessage) {
  //       if (user) {
  //         if (!user.dataValues.initials_done) {
  //           console.log("controllers: BEGIN SETTING INITIAL AMOUNTS")
  //           var initialIncomeCategories = {
  //             type: "Income",
  //             data: [{
  //                 userId: userId,
  //                 type: "income",
  //                 name: "initial",
  //               },
  //               {
  //                 userId: userId,
  //                 type: "income",
  //                 name: "transfer",
  //               },
  //             ]
  //           }

  //           var newIncomeAccounts = {
  //             Income: {
  //               type: "Income",
  //               data: []
  //             },
  //             Savings: {
  //               type: "Savings",
  //               data: []
  //             },
  //             Invest: {
  //               type: "Invest",
  //               data: []
  //             },
  //           }

  //           _.forEach(initialData, function(amounts, key) {
  //             _.forEach(amounts, function(amount) {
  //               amount['userId'] = userId;
  //               amount['date'] = amount.date;
  //               newIncomeAccounts[key]['data'].push({
  //                 userId: userId,
  //                 name: amount.accountName
  //               });
  //             })
  //           })
  //           //if initials_done is false continue
  //           // ADD NEW CATEGORIES
  //           console.log("controllers: ADD NEW CATEGORIES")
  //           models.categories_bulk.post(initialIncomeCategories, function(categoriesAdded, categoriesMessage) {
  //             if (categoriesAdded) {
  //               var initialCategoryCreated = categoriesAdded;
  //               // ADD NEW ACCOUNTS
  //               console.log("controllers: ADD NEW ACCOUNTS")
  //               var newAccountsAdded = {};
  //               models.accounts_bulk.post(newIncomeAccounts.Income, function(incomeAccountsAdded, incomeAccountsMessage) {
  //                 if (incomeAccountsAdded) {
  //                   newAccountsAdded['Income'] = incomeAccountsAdded
  //                   models.accounts_bulk.post(newIncomeAccounts.Savings, function(savingsAccountsAdded, savingAccountsMessage) {
  //                     if (savingsAccountsAdded) {
  //                       newAccountsAdded['Savings'] = savingsAccountsAdded
  //                       models.accounts_bulk.post(newIncomeAccounts.Invest, function(investAccountsAdded, investAccountsMessage) {
  //                         if (investAccountsAdded) {
  //                           newAccountsAdded['Invest'] = investAccountsAdded

  //                           // COMBINE CATEGORIES AND ACCOUNTS TO AMOUNTS
  //                           console.log("controllers: COMBINE CATEGORIES AND ACCOUNTS TO AMOUNTS")
  //                           var finalInitial = {
  //                             Income: {
  //                               type: "Income",
  //                               data: []
  //                             },
  //                             Savings: {
  //                               type: "Savings",
  //                               data: []
  //                             },
  //                             Invest: {
  //                               type: "Invest",
  //                               data: []
  //                             },
  //                           }
  //                           var totalAmounts = {
  //                             Income: {
  //                               userId: userId,
  //                               type: "Income",
  //                               amount: 0
  //                             },
  //                             Savings: {
  //                               userId: userId,
  //                               type: "Savings",
  //                               amount: 0
  //                             },
  //                             Invest: {
  //                               userId: userId,
  //                               type: "Invest",
  //                               amount: 0
  //                             },
  //                           }
  //                           var initialCategory = initialCategoryCreated.find(function(item) {
  //                             return item.dataValues.name === 'initial';
  //                           })
  //                           _.forEach(initialData, function(initialDataType, key) {
  //                             _.forEach(initialDataType, function(amount) {
  //                               _.forEach(newAccountsAdded[key], function(newAccount) {
  //                                 if (amount.accountName === newAccount.dataValues.name) {
  //                                   amount.accountId = newAccount.dataValues.id;
  //                                   amount.categoryId = initialCategory.id;
  //                                   amount.comment = "Initial amount added";
  //                                   finalInitial[key].data.push(amount);
  //                                   totalAmounts[key].amount = totalAmounts[key].amount + amount.amount;
  //                                 }
  //                               })
  //                             })
  //                           })
  //                           // ADD INCOMES WITH CORRECT ACCOUNT AND CATEGORY IDS TO DB
  //                           console.log("controllers: ADD INCOMES WITH CORRECT ACCOUNT AND CATEGORY IDS TO DB")
  //                           models.bulk_add.post(finalInitial.Income, function(incomeResult, incomeMessage) {
  //                             if (incomeResult) {
  //                               models.bulk_add.post(finalInitial.Savings, function(savingsResult, savingsMessage) {
  //                                 if (savingsResult) {
  //                                   models.bulk_add.post(finalInitial.Invest, function(investResult, investMessage) {
  //                                     if (investResult) {
  //                                       console.log("+++ 226 index.js ALL INITIAL ITEMS ADDED")
  //                                       // UPDATE CURRENT TOTALS WITH INITIAL AMOUNTS
  //                                       console.log("controllers: UPDATE CURRENT TOTALS WITH INITIAL AMOUNTS")
  //                                       models.updateTotalAmount.patch(totalAmounts.Income, function(currentIncome, currentIncomeMessage) {
  //                                         if (currentIncome) {
  //                                           models.updateTotalAmount.patch(totalAmounts.Savings, function(currentSavings, currentSavingsMessage) {
  //                                             if (currentSavings) {
  //                                               models.updateTotalAmount.patch(totalAmounts.Invest, function(currentInvest, currentInvestMessage) {
  //                                                 if (currentInvest) {
  //                                                   var currentAvailableValues = {
  //                                                     userId: userId,
  //                                                     totalToUpdate: Number(currentIncome.amount)
  //                                                   }
  //                                                   console.log("controllers: UPDATE CURRENT AVAILABLE")
  //                                                   models.updateCurrentAvailable.patch(currentAvailableValues, function(currentAvailable, currentAvailableMessage) {
  //                                                     if (currentAvailable) {
  //                                                       console.log("controllers: UPDATE INITIAL USER FLAG")
  //                                                       models.initials_done.post(userData, function(updated, userInitialsMessage) {
  //                                                         if (updated) {
  //                                                           console.log("controllers: INITIALS DONE - RETURNING DATA TO CLIENT")
  //                                                           res.status(200).json({
  //                                                             success: true,
  //                                                             data: {
  //                                                               itemsAdded: finalInitial,
  //                                                               currentTotalIncome: Number(currentIncome.amount),
  //                                                               currentTotalSavings: Number(currentSavings.amount),
  //                                                               currentTotalInvest: Number(currentInvest.amount),
  //                                                               currentAvailable: Number(currentAvailable.amount),
  //                                                               currentTotalExpenses: 0,
  //                                                             }
  //                                                           });
  //                                                         } else {
  //                                                           res.status(200).json({
  //                                                             success: false,
  //                                                             data: {
  //                                                               message: userInitialsMessage
  //                                                             }
  //                                                           })
  //                                                         };
  //                                                       })
  //                                                     } else {
  //                                                       res.status(200).json({
  //                                                         success: false,
  //                                                         data: {
  //                                                           message: currentAvailableMessage
  //                                                         }
  //                                                       })
  //                                                     }
  //                                                   })

  //                                                 } else {
  //                                                   res.status(200).json({
  //                                                     success: false,
  //                                                     data: {
  //                                                       message: currentInvestMessage
  //                                                     }
  //                                                   })
  //                                                 }

  //                                               })
  //                                             } else {
  //                                               res.status(200).json({
  //                                                 success: false,
  //                                                 data: {
  //                                                   message: currentSavingsMessage
  //                                                 }
  //                                               })
  //                                             };
  //                                           })
  //                                         } else {
  //                                           res.status(200).json({
  //                                             success: false,
  //                                             data: {
  //                                               message: currentIncomeMessage
  //                                             }
  //                                           })
  //                                         }
  //                                       })
  //                                     } else {
  //                                       res.status(200).json({
  //                                         success: false,
  //                                         data: {
  //                                           message: investMessage
  //                                         }
  //                                       })
  //                                     };
  //                                   })
  //                                 } else {
  //                                   res.status(200).json({
  //                                     success: false,
  //                                     data: {
  //                                       message: savingsMessage
  //                                     }
  //                                   })
  //                                 };
  //                               })
  //                             } else {
  //                               res.status(200).json({
  //                                 success: false,
  //                                 data: {
  //                                   message: incomeMessage
  //                                 }
  //                               })
  //                             }
  //                           })
  //                         } else {
  //                           res.status(200).json({
  //                             success: false,
  //                             data: {
  //                               message: "Initial " + investAccountsMessage
  //                             }
  //                           });
  //                         };
  //                       })
  //                     } else {
  //                       res.status(200).json({
  //                         success: false,
  //                         data: {
  //                           message: "Initial " + savingAccountsMessage
  //                         }
  //                       });

  //                     }
  //                   })
  //                 } else {
  //                   res.status(200).json({
  //                     success: false,
  //                     data: {
  //                       message: "Initial " + incomeAccountsMessage
  //                     }
  //                   });
  //                 }
  //               })
  //             } else {
  //               res.status(200).json({
  //                 success: false,
  //                 data: {
  //                   message: "Initial " + categoriesMessage
  //                 }
  //               });
  //             }
  //           })
  //         } else {
  //           res.status(200).json({
  //             success: false,
  //             data: {
  //               message: "User Initials already setup"
  //             }
  //           })
  //         };
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: getUserMessage
  //           }
  //         })
  //       }
  //     })

  //   }
  // },

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
  //             models.updateCurrentAvailable.patch(currentAvailableValues, function(currentAvailable, currentAvailableMessage) {
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
  //               models.updateCurrentAvailable.patch(updateAmount, function(currentAvailable, currentAvailableMessage) {
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
  //             models.updateCurrentAvailable.patch(deletedAmount, function(currentAvailable, currentAvailableMessage) {
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
  //             models.updateCurrentAvailable.patch(newExpensesTotal, function(currentAvailable, currentAvailableMessage) {
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
  //               models.updateCurrentAvailable.patch(updateAmount, function(currentAvailable, currentAvailableMessage) {
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
  //             models.updateCurrentAvailable.patch(deletedAmount, function(currentAvailable, currentAvailableMessage) {
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
  //                   models.updateCurrentAvailable.patch(currentAvailableValues, function(currentAvailable, currentAvailableMessage) {
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
  //               models.updateCurrentAvailable.patch(newTotalAdded, function(currentAvailable, currentAvailableMessage) {
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

  // search: {
  //   get: function(req, res) {
  //     var type = finUtils.type(req.query.type);
  //     var payload = {
  //       userId: req.headers.userId,
  //       type: type,
  //       deleted: false,
  //       include: [],
  //       orderBy: "date",
  //       order: "asc"
  //     }

  //     if (req.query.categoryId) {
  //       if (type === "Income" || type === "Expenses") {
  //         payload.categoryId = req.query.categoryId;
  //       }
  //     }
  //     if (req.query.accountId) {
  //       if (type === "Income" || type === "Savings" || type === "Invest") {
  //         payload.accountId = req.query.accountId;
  //       }
  //     }
  //     if (req.query.comment) {
  //       payload.comment = req.query.comment
  //     }
  //     if (req.query.minAmount) {
  //       payload.minAmount = req.query.minAmount
  //     }
  //     if (req.query.maxAmount) {
  //       payload.maxAmount = req.query.maxAmount
  //     }
  //     if (req.query.deleted) {
  //       payload.deleted = true;
  //     };
  //     if (req.query.limit) {
  //       payload.limit = Number(req.query.limit);
  //     };
  //     if (req.query.orderBy) {
  //       payload.orderBy = req.query.orderBy;
  //     };
  //     if (req.query.order) {
  //       payload.order = req.query.order;
  //     };
  //     if (req.query.startDate) {
  //       payload['startDate'] = req.query.startDate
  //     } else {
  //       payload['startDate'] = finUtils.startOfMonth();
  //     };
  //     if (req.query.endDate) {
  //       payload['endDate'] = req.query.endDate;
  //     } else {
  //       payload['endDate'] = finUtils.endOfMonth();
  //     };

  //     if (req.query.timeframe && req.query.timeframe === 'year') {
  //       payload['startDate'] = finUtils.startOfYear();
  //       payload['endDate'] = finUtils.endOfYear();
  //     }

  //     if (req.query.timeframe && req.query.timeframe === 'month') {
  //       payload['startDate'] = finUtils.startOfMonth();
  //       payload['endDate'] = finUtils.endOfMonth();
  //     }

  //     if (type === "Income" || type === "Expenses") {
  //       var categoryModel = type + "Category"
  //       payload.include.push({
  //         model: db[categoryModel],
  //         attributes: ['name'],
  //       })
  //     }
  //     if (type === "Income" || type === "Savings" || type === "Invest") {
  //       var accountModel = type + "Account";
  //       payload.include.push({
  //         model: db[accountModel],
  //         attributes: ['name'],
  //       })
  //     }
  //     console.log("+++ 1683 index.js payload: ", payload)
  //     models.search.get(payload, function(foundResults, message) {
  //       if (foundResults) {
  //         var finalData = [];
  //         _.forEach(foundResults, function(found) {
  //           var lowerType = finUtils.toLowerCase(payload.type);
  //           item = {};
  //           _.forEach(found.dataValues, function(value, key) {
  //             item[key] = value
  //           })
  //           if (type === "Income" || type === "Expenses") {
  //             var category = lowerType + "category";
  //             var addCategory = lowerType + "Category";
  //             if (found[category]) {
  //               item[addCategory] = found[category].name;
  //               delete item[category];
  //             }
  //           }
  //           if (type === "Income" || type === "Savings" || type === "Invest") {
  //             var account = lowerType + "account";
  //             var addAccount = lowerType + "Account";
  //             if (found[account]) {
  //               item[addAccount] = found[account].name;
  //               delete item[account];
  //             }
  //           }
  //           finalData.push(item)
  //         })
  //         var totalAmountFound = 0;
  //         if (finalData.length > 0) {
  //           _.forEach(finalData, function(item) {
  //             totalAmountFound = totalAmountFound + item.amount;
  //           })
  //         }

  //         res.status(200).json({
  //           success: true,
  //           type: payload.type,
  //           data: {
  //             results: finalData,
  //             totalFound: finalData.length,
  //             totalAmountFound: totalAmountFound.toFixed(2),
  //             queryLimit: payload.limit
  //           },
  //         });
  //       } else {
  //         res.status(200).json({
  //           success: false,
  //           data: {
  //             message: message,
  //             totalFound: 0,
  //             queryLimit: payload.limit
  //           }
  //         });
  //       };

  //     })
  //   },
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
