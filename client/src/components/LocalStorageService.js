const LocalStorageService = (function() {
  var service;

  function getService() {
    if (!service) {
      service = this;
      return service
    }
    return service
  }

  function setToken(token) {
    localStorage.setItem(process.env.REACT_APP_TOKEN, token);
  }

  function getAccessToken() {
    return localStorage.getItem(process.env.REACT_APP_TOKEN);
  }

  function clearToken() {
    localStorage.removeItem(process.env.REACT_APP_TOKEN);
  }
  return {
    getService: getService,
    setToken: setToken,
    getAccessToken: getAccessToken,
    clearToken: clearToken
  }
})();
export default LocalStorageService;