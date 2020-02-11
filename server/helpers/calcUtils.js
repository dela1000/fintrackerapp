var models = require('../models');
var finUtils = require("./finUtils.js")
var _ = require('lodash');


exports.calculate_totals = function(res, userId, callback) {
  var userData = {
    userId: userId
  }
  var expensesTotal = 0;
  models.expenses_bulk.get(userData, function(expensesFound) {
    if (expensesFound) {
      var total = expensesFound.reduce(function(a, b) {
        return {
          amount: a.amount + b.amount
        }
      })
      expensesTotal = total.amount.toFixed(2);
    }
    // FIGURE OUT FUNDS DATA
    models.funds_bulk.get(userData, function(fundsFound, fundsMessage) {
      if (fundsFound) {
        var addedTotals = {};
        _.forEach(fundsFound, function(fund) {
          if (!addedTotals[fund.accountId]) {
            addedTotals[fund.accountId] = {
              id: fund.accountId,
              amount: fund.amount
            };
          } else {
            addedTotals[fund.accountId].amount = addedTotals[fund.accountId].amount + fund.amount;
          }
        })
        _.forEach(addedTotals, function(item, key) {
          item.amount = Number(item.amount.toFixed(2));
        })
        models.account_totals_bulk.get(userData, function(totalsData, totalsMessage) {
          if (totalsData) {
            var newAccountTotals = [];
            var checkingAccountsTotal = 0;
            _.forEach(totalsData, function(total) {
              if (total.accountId === addedTotals[total.accountId].id) {
                total.amount = addedTotals[total.accountId].amount;
                total.amount = Number(total.amount.toFixed(2));
                newAccountTotals.push({
                  id: total.id,
                  amount: total.amount,
                  accountId: total.accountId,
                  typeId: total.typeId,
                  account: total.useraccount.account,
                  type: total.type.type,
                })
              }
              // Aggregate Checking accounts amounts
              if (total.typeId === 1) {
                checkingAccountsTotal = checkingAccountsTotal + total.amount;
              }
            })
            models.account_totals.upsert(newAccountTotals, function(updatedTotals, updateMessage) {
              if (updatedTotals) {
                // ACCOUNT TOTALS CALCULATED
                userData.newCurrentAvailable = checkingAccountsTotal - expensesTotal;
                models.recalculated_current_available.patch(userData, function(currentAvailable, availableMessage) {
                  if (currentAvailable) {
                    var data = {
                      newAccountTotals: newAccountTotals,
                      currentAvailable: Number(currentAvailable.amount),
                    };
                    callback(data);
                  } else {
                    callback(false, availableMessage)
                  }
                })
              } else {
                callback(false, updateMessage)
              };
            })
          } else {
            callback(false, totalsMessage)
          };
        })
      } else {
        callback(false, fundsMessage)
      }
    })
  })
}

exports.calculate_expenses_totals = function(res, userId, callback) {
  var payload = {
    userId: userId
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
      var addedExpensesTotals = finUtils.addExpensesTotals(expensesData);
      var data = {
        totals: addedExpensesTotals.totals,
        timeframe: payload.timeframe,
        expensesCount: expensesData.length,
        totalAmount: addedExpensesTotals.totalAmount.toFixed(2),
      }
      callback(data);
    } else {
      callback(false, message)
    };
  })
}