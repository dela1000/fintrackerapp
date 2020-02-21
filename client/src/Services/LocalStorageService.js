const LocalStorageService = (function() {
  var service;

  function getService() {
    if (!service) {
      service = this;
      return service
    }
    return service
  }

  function setToken(data) {
    localStorage.setItem(process.env.REACT_APP_TOKEN, data.token);
    localStorage.setItem(process.env.REACT_APP_USERNAME, data.username);
    localStorage.setItem(process.env.REACT_APP_ID, data.userId);
    localStorage.setItem(process.env.REACT_APP_INITIALS, data.initial_done);
    localStorage.setItem(process.env.REACT_APP_EMAIL, data.userEmail);
  }

  function getAccessToken() {
    var token = localStorage.getItem(process.env.REACT_APP_TOKEN);
    return token;
  }

  function getUserData() {
    return {
      username: localStorage.getItem(process.env.REACT_APP_USERNAME),
      userId: localStorage.getItem(process.env.REACT_APP_ID),
      initial_done: localStorage.getItem(process.env.REACT_APP_INITIALS),
      userEmail: localStorage.getItem(process.env.REACT_APP_EMAIL),
    }
  }

  function clearToken() {
    localStorage.removeItem(process.env.REACT_APP_TOKEN);
    localStorage.removeItem(process.env.REACT_APP_USERNAME);
    localStorage.removeItem(process.env.REACT_APP_ID);
    localStorage.removeItem(process.env.REACT_APP_INITIALS);
    localStorage.removeItem(process.env.REACT_APP_EMAIL);
  }
  return {
    getService: getService,
    setToken: setToken,
    getAccessToken: getAccessToken,
    getUserData: getUserData,
    clearToken: clearToken
  }
})();

export default LocalStorageService;