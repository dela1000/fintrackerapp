var Sequelize = require("sequelize");
var testData = require("../test/testData.js").testData;
var secrets = require('../../secrets/secrets.js');
var sequelize = new Sequelize(secrets.dbName, secrets.dbUser, secrets.dbPass);


var User = sequelize.define('user', {
    username: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    initial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Income = sequelize.define('income', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    account: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    accountId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    category: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Expense = sequelize.define('expense', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    category: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Saving = sequelize.define('saving', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    account: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    accountId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Invest = sequelize.define('invest', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    account: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    accountId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var IncomeCategory = sequelize.define('incomecategory', {
    category: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var ExpensesCategory = sequelize.define('expensescategory', {
    category: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalIncome = sequelize.define('currenttotalincome', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalExpenses = sequelize.define('currenttotalexpenses', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalSavings = sequelize.define('currenttotalsavings', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalInvest = sequelize.define('currenttotalinvest', {
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var IncomeAccount = sequelize.define('incomeaccount', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var SavingsAccount = sequelize.define('savingsaccount', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var InvestAccount = sequelize.define('investaccount', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

//Users have many Expenses, Expenses have one user
Income.belongsTo(User, {
  foreignKey: 'userId'
});

Expense.belongsTo(User, {
  foreignKey: 'userId'
});

Saving.belongsTo(User, {
  foreignKey: 'userId'
});

CurrentTotalIncome.belongsTo(User, {
  foreignKey: 'userId'
});

CurrentTotalExpenses.belongsTo(User, {
  foreignKey: 'userId'
});

CurrentTotalSavings.belongsTo(User, {
  foreignKey: 'userId'
});

CurrentTotalInvest.belongsTo(User, {
  foreignKey: 'userId'
});

IncomeAccount.belongsTo(User, {
  foreignKey: 'userId'
});

SavingsAccount.belongsTo(User, {
  foreignKey: 'userId'
});

InvestAccount.belongsTo(User, {
  foreignKey: 'userId'
});

User.sync().then(function(){
  Income.sync().then(function(){
    Expense.sync().then(function(){
      Saving.sync().then(function(){
        Invest.sync().then(function(){
          CurrentTotalIncome.sync().then(function(){
            CurrentTotalExpenses.sync().then(function(){
              CurrentTotalSavings.sync().then(function(){
                CurrentTotalInvest.sync().then(function(){
                  IncomeCategory.sync().then(function(){
                    ExpensesCategory.sync().then(function(){
                      InvestAccount.sync().then(function(){
                        IncomeAccount.sync().then(function(){
                          SavingsAccount.sync().then(function(){
                            testData();
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
});

exports.User = User;
exports.Income = Income;
exports.Expense = Expense;
exports.Saving = Saving;
exports.Invest = Invest;
exports.CurrentTotalIncome = CurrentTotalIncome;
exports.CurrentTotalExpenses = CurrentTotalExpenses;
exports.CurrentTotalSavings = CurrentTotalSavings;
exports.CurrentTotalInvest = CurrentTotalInvest;
exports.IncomeCategory = IncomeCategory;
exports.ExpensesCategory = ExpensesCategory;
exports.IncomeAccount = IncomeAccount;
exports.SavingsAccount = SavingsAccount;
exports.InvestAccount = InvestAccount;

