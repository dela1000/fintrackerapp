var _ = require('lodash');
var moment = require('moment');
var dateFormat = "MM-DD-YYYY";

exports.addExpensesTotals = function(data) {
  var totalAmount = 0;
  var totalsByCategory = {};
  var totalsHolder = [];
  _.forEach(data, function(lineItem) {

    var item = lineItem.dataValues;
    if (!totalsByCategory[item.categoryId]) {
      totalsByCategory[item.categoryId] = {
        amount: item.amount,
        categoryId: item.categoryId,
      };
      if (item.expensescategory) {
        totalsByCategory[item.categoryId].categoryName = item.expensescategory.dataValues.name;
      }
    } else {
      totalsByCategory[item.categoryId]['amount'] = totalsByCategory[item.categoryId]['amount'] + item.amount;
    }
  })
  _.forEach(totalsByCategory, function(totals) {
    totalAmount = totalAmount + totals.amount;
    totals.amount = Number(totals.amount.toFixed(2));
    totalsHolder.push(totals);
  })
  var totals = totalsHolder.sort(function(a, b) {
    return a.categoryId - b.categoryId;
  });
  var finalData = {
    totals: totals,
    totalAmount: totalAmount
  };
  return finalData;
}

exports.addAccountsTotals = function (data, type) {
  var totalAmount = 0;
  var totalsByAccount = {};
  var totalsHolder = [];
  _.forEach(data, function (lineItem) {
    var item = lineItem.dataValues;
    if (!totalsByAccount[item.accountId]) {
      totalsByAccount[item.accountId] = {
        amount: item.amount,
        accountId: item.accountId,
      };
      if (item[type + 'account']) {
        totalsByAccount[item.accountId].accountName = item[type + 'account'].dataValues.name;
      }
    } else {
      totalsByAccount[item.accountId]['amount'] = totalsByAccount[item.accountId]['amount'] + item.amount;
    }
  })
  _.forEach(totalsByAccount, function(totals) {
    totalAmount = totalAmount + totals.amount;
    totals.amount = Number(totals.amount.toFixed(2));
    totalsHolder.push(totals);
  })
  var totals = totalsHolder.sort(function(a, b) {
    return a.categoryId - b.categoryId;
  });
  var finalData = {
    totals: totals,
    totalAmount: totalAmount
  };
  return finalData;
}

exports.type = function(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

exports.toLowerCase = function(type) {
  return type.toLowerCase();
}

exports.startOfDay = function() {
  return moment().startOf('day').format(dateFormat);
}

exports.endOfDay = function() {
  return moment().endOf('day').format(dateFormat);
}

exports.startOfMonth = function() {
  return moment().startOf('month').format(dateFormat);
}

exports.endOfMonth = function() {
  return moment().endOf('month').format(dateFormat);
}

exports.startOfYear = function() {
  return moment().startOf('year').format(dateFormat);
}

exports.endOfYear = function() {
  return moment().endOf('year').format(dateFormat);
}