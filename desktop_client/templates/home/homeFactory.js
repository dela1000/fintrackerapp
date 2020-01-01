angular.module('App')
  .factory('HomeFactory', function ($http, $state, $window){

  // Switch between local and deployed server
  var url;
  url = 'http://localhost:8888';
  // url = 'https://fintracker.herokuapp.com'

  function loadCategories () {
    return $http({
      method: 'GET',
      url: url + '/categories'
    })
    .then(function (allCategories) {
      return allCategories
    })
  }

  function expenses (userId) {
    return $http({
      method: 'GET',
      url: url + '/expenses?userId=' + userId
    })
    .then(function(allExpenses){
      return allExpenses
    })
  }

  function addExpenses (userId, amount, comment, categoryId, category, createdAt) {
    return $http({
      method: 'POST',
      url: url +'/expenses',
      data: {
        userId: userId,
        amount: amount,
        comment: comment,
        categoryId: categoryId,
        category: category,
        createdAt: createdAt
      }
    })
    .then(function (expenseAdded) {
      return expenseAdded.data
    })
  }

  function income (userId) {
    return $http({
      method: 'GET',
      url: url + '/income?userId=' + userId
    })
    .then(function(allIncome){
      return allIncome
    })
  }

  function addIncome (userId, amount, source, createdAt) {
    console.log("+++ 48 homeFactory.js userId, amount, source, createdAt: ", userId, amount, source, createdAt)
    return $http({
      method: 'POST',
      url: url + '/income',
      data:{
        userId: userId,
        amount: amount,
        source: source,
        createdAt: createdAt
      }
    })
    .then(function (incomeAdded) {
      return incomeAdded.data
    })
  }

  return {
    loadCategories: loadCategories,
    expenses: expenses,
    addExpenses: addExpenses,
    addIncome: addIncome,
    income: income
  }
})




