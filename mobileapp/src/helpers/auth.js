import { AsyncStorage } from "react-native";

// AsyncStorage.removeItem('username')
//     .then(res => { console.log("+++ 5 auth.js username res: ", res)})
// AsyncStorage.removeItem('token')
//     .then(res => { console.log("+++ 9 auth.js token res: ", res)})
// AsyncStorage.removeItem('userId')
//     .then(res => { console.log("+++ 13 auth.js userId res: ", res)})
// AsyncStorage.removeItem('signedIn')
//     .then(res => { console.log("+++ 17 auth.js signedIn res: ", res)})
// AsyncStorage.removeItem('drinkType')
//     .then(res => { console.log("+++ 21 auth.js drinkType res: ", res)})

export const onSignIn = async (username, userId, token, drinkType, fbToken, fbId) => {
  AsyncStorage.setItem('username', username.toString());
  AsyncStorage.setItem('token', token.toString());
  AsyncStorage.setItem('userId', userId.toString());
  AsyncStorage.setItem('drinkType', drinkType.toString());
  AsyncStorage.setItem('fbToken', fbToken.toString());
  AsyncStorage.setItem('fbId', fbId.toString())
  AsyncStorage.setItem('signedIn', 'true');
  return true;
};

export const onSignOut = () => {
  AsyncStorage.clear();
  return true;
};

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('signedIn')
      .then(res => {
        if (res) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};

export const fetchData = async () => {
  const userId = await AsyncStorage.getItem('userId');
  const token = await AsyncStorage.getItem('token');
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    userid: userId,
    'beeroclock-token': token,
  }
}
