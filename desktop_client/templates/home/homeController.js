angular.module('App.home', [])
  .controller('HomeController', function($scope, $rootScope, $http, $state, $window, HomeFactory, LoginFactory){

    $scope.userId = $window.localStorage.fintrack_userId

    $scope.allExpenses = {};
    $scope.allIncome = {};
    $scope.expenseQuantity = 30;
    $scope.totalExpenses = 0;
    $scope.totalIncome = 0;
    $scope.availableMonies = 0;
    $scope.allCategories;
    $scope.selectedCategory = null;
    $scope.selectCategoryAlerts = false;
    $scope.showExpenseInput = false;
    $scope.showIncomeInput = false;

    //Get today's date
    $scope.today = function() {
      $scope.dt = new Date();
    };

    //load Expense Categories
    $scope.loadCategories = function () {
      HomeFactory.loadCategories()
      .then(function (allCategories) {
        $scope.allCategories = allCategories.data;
      })
    }

    //select an expense category
    $scope.selectCategory = function (selectedCategory) {
      $scope.selectedCategory = selectedCategory;
      $scope.selectCategoryAlerts = false;
    }

    //collect all expenses for the user
    $scope.expenses = function(){
      HomeFactory.expenses($scope.userId)
      .then(function (allExpenses) {
        $scope.allExpenses = allExpenses.data
        $scope.allExpenses.reverse()
        totalExpenses()
        $scope.available()
      })
    }

    //add total expense for user
    var totalExpenses = function () {
      var amounts = []
      _.each($scope.allExpenses, function (expense) {
        amounts.push(expense.amount)
      })
      $scope.totalExpenses  = _.reduce(amounts, function(memo, amount){
        return memo + amount;
      }, 0)
      $scope.totalExpenses = $scope.totalExpenses.toFixed(2);
    }

    //display Expense input Area
    $scope.showExpensesInput = function () {
      if($scope.showExpenseInput === false){
        $scope.showExpenseInput = true;
        $scope.showIncomeInput = false;
      } else{
        $scope.showExpenseInput = false;
      };
    }

    $scope.addExpenses = function () {
      if($scope.selectedCategory !== null){
        var userId = $scope.userId
        var amount = $scope.inputExpense.amount
        var comment = $scope.inputExpense.comment
        var categoryId = $scope.selectedCategory.id
        var category = $scope.selectedCategory.category
        var createdAt = $scope.dt
        HomeFactory.addExpenses(userId, amount, comment, categoryId, category, createdAt)
        .then(function (expenseAdded) {
          $scope.inputExpense.amount = '';
          $scope.inputExpense.comment = '';
          $scope.selectedCategory = null
          $scope.expenses();
        })
      } else{
        $scope.selectCategoryAlerts = true;
      };
    }


    $scope.showIncomesInput = function () {
      if($scope.showIncomeInput === false){
        $scope.showIncomeInput = true;
        $scope.showExpenseInput = false;
      } else{
        $scope.showIncomeInput = false;
      };
    }

    $scope.income = function(){
      HomeFactory.income($scope.userId)
      .then(function (allIncome) {
        $scope.allIncome = allIncome.data
        $scope.allIncome.reverse()
        totalIncome();
        $scope.available();
      })
    }

    var totalIncome = function () {
      var amounts = []
      var totalincome = 0
      _.each($scope.allIncome, function (income) {
        amounts.push(income.amount)
      })
      $scope.totalIncome = _.reduce(amounts, function(memo, amount){
        return memo + amount;
      }, 0)
      $scope.totalIncome = $scope.totalIncome.toFixed(2);
    }

    $scope.addIncome = function () {
      var userId = $scope.userId;
      var amount = $scope.inputIncome.amount;
      var source = $scope.inputIncome.source;
      var createdAt = $scope.dt;
      HomeFactory.addIncome(userId, amount, source, createdAt)
      .then(function (incomeAdded){
        $scope.inputIncome.amount = '';
        $scope.inputIncome.source = '';
        $scope.income();
      })
    }

    $scope.available = function () {
      $scope.availableMonies = $scope.totalIncome - $scope.totalExpenses
    }

    $scope.logout= function () {
      LoginFactory.logout()
    }

    //functions triggered on page load
    $scope.loadCategories();
    $scope.expenses();
    $scope.income();
    $scope.today();
    $scope.available();
  });
