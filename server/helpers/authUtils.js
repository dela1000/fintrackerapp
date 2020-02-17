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
  console.log("+++ 25 authUtils.js req.headers: ", req.headers)
  var token = req.headers[secrets.tokenName];
  if (!token) {
    res.status(200).send({
      success: false,
      data: { message: "No token detected" }
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
        data: { message: "Unathorized user token" }
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

exports.commonPassword = [ '12345678', '01234567', '11111111', '12121212', '23232323', '00000000', 'password', 'password1', 'password123', 'Passw0rd', 'PASSW0RD', 'PASSW0RD123', 'PASSW0RD1', 'PASSW0RD2', 'PASSW0RD3', 'Password123', '1234567890', '0123456789', 'qwerty12', 'qwerty123', 'qwerty1234', 'password111', 'abcd1234', 'ABCD1234', 'freepass', 'aaaaaaaa', 'password', '123456789', 'sunshine','iloveyou', 'princess', 'admin123', 'admin111', 'admin222', 'admin333', 'admin444', 'welcome1', '66666666', 'abc12345', 'football', '123123123', 'monkey12', 'monkey1212', 'monkey1234', '87654321', '!@#$%^&*', 'charlie1', 'aa123456', 'donald1',]