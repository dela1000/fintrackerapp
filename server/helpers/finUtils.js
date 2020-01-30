var _ = require('lodash');
var moment = require('moment');

exports.addTotals = function(data) {
  var totalAmount = 0;
  var totalsByCategory = {};
  var totalsHolder = [];
  _.forEach(data, function (lineItem) {
    var item = lineItem.dataValues;
    if(!totalsByCategory[item.categoryId]){
      totalsByCategory[item.categoryId] = {
        amount: item.amount,
        categoryName: item.expensescategory.dataValues.name,
        categoryId: item.categoryId,
      };
    } else {
      totalsByCategory[item.categoryId]['amount'] = totalsByCategory[item.categoryId]['amount'] + item.amount;
    }
  })
  _.forEach(totalsByCategory, function (totals) {
    totalAmount = totalAmount + totals.amount;
    totals.amount = totals.amount.toFixed(2);
    totalsHolder.push(totals);
  })
  var totals = totalsHolder.sort(function(a, b){ 
    return a.categoryId - b.categoryId;
  });
  var finalData = {
    totals: totals,
    totalAmount: totalAmount
  };
  return finalData;
}

exports.unixDate = function(readableDate) {
  return moment(readableDate).startOf('day').format('x')
}

exports.readableDate = function(unixDate) {
  return moment(unixDate).format("YYYY-MM-DD");
}

exports.type = function (type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

exports.toLowerCase = function (type) {
  return type.toLowerCase();
}

exports.startOfDay = function () {
  return moment().startOf('day').format('x');
}

exports.endOfDay = function () {
  return moment().endOf('day').format('x');
}

exports.startOfMonth = function () {
  return moment().startOf('month').format('x');
}

exports.endOfMonth = function () {
  return moment().endOf('month').format('x');
}

exports.startOfYear = function () {
  return moment().startOf('year').format('x');
}

exports.endOfYear = function () {
  return moment().endOf('year').format('x');
}