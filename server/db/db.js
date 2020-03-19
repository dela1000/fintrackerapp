var Sequelize = require("sequelize");
var os = require('os');
var _ = require('lodash');

var testData = require("../test/testData.js").testData;
var defaults = require("./defaults.js").defaults;
var secrets = require('../../secrets/secrets.js');
// var sequelize = new Sequelize(secrets.dbName, secrets.dbUser, secrets.dbPass, {
//   host: 'localhost',
//   dialect: 'mysql'
// });

let env = os.hostname().indexOf("ip-172.31.26.6") > -1;

console.log("+++ 14 db.js env: ", env)

if(env !== true) {
    _.times(10, () => {
        console.log("++++++++++++++ db.js LOCAL ++++++++++++++")
    })
    sequelize = new Sequelize(secrets.dbName, secrets.dbUser, secrets.dbPass, {
        host: 'localhost',
        dialect: 'mysql'
    });
} else {
  _.times(10, () => {
      console.log("************************************************** db.js PRODUCTION **************************************************")
  })
  sequelize = new Sequelize(secrets.dbName, secrets.mysqRDSlUser, secrets.mysqlRDSPass, {
      host: RDSEndpoint,
      port: 3306,
      dialect: 'mysql',
      logging: console.log,
      maxConcurrentQueries: 100,
      dialectOptions: {
          ssl:'Amazon RDS'
      },
      pool: { maxConnections: 5, maxIdleTime: 30},
      language: 'en',
      timeout: 60000
  });
}


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
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
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
  accountId: {
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

UserAccounts.belongsTo(Types, {
  foreignKey: 'typeId'
});

Types.hasMany(UserAccounts, {
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

UserAccounts.belongsTo(Users, {
  foreignKey: 'userId'
});

UserAccounts.hasMany(Funds, {
  foreignKey: 'accountId'
});

Funds.belongsTo(UserAccounts, {
  foreignKey: 'accountId'
});

UserAccounts.hasMany(Expenses, {
  foreignKey: 'accountId'
});

Expenses.belongsTo(UserAccounts, {
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


