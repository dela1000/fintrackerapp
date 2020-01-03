var models = require('../models');
var utils = require('../helpers/utils.js');
var _ = require('lodash');

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
      var payload = req.body.initialAmounts
      _.forEach(payload, function(amount) {
        amount['userId'] = req.headers.userId
      })
      if(payload.length > 0){
        models.set_initials.post(payload, function (initialIncomesCreated) {
          if(initialIncomesCreated){
            models.totalIncome.get(req.headers.userId, function (currentTotalIncome) {
              var totalAmount = _.sumBy(initialIncomesCreated, 'amount');
              newTotaIncome = {
                newAmount: currentTotalIncome.dataValues.amount + totalAmount,
                userId: req.headers.userId
              }
              models.totalIncome.patch(newTotaIncome, function (newTotalIncome) {
                res.status(200).json({
                    success: true,
                    data: {
                      initialIncomesCreated: initialIncomesCreated, 
                      newTotaIncome: newTotaIncome.newAmount
                    }
                });
              })
            })
          } else {
            res.status(200).json({
              success: false,
              data: {
                message: "Initial incomes not added"
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

  categories: {
    get: function (req, res) {
      models.categories.get(function (allCategories) {
        res.status(200).json({
            success: false,
            data: allCategories
          });
      })
    }
  },

  expenses: {
    post: function (req, res) {
      var userId = req.body.userId;
      var amount = req.body.amount;
      var comment = req.body.comment;
      var categoryId = req.body.categoryId;
      var category = req.body.category;
      var createdAt = req.body.createdAt;
      models.expenses.post(userId, amount, comment, categoryId, category, createdAt, function (expenseAdded) {
        if (expenseAdded) {
          res.status(200).json({
            success: false,
            data: expenseAdded
          })
        } else{
          res.status(200).json({
            success: false,
            message: "No expenses found"
          });
        };
      })
    },
    get: function (req, res) {
      var userId = req.query.userId;
      models.expenses.get(userId, function (allExpenses) {
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
  income: {
    post: function (req, res) {
      var userId = req.body.userId;
      var amount = req.body.amount;
      var source = req.body.source;
      console.log("+++ 115 index.js source: ", source)
      models.income.post(userId, amount, source, function (incomeCreated) {
        if ((incomeCreated)) {
          res.status(200).json(incomeCreated)
        } else{
          res.sendStatus(404)
        };
      })
    },
    get: function name1 (req, res) {
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
  ping: {
    get: function (req, res){
      res.status(200).json(req.headers)
    }
  }
}
