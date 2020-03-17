import React, { Component } from 'react';
import { StyleSheet, StatusBar, Text, View, Platform, YellowBox } from 'react-native';

import { AppLoading, Font } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import { isSignedIn, onSignOut } from "./src/helpers/auth";

import Login from './src/loginComponents/Login';

export default class App extends Component {

  state = {
    viewSelected: "notLoggedIn",
    loaded: false,
    currentUser: null
  }

  // Load fonts here
  loadFontsAsync = async () => {
    // await Font.loadAsync({pacifico: require('./assets/fonts/Pacifico-Regular.ttf')});
    // await Font.loadAsync({arimo: require('./assets/fonts/Arimo-Regular.ttf')});
    this.setState({ loaded: true });
  }

  componentDidMount() {
    isSignedIn()
      .then((res) => {
        if(res) {
          this.setState({ viewSelected: "loggedIn" })
        }
      })
      .catch(err => alert("An error occurred"));
    // loads fonts
    this.loadFontsAsync();
  }

  onLogin = (userData) => {
    this.setState({currentUser: userData, viewSelected: "loggedIn"})
  }

  onLogout = (userData) => {
    if(onSignOut()){
      this.setState({currentUser: null, viewSelected: "notLoggedIn"})
    } else {
      alert("An error occurred");
    }
  }

  render() {
    if (!this.state.loaded) {
        return <AppLoading />;
    }
    if(this.state.viewSelected === "notLoggedIn") {
      return (
        <View style={{flex: 1}}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Login" component={Login} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      )
    }
  }
}