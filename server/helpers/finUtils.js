var _ = require('lodash');
var moment = require('moment');

exports.addTotals = function(data) {
  var totalAmount = 0;
  var totalsByCategory = {};
  var totalsHolder = [];
  _.forEach(data, function (item) {
    if(!totalsByCategory[item.category]){
      totalsByCategory[item.category] = {
        categoryId: item.categoryId,
        category: item.category,
        amount: item.amount
      };
    } else {
      totalsByCategory[item.category]['amount'] = totalsByCategory[item.category]['amount'] + item.amount;
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