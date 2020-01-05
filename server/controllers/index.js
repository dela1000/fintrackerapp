var models = require('../models');
var utils = require('../helpers/utils.js');
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
      models.login.post(payload, function (isUser) {
        if (isUser) {
          utils.createToken(req, res, isUser, function (token, name) {
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
              message: "Login unsuccessful"
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
        password: req.body.password, // need to bcrypt
        email: req.body.email
      }

      models.signup.post(payload, function (isUser) {
        if(isUser){
          utils.createToken(req, res, isUser, function (token, name) {
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
              message: "User name or email already used"
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
      var type = req.body.type;
      var payload = {
        type: type,
        initialAmounts: req.body.initialAmounts
      }
      _.forEach(payload.initialAmounts, function(amount) {
        amount['userId'] = req.headers.userId
        amount['date'] = moment(amount.date).startOf('day').format()
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
                console.log("+++ 113 index.js set initial Done: ", type)
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
        amount['date'] = moment(amount.date).startOf('day').format()
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
      var userId = req.query.userId
      models.income.get(userId, function (userIncome) {
        if (userIncome) {
          res.status(200).json(userIncome)
        } else{
          res.status(404)
        };

      })
    },
    patch: function (req, res) {
      var incomeId = req.body.incomeId;
      var amount = req.body.amount;
      var source = req.body.source;
      models.income.put(incomeId, amount, source, function (updatedIncome) {
        if (updatedIncome) {
          res.status(200).json(updatedIncome)
        }else{
          console.log("That income does not exist")
          res.sendStatus(404)
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
        amount['userId'] = req.headers.userId
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
                  console.log("+++ 274 index.js currentIncomeTotalAmount.dataValues.amount: ", currentIncomeTotalAmount.dataValues.amount)
                  console.log("+++ 275 index.js newAmount: ", newAmount)
                  var newUpdatedAmount = currentIncomeTotalAmount.dataValues.amount - newAmount
                  newUpdatedAmount = newUpdatedAmount.toFixed(2);
                  console.log("+++ 278 index.js newUpdatedAmount: ", newUpdatedAmount)
                  var newIncomeTotalData = {
                    newAmount: newUpdatedAmount,
                    userId: req.headers.userId,
                    type: "Income"
                  }
                  console.log("+++ 280 index.js newIncomeTotalData: ", newIncomeTotalData)
                  models.totalAmount.patch(newIncomeTotalData, function (newIncomeTotalAmount) {
                    console.log("+++ 281 index.js newIncomeTotalAmount: ", newIncomeTotalAmount)
                    console.log("+++ 184 index.js Expenses Added: ", type)
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
      var expenseId = req.body.expenseId;
      var amount = req.body.amount;
      var comment = req.body.comment;
      var categoryId = req.body.categoryId;
      models.expenses.put(expenseId, amount, comment, categoryId, function (updatedExpense) {
        if (updatedExpense) {
          res.status(200).json(updatedExpense)
        }else{
          console.log("That expense does not exist")
          res.sendStatus(404)
        }
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
