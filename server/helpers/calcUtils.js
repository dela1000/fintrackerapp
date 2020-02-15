var models = require('../models');
var finUtils = require("./finUtils.js")
var _ = require('lodash');

exports.calculate_totals = function(res, userId, callback) {
  console.log("+++ calcUtils - RECALCULATING TOTALS")
  var userData = {
    userId: userId
  }
  console.log("+++ 10 calcUtils.js Get all user accounts totals")
  models.account_totals_bulk.get(userData, function(totalsData, totalsMessage) {
    if (totalsData) {
      console.log("+++ 13 calcUtils.js get all user funds")
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
          console.log("+++ 30 calcUtils.js New totals calculated by account Id")
          console.log("+++ 31 calcUtils.js addedTotals: ", addedTotals)
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
          // Get all expenses
          console.log("+++ 53 calcUtils.js Get all user expenses")
          models.expenses_bulk.get(userData, function(expensesFound) {
            var expensesTotal = 0;
            if (!_.isEmpty(expensesFound)) {
              var expensesByAccount = {};
              _.forEach(expensesFound, function(expense) {
                expensesTotal = expensesTotal + expense.amount
                if (!expensesByAccount[expense.accountId]) {
                  expensesByAccount[expense.accountId] = { amount: expense.amount }
                } else {
                  expensesByAccount[expense.accountId].amount = expensesByAccount[expense.accountId].amount + expense.amount;
                }
              })
              expensesTotal = expensesTotal.toFixed(2);
              _.forEach(newAccountTotals, function(newAccountTotal) {
                if (newAccountTotal.accountId in expensesByAccount) {
                  newAccountTotal.amount = newAccountTotal.amount - expensesByAccount[newAccountTotal.accountId].amount;
                }
              })
            }
            console.log("+++ 73 calcUtils.js New account totals minus expenses by account")
            console.log("+++ 74 calcUtils.js newAccountTotals: ", newAccountTotals)
            models.account_totals.upsert(newAccountTotals, function(updatedTotals, updateMessage) {
              if (updatedTotals) {
                // ACCOUNT TOTALS CALCULATED
                userData.newCurrentAvailable = checkingAccountsTotal - expensesTotal;
                models.recalculated_current_available.patch(userData, function(currentAvailable, availableMessage) {
                  if (currentAvailable) {
                    _.forEach(newAccountTotals, function (item) {
                      item.amount = Number(item.amount.toFixed(2));
                    })
                    var data = {
                      newAccountTotals: newAccountTotals,
                      currentAvailable: Number(currentAvailable.amount),
                    };
                    callback(data);
                    console.log("+++ 70 calcUtils.js RECALCULATING COMPLETED")
                  } else {
                    callback(false, availableMessage)
                  }
                })
              } else {
                callback(false, updateMessage)
              };
            })
          })
        } else {
          callback(false, fundsMessage)
        }
      })
    } else {
      callback(false, totalsMessage)
    };
  })
}


exports.add_expenses_totals = function(data) {
  var totalExpenses = 0;
  var totalsByCategory = {};
  var totalsByAccount = {};
  var totalsHolder = [];
  _.forEach(data, function(lineItem) {
    var item = lineItem.dataValues;
    totalExpenses = totalExpenses + item.amount;
    if (!totalsByCategory[item.categoryId]) {
      totalsByCategory[item.categoryId] = {
        amount: item.amount,
        categoryId: item.categoryId,
      };
      if (item.expensescategory) {
        totalsByCategory[item.categoryId].category = item.expensescategory.dataValues.name;
      }
    } else {
      totalsByCategory[item.categoryId]['amount'] = totalsByCategory[item.categoryId]['amount'] + item.amount;
    }
    if (!totalsByAccount[item.accountId]) {
      totalsByAccount[item.accountId] = {
        amount: item.amount,
        accountId: item.accountId,
      };
      if (item.useraccount) {
        totalsByAccount[item.accountId].account = item.useraccount.dataValues.account;
      }
    } else {
      totalsByAccount[item.accountId]['amount'] = totalsByAccount[item.accountId]['amount'] + item.amount;
    }
  })

  _.forEach(totalsByCategory, function(total, index) {
    total.amount = Number(total.amount.toFixed(2));
    totalsHolder.push(total);
  })
  var expensesByCategory = totalsHolder.sort(function(a, b) {
    return a.categoryId - b.categoryId;
  });
  var finalData = {
    totalExpenses: Number(totalExpenses.toFixed(2)),
    expensesByCategory: expensesByCategory,
    expensesByAccount: amountCleanUp(totalsByAccount),
  };

  return finalData;
}

