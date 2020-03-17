import React from 'react';
import { StyleSheet, View, Image, Text, KeyboardAvoidingView, StatusBar, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { constants } from "../helpers/constants";
import { onSignIn } from "../helpers/auth";
// import Loader from '../helpers/Loader';

import { style } from "../../assets/styles/signinStyles";

export default class Login extends React.Component {

  state = {
    username: '',
    password: '',
    loading: false,
    url: null,
  };
  
  login = async () => {
    if(!this.state.username || !this.state.password) {
      Alert.alert( 'Please include a username and password', 'Press ok to try again', [ {text: 'OK'} ], { cancelable: false } )
      return;
    };

    this.setState({ loading: true });

    try {
      let url = await constants();
      this.setState({ url: url })
    } 
    catch (error) {
      this.setState({ loading: false });
      console.log("error: ", error)
    }
    const link = this.state.url.urlBase + '/login';

    let proceed = false;
    fetch(link, {
        method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: this.state.username, password: this.state.password })
      })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.code === 200) {
          this.setState({ loading: false }, () => {
            let signedIn = onSignIn(result.username, result.userId, result['beeroclock-token'], result.drinkType)
            if(signedIn) {
              this.props.onLogin();
            } else {
              this.setState({ loading: false, password: '' }, () => {
                setTimeout(() => {
                    Alert.alert('There has been a problem','Press ok and try again',[{text: 'Ok'},],{ cancelable: false })
                  }
                , 100);
              });
            }
          })
        } else {
          this.setState({ loading: false, password: '' }, () => {
            setTimeout(() => {
                Alert.alert(result.message,'Credentials are case sensitive. \n Press ok and try again',[{text: 'Ok'},],{ cancelable: false })
              }
            , 100);
          });

        }
      })
      .catch((err) => {
        this.setState({ loading: false,  password: '' }, () => {
          setTimeout(() => {
              Alert.alert('There has been a problem','Press ok and try again',[{text: 'Ok'},],{ cancelable: false })
              throw err;
            }
          , 100);
        })


      });
  }

  render() {
    return (
      <KeyboardAvoidingView behavior="padding" style = { style.loginContainer }>
        {/*this.state.loading && <Loader loading={this.state.loading}/>*/}
        <StatusBar  barStyle="light-content" />
        <Animatable.View 
          animation="bounceInDown" 
          easing="ease-in"
          duration={2000}
          style = { style.logoContainer }>
          <Text style = { style.titleFont } >FinTracker</Text> 
        </Animatable.View>
        <View style = { style.formContainer }>
          <TextInput 
            placeholder="Username"
            placeholderTextColor="rgba(255,255,255,0.7)"
            underlineColorAndroid="transparent"
            keyboardType="default"
            returnKeyType="next"
            style={style.input}
            onSubmitEditing={() => this.passwordInput.focus()} 
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={(value) => this.setState({username: value.replace(/\s/g, '')})}
            value={this.state.username}
          />
          <TextInput 
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            underlineColorAndroid="transparent"
            keyboardType="default"
            returnKeyType="go"
            style={style.input} 
            autoCapitalize="none"
            ref={(input) => this.passwordInput = input }
            onSubmitEditing={this.login.bind()}
            onChangeText={(value) => this.setState({password: value.replace(/\s/g, '')})}
            value={this.state.password}
          />
          {/*
            <TouchableOpacity style={style.recoveryHolder} onPress={this.props.onPasswordRecovery}>
              <Text style={[style.floatRight, style.buttonText, style.smallFont]}>
                Forgot password
              </Text>
            </TouchableOpacity>
          */}
          
          <TouchableOpacity style={style.buttonContainer} onPress={this.login.bind()}>
            <Text style={[style.buttonText, style.centerText]}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}