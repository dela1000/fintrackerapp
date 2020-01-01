var jwt  = require('jwt-simple');
var secrets = require('../../secrets/secrets.js');

var decodeToken = exports.decodeToken = function(request){
  return jwt.decode(request.headers[secrets.tokenName], secrets.magicWords);
}

//Creates token
exports.createToken = function(request, response, isUser, callback) {
  var token = jwt.encode({"userId": isUser.dataValues.id, "username": isUser.dataValues.username}, secrets.magicWords);
  callback(token, isUser.dataValues.username);
}

// Login Checks
var isLoggedIn = function(token) {
  var hash = jwt.decode(token, secrets.magicWords);
  console.log("+++ 19 utils.js hash: ", hash)
  return !!hash.userId;
}

// Reroute based on Auth status
exports.checkUser = function(request, response, next) {
  var token = request.headers[secrets.tokenName];
  if (!token || (token === "undefined")){
    response.status(401).send("No token detected")
  } else {
    if (isLoggedIn(token)){
      next()
    } else {
      response.sendStatus(401);
    }
  }
}
