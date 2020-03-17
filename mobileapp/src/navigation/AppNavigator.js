import React from 'react';
import { ActivityIndicator, AsyncStorage, Button, StatusBar, View } from 'react-native';

// import { createSwitchNavigator, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { style } from "../../assets/styles/signinStyles";


import Login from '../loginComponents/Login';


class LoginScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  render() {
    return <Login />
  }
  onLogin = () => {
    // this.props.navigation.navigate('App'); };
  }
}

// Auth Loading Screen
// class AuthLoadingScreen extends React.Component {
//   constructor() {
//     super();
//     this.checkLoginStatus();
//   }
//   checkLoginStatus = async () => {
//     const userToken = await AsyncStorage.getItem('signedIn');
//     this.props.navigation.navigate(userToken ? 'App' : 'Auth');
//   };

//   render() {
//     return (
//       <View style={style.container}>
//         <ActivityIndicator />
//       </View>
//     );
//   }
// }

// const AuthStack = createStackNavigator({ Login: Login });

// export default createAppContainer(createSwitchNavigator(
//   {
//     AuthLoading: AuthLoadingScreen,
//     Auth: AuthStack,
//   },
//   {
//     initialRouteName: 'AuthLoading',
//   }
// ));