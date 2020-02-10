var db = require('../db/db.js');
var _ = require('lodash');
var Promise = require('bluebird');

exports.defaults = function() {
  db.Types.findOne({
    type: "income"
  })
  .then(function(found) {
    if (!found) {
      var types = [{
        type: "incomes"
      },
      {
        type: "savings"
      },
      {
        type: "investments"
      },
      {
        type: "transfers"
      }]
      var allTypes = [];
      _.each(types, function(category) {
        allTypes.push(db.Types.create({
          type: category.type
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