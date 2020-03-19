import React from "react";
import { View, TouchableOpacity, Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import Home from './Home';
import Add from './Add';

import { style } from "../../assets/styles/mainStyles";

export default class Main extends React.Component {

  render() {
    return (
      <NavigationContainer>
        <View style={{backgroundColor: 'black', flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity style={{marginRight: 20, marginTop: 50}} onPress={() => this.props.onLogout()}>
            <Text style={{color:'white'}}>
              Log out
            </Text>
          </TouchableOpacity>
        </View>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="Home"
            options={{ headerShown: false }}
          >
            {props => <Home {...props} onLogout={this.props.onLogout}/>}
          </Stack.Screen>
          <Stack.Screen 
            name="Add"
            options={{ headerShown: false }}
          >
            {props => <Add {...props} onLogout={this.props.onLogout}/>}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}