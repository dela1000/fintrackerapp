import { AsyncStorage } from "react-native";

export const onSignIn = async (data) => {
  AsyncStorage.setItem('username', data.username.toString());
  AsyncStorage.setItem('token', data.fintracktoken.toString());
  AsyncStorage.setItem('userId', data.userId.toString());
  AsyncStorage.setItem('initials_done', data.initials_done.toString());
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
          AsyncStorage.getAllKeys()
            .then(keys => {
              AsyncStorage.multiGet(keys)
                .then(itemsArray => {
                  let currentUser = {};
                  itemsArray.map(item => {
                    currentUser[`${item[0]}`] = item[1]
                  })
                  resolve({success: true, currentUser: currentUser});
                })
            })
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};

export const fetchData = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'fintracktoken': token,
  }
}


export const getAsyncStorageItem = (item) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(item)
      .then(res => {
        if (res) {
          resolve(res);
        } else {
          resolve(res);
        }
      })
      .catch(err => reject(err));
  });
};