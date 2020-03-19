import React, { Component } from "react";
import { ScrollView, KeyboardAvoidingView, StatusBar, View, Text, TouchableOpacity, FlatList } from "react-native";
import moment from 'moment';

import { fetchData } from "../helpers/auth";
import { constants } from "../helpers/constants";


import { style } from "../../assets/styles/mainStyles";
import { capitalize, decimals } from "../helpers/formatting";
import Loader from "../helpers/Loader.js";

export default class Home extends React.Component {

  state = {
    loading: false,
    headers: null,
    url: null,
    currentAvailable: 0,
    totalExpenses: 0,
    accounts: [],
    expenses: []
  };

  componentDidMount() {
    this.loadMainData()
  }

  loadMainData = async () => {
    this.setState({ loading: true });
    try {
      let url = await constants();
      let headers = await fetchData();
      this.setState({ url, headers })
    } catch (error) {
      this.setState({ loading: false });
      console.log("error: ", error)
    }
    const link = this.state.url.urlBase + '/mobile_main_data';
    fetch(link, {
        method: 'GET',
        headers: this.state.headers
      })
      .then((response) => {
        return response.json();
      })
      .then(result => {
        if (result.success) {
          this.setState({
            currentAvailable: result.data.currentAvailable.amount,
            totalExpenses: result.data.totalExpenses,
            accounts: result.data.accounts,
            expenses: result.data.expenses
          })
        }
        this.setState({ loading: false });
      })
  }

  render() {
    const { navigation } = this.props;
    return (
      <KeyboardAvoidingView behavior="padding" style = { style.mainContainer }>
        <StatusBar barStyle="light-content" />
        <Loader loading={this.state.loading}/>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'stretch',
          height:"100%", 
          width:"100%",
          paddingVertical: 20
        }}>
          <View style={{height: 'auto'}}>
            <View>
              <Text style={style.largeText}>Current Available</Text> 
              <Text style={style.mediumText}>${this.state.currentAvailable} </Text> 
              <Text style={style.largeText}>Monthly Total</Text> 
              <Text style={style.mediumText}>${this.state.totalExpenses} </Text> 
            </View>
          </View>
          <View> 
            <Text style={[style.smallText, style.bold]}>{moment().format('MMMM')} Expenses</Text> 
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
              <View style={{ flex: 2, alignSelf: 'stretch' }}>
                <Text style={[style.tinyText, style.bold]}>
                Date
                </Text>
              </View>
              <View style={{ flex: 2, alignSelf: 'stretch', paddingRight: 5 }}>
                <Text style={[style.tinyText, style.bold]}>
                Comment
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: 'stretch', paddingRight: 5 }}>
                <Text style={[style.tinyText, style.bold]}>
                Name
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: 'stretch', paddingRight: 5 }}>
                <Text style={[style.tinyText, style.bold]}>
                Account
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: 'stretch'}}>
                <Text style={[style.tinyText, style.floatRight, style.bold]}>
                Amount
                </Text>
              </View>
            </View>
          </View>
          <ScrollView style={style.scrollView}>
            <FlatList
              data={this.state.expenses}
              renderItem={({item, i}) => 
                <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                  <View style={{ flex: 2, alignSelf: 'stretch' }}>
                    <Text style={style.tinyText}>
                    {item.date}
                    </Text>
                  </View>
                  <View style={{ flex: 2, alignSelf: 'stretch', paddingRight: 5 }}>
                    <Text style={style.tinyText}>
                    {item.comment}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'stretch', paddingRight: 5 }}>
                    <Text style={style.tinyText}>
                    {capitalize(item.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'stretch', paddingRight: 5 }}>
                    <Text style={style.tinyText}>
                    {capitalize(item.account)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'stretch'}}>
                    <Text style={[style.tinyText, style.floatRight]}>
                    {decimals(item.amount)}
                    </Text>
                  </View>
                </View>
              }
            >
            </FlatList>
          </ScrollView>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={[style.buttonContainer, style.transitionButton]}
            onPress={() => navigation.navigate('Add', {
                loadMainData: this.loadMainData
              }
            )}
          >
            <Text style={[style.buttonText, style.centerText]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }
}