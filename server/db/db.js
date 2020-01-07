var Sequelize = require("sequelize");
var testData = require("../test/testData.js").testData;
var secrets = require('../../secrets/secrets.js');
var sequelize = new Sequelize(secrets.dbName, secrets.dbUser, secrets.dbPass);


var User = sequelize.define('user', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
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
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Income = sequelize.define('income', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
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
    incomeCategoryId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Expenses = sequelize.define('expenses', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    expensesCategoryId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    category: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Savings = sequelize.define('savings', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
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
    date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var Invest = sequelize.define('invest', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
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
    date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var incomeCategory = sequelize.define('category', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var ExpensesCategory = sequelize.define('expensescategory', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalIncome = sequelize.define('currenttotalincome', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalExpenses = sequelize.define('currenttotalexpenses', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalSavings = sequelize.define('currenttotalsavings', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var CurrentTotalInvest = sequelize.define('currenttotalinvest', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    amount: {
      type: Sequelize.FLOAT(10,2),
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var IncomeAccount = sequelize.define('incomeaccount', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var SavingsAccount = sequelize.define('savingsaccount', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  }, {
    paranoid: true
});

var InvestAccount = sequelize.define('investaccount', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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

User.hasMany(Income, {
  foreignKey: 'userId'
})

Expenses.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(Expenses, {
  foreignKey: 'userId'
})

Savings.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(Savings, {
  foreignKey: 'userId'
})

CurrentTotalIncome.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasOne(CurrentTotalIncome, {
  foreignKey: 'userId'
})

CurrentTotalExpenses.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasOne(CurrentTotalExpenses, {
  foreignKey: 'userId'
})

CurrentTotalSavings.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasOne(CurrentTotalSavings, {
  foreignKey: 'userId'
})

CurrentTotalInvest.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasOne(CurrentTotalInvest, {
  foreignKey: 'userId'
})

IncomeAccount.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(IncomeAccount, {
  foreignKey: 'userId'
})

SavingsAccount.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(SavingsAccount, {
  foreignKey: 'userId'
})

InvestAccount.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(InvestAccount, {
  foreignKey: 'userId'
})



User.sync().then(function(){
  Income.sync().then(function(){
    Expenses.sync().then(function(){
      Savings.sync().then(function(){
        Invest.sync().then(function(){
          CurrentTotalIncome.sync().then(function(){
            CurrentTotalExpenses.sync().then(function(){
              CurrentTotalSavings.sync().then(function(){
                CurrentTotalInvest.sync().then(function(){
                  incomeCategory.sync().then(function(){
                    incomeCategory.hasMany(Income, {
                      foreignKey: 'incomeCategoryId'
                    });
                    ExpensesCategory.sync().then(function(){
                      ExpensesCategory.hasMany(Expenses, {
                        foreignKey: 'expensesCategoryId'
                      });
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
exports.Expenses = Expenses;
exports.Savings = Savings;
exports.Invest = Invest;
exports.CurrentTotalIncome = CurrentTotalIncome;
exports.CurrentTotalExpenses = CurrentTotalExpenses;
exports.CurrentTotalSavings = CurrentTotalSavings;
exports.CurrentTotalInvest = CurrentTotalInvest;
exports.incomeCategory = incomeCategory;
exports.ExpensesCategory = ExpensesCategory;
exports.IncomeAccount = IncomeAccount;
exports.SavingsAccount = SavingsAccount;
exports.InvestAccount = InvestAccount;

