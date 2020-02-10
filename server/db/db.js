var Sequelize = require("sequelize");
var testData = require("../test/testData.js").testData;
var defaults = require("./defaults.js").defaults;
var secrets = require('../../secrets/secrets.js');
var sequelize = new Sequelize(secrets.dbName, secrets.dbUser, secrets.dbPass, {
  host: 'localhost',
  dialect: 'mysql'
});


var Users = sequelize.define('users', {
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
  initials_done: {
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

var Types = sequelize.define('types', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  type: {
    type: Sequelize.STRING,
    unique: true
  },
}, {
  timestamps: true
}, {
  paranoid: true
});


var Funds = sequelize.define('funds', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  amount: {
    type: Sequelize.FLOAT(20, 2),
    allowNull: false
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  date: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  transferDetail: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  transferAccountId: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  typeId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  accountId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sourceId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
}, {
  timestamps: true
}, {
  paranoid: true
});


var UserAccounts = sequelize.define('useraccounts', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  account: {
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

var FundSources = sequelize.define('fundsources', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  source: {
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

var AccountTotals = sequelize.define('accounttotals', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  amount: {
    type: Sequelize.FLOAT(20, 2),
    allowNull: false
  },
  accountId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  typeId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
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
    type: Sequelize.FLOAT(20, 2),
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
  date: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  fromAccountId: {
    type: Sequelize.INTEGER,
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

var ExpensesCategories = sequelize.define('expensescategories', {
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

var CurrentAvailables = sequelize.define('currentavailables', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  amount: {
    type: Sequelize.FLOAT(20, 2),
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



Users.hasMany(Funds, {
  foreignKey: 'userId'
})

Users.hasMany(AccountTotals, {
  foreignKey: 'userId'
})

AccountTotals.belongsTo(Users, {
  foreignKey: 'userId'
});

AccountTotals.belongsTo(UserAccounts, {
  foreignKey: 'accountId'
});

AccountTotals.belongsTo(UserAccounts, {
  foreignKey: 'accountId'
});

AccountTotals.belongsTo(Types, {
  foreignKey: 'typeId'
});

UserAccounts.hasMany(AccountTotals, {
  foreignKey: 'accountId'
});


Types.hasMany(AccountTotals, {
  foreignKey: 'typeId'
});

Expenses.belongsTo(Users, {
  foreignKey: 'userId'
});

Users.hasMany(Expenses, {
  foreignKey: 'userId'
})

Users.hasMany(ExpensesCategories, {
  foreignKey: 'userId'
})

ExpensesCategories.belongsTo(Users, {
  foreignKey: 'userId'
})

CurrentAvailables.belongsTo(Users, {
  foreignKey: 'userId'
});

Users.hasOne(CurrentAvailables, {
  foreignKey: 'userId'
})

Types.hasMany(UserAccounts, {
  foreignKey: 'typeId'
})

// UserAccounts.hasOne(Types, {
//   foreignKey: 'id'
// })

UserAccounts.belongsTo(Users, {
  foreignKey: 'userId'
});

UserAccounts.hasMany(Funds, {
  foreignKey: 'accountId'
});

Funds.belongsTo(UserAccounts, {
  foreignKey: 'accountId'
});

FundSources.belongsTo(Users, {
  foreignKey: 'userId'
});

Users.hasMany(FundSources, {
  foreignKey: 'userId'
})

Users.hasMany(UserAccounts, {
  foreignKey: 'userId'
})

ExpensesCategories.hasMany(Expenses, {
  foreignKey: 'categoryId'
});

Expenses.belongsTo(ExpensesCategories, {
  foreignKey: 'categoryId'
});

FundSources.hasMany(Funds, {
  foreignKey: 'sourceId'
});

Funds.belongsTo(FundSources, {
  foreignKey: 'sourceId'
});

UserAccounts.hasMany(Funds, {
  foreignKey: 'accountId'
});

Funds.belongsTo(UserAccounts, {
  foreignKey: 'accountId'
});

Funds.belongsTo(Types, {
  foreignKey: 'typeId'
});

Types.hasMany(Funds, {
  foreignKey: 'typeId'
});


Users.sync().then(function() {
  Types.sync().then(function() {
    UserAccounts.sync().then(function() {
      FundSources.sync().then(function() {
        Funds.sync().then(function() {
          AccountTotals.sync().then(function() {
            ExpensesCategories.sync().then(function() {
              Expenses.sync().then(function() {
                CurrentAvailables.sync().then(function() {
                  defaults();
                  testData();
                })
              })
            })
          })
        })
      })
    })
  })
});

exports.AccountTotals = AccountTotals;
exports.CurrentAvailables = CurrentAvailables;
exports.Expenses = Expenses;
exports.ExpensesCategories = ExpensesCategories;
exports.UserAccounts = UserAccounts;
exports.Funds = Funds;
exports.FundSources = FundSources;
exports.Types = Types;
exports.Users = Users;
// // MAIN RETURN FOR SEQUELIZE CONNECTION. GOOD FOR RAW SQL QUERIES
// // with db.sql.query(add_raw_query_here)
exports.sequelize = sequelize;





// var Expenses = sequelize.define('expenses', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   comment: {
//     type: Sequelize.TEXT,
//     allowNull: true
//   },
//   categoryId: {
//     type: Sequelize.INTEGER,
//     allowNull: false
//   },
//   date: {
//     type: Sequelize.TEXT,
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var Savings = sequelize.define('savings', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   comment: {
//     type: Sequelize.TEXT,
//     allowNull: true
//   },
//   accountId: {
//     type: Sequelize.INTEGER,
//     allowNull: false
//   },
//   date: {
//     type: Sequelize.TEXT,
//     allowNull: false
//   },
//   transferDetail: {
//     type: Sequelize.TEXT,
//     allowNull: true
//   },
//   transferAccountId: {
//     type: Sequelize.INTEGER,
//     allowNull: true
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var Invest = sequelize.define('invest', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   comment: {
//     type: Sequelize.TEXT,
//     allowNull: true
//   },
//   accountId: {
//     type: Sequelize.INTEGER,
//     allowNull: false
//   },
//   date: {
//     type: Sequelize.TEXT,
//     allowNull: false
//   },
//   transferDetail: {
//     type: Sequelize.TEXT,
//     allowNull: true
//   },
//   transferAccountId: {
//     type: Sequelize.INTEGER,
//     allowNull: true
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var IncomeCategory = sequelize.define('incomecategory', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var ExpensesCategory = sequelize.define('expensescategory', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var CurrentTotalIncome = sequelize.define('currenttotalincome', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var CurrentTotalExpenses = sequelize.define('currenttotalexpenses', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var CurrentTotalSavings = sequelize.define('currenttotalsavings', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var CurrentTotalInvest = sequelize.define('currenttotalinvest', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var IncomeAccount = sequelize.define('incomeaccount', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   primary: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   },
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var SavingsAccount = sequelize.define('savingsaccount', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var InvestAccount = sequelize.define('investaccount', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   name: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// var CurrentAvailables = sequelize.define('currentavailables', {
//   id: {
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//     autoIncrement: true
//   },
//   amount: {
//     type: Sequelize.FLOAT(20, 2),
//     allowNull: false
//   },
//   deleted: {
//     type: Sequelize.BOOLEAN,
//     defaultValue: false
//   }
// }, {
//   timestamps: true
// }, {
//   paranoid: true
// });

// //Users have many Expenses, Expenses have one user
// Income.belongsTo(User, {
//   foreignKey: 'userId'
// });

// Users.hasMany(Funds, {
//   foreignKey: 'userId'
// })

// Users.hasMany(AccountTotals, {
//   foreignKey: 'userId'
// })

// AccountTotals.belongsTo(Users, {
//   foreignKey: 'userId'
// });

// IncomeCategory.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(IncomeCategory, {
//   foreignKey: 'userId'
// })


// Expenses.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(ExpensesCategory, {
//   foreignKey: 'userId'
// })

// ExpensesCategory.belongsTo(User, {
//   foreignKey: 'userId'
// })

// User.hasMany(Expenses, {
//   foreignKey: 'userId'
// })


// Savings.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(Savings, {
//   foreignKey: 'userId'
// })

// User.hasMany(Savings, {
//   foreignKey: 'userId'
// })


// Invest.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(Invest, {
//   foreignKey: 'userId'
// })

// User.hasMany(Invest, {
//   foreignKey: 'userId'
// })


// CurrentTotalIncome.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasOne(CurrentTotalIncome, {
//   foreignKey: 'userId'
// })

// CurrentTotalExpenses.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasOne(CurrentTotalExpenses, {
//   foreignKey: 'userId'
// })

// CurrentTotalSavings.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasOne(CurrentTotalSavings, {
//   foreignKey: 'userId'
// })

// CurrentTotalInvest.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasOne(CurrentTotalInvest, {
//   foreignKey: 'userId'
// })

// IncomeAccount.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(IncomeAccount, {
//   foreignKey: 'userId'
// })

// SavingsAccount.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(SavingsAccount, {
//   foreignKey: 'userId'
// })

// InvestAccount.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasMany(InvestAccount, {
//   foreignKey: 'userId'
// })

// CurrentAvailables.belongsTo(User, {
//   foreignKey: 'userId'
// });

// User.hasOne(CurrentAvailables, {
//   foreignKey: 'userId'
// })



// Users.sync().then(function() {
//   Types.sync().then(function() {
//       Funds.sync().then(function() {
//         AccountTotals.sync().then(function() {
//           testData()
//     //     Expenses.sync().then(function() {
//     //       Savings.sync().then(function() {
//     //         Invest.sync().then(function() {
//     //           CurrentTotalIncome.sync().then(function() {
//     //             CurrentTotalExpenses.sync().then(function() {
//     //               CurrentTotalSavings.sync().then(function() {
//     //                 CurrentTotalInvest.sync().then(function() {
//     //                   IncomeCategory.sync().then(function() {
//     //                     IncomeCategory.hasMany(Income, {
//     //                       foreignKey: 'categoryId'
//     //                     });
//     //                     Income.belongsTo(IncomeCategory, {
//     //                       foreignKey: 'categoryId'
//     //                     });
//     //                     ExpensesCategory.sync().then(function() {
//     //                       ExpensesCategory.hasMany(Expenses, {
//     //                         foreignKey: 'categoryId'
//     //                       });
//     //                       Expenses.belongsTo(ExpensesCategory, {
//     //                         foreignKey: 'categoryId'
//     //                       });
//     //                       InvestAccount.sync().then(function() {
//     //                         InvestAccount.hasMany(Invest, {
//     //                           foreignKey: 'accountId'
//     //                         });
//     //                         Invest.belongsTo(InvestAccount, {
//     //                           foreignKey: 'accountId'
//     //                         });
//     //                         IncomeAccount.sync().then(function() {
//     //                           IncomeAccount.hasMany(Income, {
//     //                             foreignKey: 'accountId'
//     //                           });
//     //                           Income.belongsTo(IncomeAccount, {
//     //                             foreignKey: 'accountId'
//     //                           });
//     //                           SavingsAccount.sync().then(function() {
//     //                             SavingsAccount.hasMany(Savings, {
//     //                               foreignKey: 'accountId'
//     //                             });
//     //                             Savings.belongsTo(SavingsAccount, {
//     //                               foreignKey: 'accountId'
//     //                             });
//     //                             CurrentAvailables.sync().then(function() {
//     //                               // testData();
//     //                             })
//     //                           })
//     //                         })
//     //                       })
//     //                     })
//     //                   })
//     //                 })
//     //               })
//     //             })
//     //           })
//     //         })
//       })
//     })
//   })
// });

// exports.Users = Users;
// exports.Types = Types;
// exports.Funds = Funds;
// exports.AccountTotals = AccountTotals;

// // exports.Savings = Savings;
// // exports.Invest = Invest;
// // exports.CurrentTotalIncome = CurrentTotalIncome;
// // exports.CurrentTotalExpenses = CurrentTotalExpenses;
// // exports.CurrentTotalSavings = CurrentTotalSavings;
// // exports.CurrentTotalInvest = CurrentTotalInvest;
// // exports.IncomeCategory = IncomeCategory;
// // exports.ExpensesCategory = ExpensesCategory;
// // exports.IncomeAccount = IncomeAccount;
// // exports.SavingsAccount = SavingsAccount;
// // exports.InvestAccount = InvestAccount;
// // exports.CurrentAvailables = CurrentAvailables;

// // MAIN RETURN FOR SEQUELIZE CONNECTION. GOOD FOR RAW SQL QUERIES
// // with db.sql.query(add_raw_query_here)
// exports.sequelize = sequelize;