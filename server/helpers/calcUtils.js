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

  _.forEach(totalsByCategory, function(totals) {
    totals.amount = Number(totals.amount.toFixed(2));
    totalsHolder.push(totals);
  })
  var expensesByCategory = totalsHolder.sort(function(a, b) {
    return a.categoryId - b.categoryId;
  });

  var finalData = {
    expensesByCategory: expensesByCategory,
    expensesByAccount: amountCleanUp(totalsByAccount),
    totalExpenses: Number(totalExpenses.toFixed(2)),
  };
  return finalData;
}

exports.add_fund_totals = function (data) {
  var totalsByTypesHolder = {};
  var totalsByAccountsHolder = {};
  var totalsBySourcesHolder = {};
  _.forEach(data, function(lineItem) {
    var item = lineItem.dataValues;
    if(!totalsByTypesHolder[item.typeId]){
      totalsByTypesHolder[item.typeId] = {
        amount: item.amount,
        typeId: item.typeId,
      };
      if (item.type) {
        totalsByTypesHolder[item.typeId].type = item.type.dataValues.type;
      }
    } else{
      totalsByTypesHolder[item.typeId]['amount'] = totalsByTypesHolder[item.typeId]['amount'] + item.amount;
    };

    if (!totalsByAccountsHolder[item.accountId]) {
      totalsByAccountsHolder[item.accountId] = {
        amount: item.amount,
        accountId: item.accountId,
      };
      if (item.useraccount) {
        totalsByAccountsHolder[item.accountId].account = item.useraccount.dataValues.account;
      }
    } else {
      totalsByAccountsHolder[item.accountId]['amount'] = totalsByAccountsHolder[item.accountId]['amount'] + item.amount;
    };

    if (!totalsBySourcesHolder[item.sourceId]) {
      totalsBySourcesHolder[item.sourceId] = {
        amount: item.amount,
        sourceId: item.sourceId,
      };
      if (item.fundsource) {
        totalsBySourcesHolder[item.sourceId].source = item.fundsource.dataValues.source;
      }
    } else {
      totalsBySourcesHolder[item.sourceId]['amount'] = totalsBySourcesHolder[item.sourceId]['amount'] + item.amount;
    }
  })
  
  return {
    fundsByTypes: amountCleanUp(totalsByTypesHolder),
    fundsByAccounts: amountCleanUp(totalsByAccountsHolder),
    fundsBySources: amountCleanUp(totalsBySourcesHolder),
  }
}

var amountCleanUp = function (data) {
  var holder = [];
  _.forEach(data, function (item) {
    item.amount = Number(item.amount.toFixed(2));
    holder.push(item)
  })
  return holder;
}