exports.add_fund_totals = function(data) {
  var totalsByTypesHolder = {};
  var totalsByAccountsHolder = {};
  var totalsBySourcesHolder = {};
  _.forEach(data, function(lineItem) {
    var item = lineItem.dataValues;
    if (item.typeId === 4) {
      if(item.amount > 0){
        if (!totalsByTypesHolder[item.typeId]) {
          totalsByTypesHolder[item.typeId] = {
            amount: item.amount,
          };
          if (item.type) {
            totalsByTypesHolder[item.typeId].typeId = item.typeId;
            totalsByTypesHolder[item.typeId].type = item.type.type;
          }
        } else {
          totalsByTypesHolder[item.typeId]['amount'] = totalsByTypesHolder[item.typeId]['amount'] + item.amount;
        };

        if (!totalsBySourcesHolder[item.sourceId]) {
          totalsBySourcesHolder[item.sourceId] = {
            amount: item.amount,
          };
          if (item.fundsource) {
            totalsBySourcesHolder[item.sourceId].sourceId = item.sourceId;
            totalsBySourcesHolder[item.sourceId].source = item.fundsource.source;
          }
        } else {
          totalsBySourcesHolder[item.sourceId]['amount'] = totalsBySourcesHolder[item.sourceId]['amount'] + item.amount;
        }
      }
    } else {
      if (!totalsByTypesHolder[item.typeId]) {
        totalsByTypesHolder[item.typeId] = {
          amount: item.amount,
        };
        if (item.type) {
          totalsByTypesHolder[item.typeId].typeId = item.typeId;
          totalsByTypesHolder[item.typeId].type = item.type.type;
        }
      } else {
        totalsByTypesHolder[item.typeId]['amount'] = totalsByTypesHolder[item.typeId]['amount'] + item.amount;
      };

      if (!totalsByAccountsHolder[item.accountId]) {
        totalsByAccountsHolder[item.accountId] = {
          amount: item.amount,
        };
        if (item.useraccount) {
          totalsByAccountsHolder[item.accountId].accountId = item.accountId;
          totalsByAccountsHolder[item.accountId].account = item.useraccount.account;
        }
        if (item.type) {
          totalsByAccountsHolder[item.accountId].typeId = item.typeId;
          totalsByAccountsHolder[item.accountId].type = item.type.type;
        }
      } else {
        totalsByAccountsHolder[item.accountId]['amount'] = totalsByAccountsHolder[item.accountId]['amount'] + item.amount;
      };

      if (!totalsBySourcesHolder[item.sourceId]) {
        totalsBySourcesHolder[item.sourceId] = {
          amount: item.amount,
        };
        if (item.fundsource) {
          totalsBySourcesHolder[item.sourceId].sourceId = item.sourceId;
          totalsBySourcesHolder[item.sourceId].source = item.fundsource.source;
        }
      } else {
        totalsBySourcesHolder[item.sourceId]['amount'] = totalsBySourcesHolder[item.sourceId]['amount'] + item.amount;
      }

    }
  })

  return {
    fundsByTypes: amountCleanUp(totalsByTypesHolder),
    fundsByAccounts: amountCleanUp(totalsByAccountsHolder),
    fundsBySources: amountCleanUp(totalsBySourcesHolder),
  }
}

var amountCleanUp = function(data) {
  var holder = [];
  _.forEach(data, function(item) {
    item.amount = Number(item.amount.toFixed(2));
    holder.push(item)
  })
  return holder;
}