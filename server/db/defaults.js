var db = require('../db/db.js');
var _ = require('lodash');
var Promise = require('bluebird');

exports.defaults = function() {
  db.Types.findOne({
    name: "income"
  })
  .then(function(found) {
    if (!found) {
      var types = [{
        name: "initials"
      },
      {
        name: "incomes"
      },
      {
        name: "savings"
      },
      {
        name: "investments"
      },
      {
        name: "transfers"
      }]
      var allTypes = [];
      _.each(types, function(category) {
        allTypes.push(db.Types.create({
          name: category.name,
          userId: 1
        }))
      })

      Promise.all([
        allTypes,
      ])
      .then(function() {
        console.log("created defaults")
      })
    }
  })
}