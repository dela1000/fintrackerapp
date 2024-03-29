var _ = require('lodash');
var moment = require('moment');
var dateFormat = "MM-DD-YYYY";

exports.types = [{
    name: "income",
    capitalName: "Income",
    dbName: "incomes",
  },
  {
    name: "savings",
    capitalName: "Savings",
    dbName: "savings",
  },
  {
    name: "invest",
    capitalName: "Invest",
    dbName: "invests",
  },
  {
    name: "expenses",
    capitalName: "Expenses",
    dbName: "expenses",
  },
];

exports.capitalizeFirst = function(type) {
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

exports.startOfTime = function() {
  return moment().endOf('year').format('01-01-2020');
}

exports.endOfTime = function() {
  return moment().endOf('year').format('12-31-2100');
}

exports.formatAccounts = function (data) {
  var temp = {
    accounts: [],
    expensesCategories: [],
    fundSources: [],
  };
  _.forEach(data.useraccounts, function (account) {
    if(account.type){
      temp.accounts.push({
        account: account.account,
        id: account.id,
        type: account.type.type,
        typeId: account.typeId,
        primary: account.primary,
      })
    }
  })
  temp.expensesCategories = data.expensescategories;
  temp.fundSources = data.fundsources;
  return temp;
}





