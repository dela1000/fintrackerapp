var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var secrets = require('../../secrets/secrets.js');

//Creates token
exports.createToken = function(req, res, isUser, callback) {
  var token = jwt.encode({ "userId": isUser.dataValues.id, "username": isUser.dataValues.username }, secrets.magicWords);
  callback(token, isUser.dataValues.username);
}

// Login Checks
var isLoggedIn = function(token) {
  try {
    var hash = jwt.decode(token, secrets.magicWords);
    if (!!hash.userId) {
      return hash;
    }
  } catch (error) {
    return false;
  }
}

// Reroute based on Auth status
exports.checkUser = function(req, res, next) {
  var token = req.headers[secrets.tokenName];
  if (!token) {
    res.status(200).send({
      success: false,
      data: {
        message: "No token detected"
      }
    })
  } else {
    var isloggedIn = isLoggedIn(token)
    if (isloggedIn.userId && isloggedIn.username) {
      req.headers['userId'] = isloggedIn.userId;
      req.headers['username'] = isloggedIn.username;
      next()
    } else {
      res.status(200).json({
        success: false,
        data: {
          message: "Unathorized user token"
        }
      })
    }
  }
}

exports.createPasswordHash = function(password, callback) {
  bcrypt.hash(password, secrets.crypticRounds)
    .then(function(hash) {
      callback(hash)
    });
}

exports.checkPasswordHash = function(password, hash, callback) {
  bcrypt.compare(password, hash)
    .then(function(res) {
      callback(res)
    });
}