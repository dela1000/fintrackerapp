import React, { Component } from 'react';
import { StyleSheet, StatusBar, Text, View, Platform, YellowBox, TouchableOpacity } from 'react-native';

import { AppLoading, Font } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import { isSignedIn, onSignOut } from "./src/helpers/auth";

import Login from './src/loginComponents/Login';
import Main from './src/appComponents/Main';

YellowBox.ignoreWarnings(['Warning', 'Warning: isMounted(...) is deprecated', 'Possible Unhandled Promise Rejection', "Warning: Can't call setState", 'VirtualizedLists']);

export default class App extends Component {

  state = {
    viewSelected: "notLoggedIn",
    loaded: false,
    currentUser: {}
  }

  // Load fonts here
  loadFontsAsync = async () => {
    // await Font.loadAsync({pacifico: require('./assets/fonts/Pacifico-Regular.ttf')});
    // await Font.loadAsync({arimo: require('./assets/fonts/Arimo-Regular.ttf')});
    this.setState({ loaded: true });
  }

  componentDidMount() {
    isSignedIn()
      .then(res => {
        if(res.success) {
          let currentUser = res.currentUser;
          currentUser.initials_done = JSON.parse(currentUser.initials_done);
          currentUser.signedIn = JSON.parse(currentUser.signedIn);
          currentUser.userId = Number(currentUser.userId);
          this.setState({ viewSelected: "loggedIn", currentUser })
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
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen 
                name="Login"
                options={{ headerShown: false }}
              >
                {props => <Login onLogin={this.onLogin}/>}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      )
    }
    if(this.state.viewSelected === "loggedIn") {
      if(this.state.currentUser.initials_done){
        return (
          <Main onLogout={this.onLogout}/>
        )
      } else {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>
              Welcome!
            </Text>
            <Text>
              Looks like you haven't added any initial amounts to your account. Please go to THE WEBSITE and add those there to use the app.
            </Text>
            <TouchableOpacity onPress={this.onLogout.bind()}>
              <Text >
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        )
      }
    }
  }
}