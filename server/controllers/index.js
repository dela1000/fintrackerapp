var models = require('../models');
var utils = require('../helpers/utils.js');

var controllers;
module.exports = controllers = {
  login: {
    get: function (request, response) {
      var payload = {
        username: request.body.username,
        password: request.body.password
      }
      models.login.post(payload, function (isUser) {
        if (isUser) {
          utils.createToken(request, response, isUser, function (token, name) {
           response.status(200).send({
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
         response.status(200).json({
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
    post: function (request, response) {
      var payload = {
        username: request.body.username,
        password: request.body.password, // need to bcrypt
        email: request.body.email
      }

      models.signup.post(payload, function (isUser) {
        if(isUser){
          utils.createToken(request, response, isUser, function (token, name) {
           response.status(200).json({
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
          response.status(200).json({
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
    get: function (request, response) {
      response.status(202).json({
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
    post: function (request, response) {
      models.categories.get(function (allCategories) {
        response.status(200).json({
            success: false,
            data: allCategories
          });
      })
    }
  },

  categories: {
    get: function (request, response) {
      models.categories.get(function (allCategories) {
        response.status(200).json({
            success: false,
            data: allCategories
          });
      })
    }
  },

  expenses: {
    post: function (request, response) {
      var userId = request.body.userId;
      var amount = request.body.amount;
      var comment = request.body.comment;
      var categoryId = request.body.categoryId;
      var category = request.body.category;
      var createdAt = request.body.createdAt;
      models.expenses.post(userId, amount, comment, categoryId, category, createdAt, function (expenseAdded) {
        if (expenseAdded) {
          response.status(200).json({
            success: false,
            data: expenseAdded
          })
        } else{
          response.status(200).json({
            success: false,
            message: "No expenses found"
          });
        };
      })
    },
    get: function (request, response) {
      var userId = request.query.userId;
      console.log("+++ 75 index.js userId: ", userId)
      models.expenses.get(userId, function (allExpenses) {
        if (allExpenses) {
          response.status(200).json(allExpenses)
        } else{
          console.log("This user has no expenses to show")
          response.sendStatus(404)
        };
      })
    },
    patch: function (request, response) {
      var expenseId = request.body.expenseId;
      var amount = request.body.amount;
      var comment = request.body.comment;
      var categoryId = request.body.categoryId;
      models.expenses.put(expenseId, amount, comment, categoryId, function (updatedExpense) {
        if (updatedExpense) {
          response.status(200).json(updatedExpense)
        }else{
          console.log("That expense does not exist")
          response.sendStatus(404)
        }
      })
    }
  },
  income: {
    post: function (request, response) {
      var userId = request.body.userId;
      var amount = request.body.amount;
      var source = request.body.source;
      console.log("+++ 115 index.js source: ", source)
      models.income.post(userId, amount, source, function (incomeCreated) {
        if ((incomeCreated)) {
          response.status(200).json(incomeCreated)
        } else{
          response.sendStatus(404)
        };
      })
    },
    get: function name1 (request, response) {
      var userId = request.query.userId
      models.income.get(userId, function (userIncome) {
        if (userIncome) {
          response.status(200).json(userIncome)
        } else{
          response.status(404)
        };

      })
    },
    patch: function (request, response) {
      var incomeId = request.body.incomeId;
      var amount = request.body.amount;
      var source = request.body.source;
      models.income.put(incomeId, amount, source, function (updatedIncome) {
        if (updatedIncome) {
          response.status(200).json(updatedIncome)
        }else{
          console.log("That income does not exist")
          response.sendStatus(404)
        }
      })
    }
  },
  ping: {
    get: function (request, response){
      response.status(200).json(request.headers)
    }
  }
}
