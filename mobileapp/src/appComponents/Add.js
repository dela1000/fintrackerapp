import React, 
{ Component } from "react";
import { ScrollView, KeyboardAvoidingView, StatusBar, View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";

import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import moment from 'moment';
import _ from 'lodash';

import { fetchData } from "../helpers/auth";
import { constants } from "../helpers/constants";
import { capitalize, decimals } from "../helpers/formatting";
import Loader from "../helpers/Loader.js";

import { style } from "../../assets/styles/mainStyles";

export default class Add extends React.Component {

  state = {
    categories: [],
    accounts: [],
    sources: [],
    expensesButtonStyle: style.activeButton,
    fundsButtonStyle: style.inactiveButton,
    type: 'expenses',
    amount: 0,
    comment: "",
    date: new Date(),
    categorySelected:{
      label: ""
    },
    accountSelected:{
      label: ""
    },
    sourceSelected: {
      label: ""
    }
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.loadUserTypeData();
  }

  loadUserTypeData = async () => {
    this.setState({ loading: true });
    try {
      let url = await constants();
      let headers = await fetchData();
      this.setState({ url, headers })
    } 
    catch (error) {
      this.setState({ loading: false });
      console.log("error: ", error)
    }
    const link = this.state.url.urlBase + '/all_user_data_types';
    fetch(link, {
        method: 'GET',
        headers: this.state.headers
      })
      .then((response) => {
        return response.json();
      })
      .then(result => {
        if(result.success){
          let categories = this.formatForDropDown(result.data.expensesCategories, 'categories');
          let accounts = this.formatForDropDown(result.data.accounts, 'accounts');
          let sources = this.formatForDropDown(result.data.fundSources, 'sources');
          this.setState({ categories, accounts, sources, rawAccounts: result.data.accounts })
        }
        this.setState({ loading: false });
      })
  }

  formatForDropDown = (data, type) => {
    let formattedData = [];
    let label = "";
    _.forEach(data, item => {
      let primary = false;
      if(type === 'categories') {
        label = capitalize(item.name);
      }
      if(type === 'accounts') {
        label = capitalize(item.account) + " - " + capitalize(item.type);
        if(item.primary){
          primary = true;
        }
      }
      if(type === 'sources') {
        label = capitalize(item.source);
      }
      let dropDownItem = {
        label: label,
        value: item.id
      };
      formattedData.push(dropDownItem)
      if(primary){
        this.setState({accountSelected: dropDownItem})
      }
    })
    return formattedData;
  }


  changeType = (type) => {
    this.setState({type})
    if(type === 'expenses'){
      this.setState({
        expensesButtonStyle: style.activeButton, 
        fundsButtonStyle: style.inactiveButton,
        type: 'expenses'
      })
    }
    if(type === 'funds'){
      this.setState({
        expensesButtonStyle: style.inactiveButton, 
        fundsButtonStyle: style.activeButton,
        type: 'funds'
      })
    }
  }

  onDateChange = (event, selectedDate) => {
    this.setState({date: selectedDate})
  };

  onAmountChange = (num) => {
    let newNum = '';
    let numbers = '0123456789.';
    _.forEach(num, (n) => {
      if (numbers.indexOf(n) > -1) {
        newNum = newNum + n;
      }
    })
    this.setState({ amount: newNum });
  }
  onCommentChange = (text) => {
    this.setState({ comment: text });
  }

  changeDropdown = (value, type) => {
    if(!value){
      return
    }
    if(type === "categories"){
      let categorySelected = this.state.categories.find(x => x.value === value);
      this.setState({categorySelected})
    }
    if(type === "accounts"){
      let accountSelected = this.state.accounts.find(x => x.value === value);
      this.setState({accountSelected})
    }
    if(type === "sources"){
      let sourceSelected = this.state.sources.find(x => x.value === value);
      this.setState({sourceSelected})
    }
  }


  submit = () => {
    let payload = [];
    if(this.state.date && (this.state.amount > 0 || this.state.amount < 0)){
      if(this.state.type === "expenses"){
        if(this.state.categorySelected.value && this.state.accountSelected.value){
          this.setState({ loading: true });
          let amount = Number(this.state.amount);
          payload.push({
            amount: Number(amount), 
            comment: this.state.comment || "", 
            categoryId: this.state.categorySelected.value, 
            accountId: this.state.accountSelected.value,
            date: moment(this.state.date).format('MM-DD-YYYY'), 
          });
          const link = this.state.url.urlBase + '/expenses_bulk';
          fetch(link, {
              method: 'POST',
              headers: this.state.headers,
              body: JSON.stringify(payload)
            })
            .then((response) => {
              return response.json();
            })
            .then(result => {
              if(result.success){
                this.props.route.params.loadMainData();
                this.props.navigation.navigate('Home');
              } else{
                console.log("+++ 181 Add.js result: ", result)
              };
              this.setState({ loading: false });
            })
        }
      }
      if(this.state.type === "funds"){
        if(this.state.sourceSelected.value && this.state.accountSelected.value){
          let accountSelected = this.state.rawAccounts.find(x => x.id === this.state.accountSelected.value);
          this.setState({ loading: true });
          let amount = Number(this.state.amount);
          payload.push({
            amount: Number(amount), 
            comment: this.state.comment || "", 
            sourceId: this.state.sourceSelected.value, 
            typeId: accountSelected.typeId,
            accountId: accountSelected.id,
            date: moment(this.state.date).format('MM-DD-YYYY'), 
          });
          console.log("+++ 202 Add.js payload: ", payload)
          const link = this.state.url.urlBase + '/funds_bulk';
          fetch(link, {
              method: 'POST',
              headers: this.state.headers,
              body: JSON.stringify(payload)
            })
            .then((response) => {
              return response.json();
            })
            .then(result => {
              if(result.success){
                this.props.route.params.loadMainData();
                this.props.navigation.navigate('Home');
              } else{
                console.log("+++ 181 Add.js result: ", result)
              };
              this.setState({ loading: false });
            })
        }
      }
    } 
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
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={style.mediumText}>
              Add {capitalize(this.state.type)}
            </Text>
          </View>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity 
              style={[style.buttonContainer, style.addButton, this.state.expensesButtonStyle]}
              onPress={() => this.changeType('expenses')}
            >
              <Text style={[style.buttonText, style.centerText]}>
                Expenses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[style.buttonContainer, style.addButton, this.state.fundsButtonStyle]}
              onPress={() => this.changeType('funds')}
            >
              <Text style={[style.buttonText, style.centerText]}>
                Funds
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={style.scrollView}>
            <View style={{marginBottom: 10, borderRadius: 10 }}>
              <Text style={style.smallText}>
                Date*
              </Text>
              <DateTimePicker
                style={{backgroundColor: 'white', borderRadius: 10}}
                timeZoneOffsetInMinutes={0}
                value={this.state.date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={this.onDateChange}
              />
            </View>
            <View>
              <Text style={style.smallText}>
                Amount*
              </Text>
              <TextInput 
                // autoFocus
                placeholder="Amount"
                placeholderTextColor="rgba(255,255,255,0.7)"
                underlineColorAndroid="transparent"
                style={style.input}
                keyboardType="decimal-pad"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.onAmountChange}
                value={this.state.amount}
              />
            </View>
            <View>
              <Text style={style.smallText}>
                Comment
              </Text>
              <TextInput 
                placeholder="Comment"
                placeholderTextColor="rgba(255,255,255,0.7)"
                underlineColorAndroid="transparent"
                style={style.input}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.onCommentChange}
                value={this.state.comment}
              />
            </View>
            <View style={this.state.type === "expenses" ? {marginBottom: 10} : {display: "none"}}>
              <Text style={style.smallText}>
                Category*
              </Text>
              <RNPickerSelect
                placeholder="Select a category"
                items={this.state.categories}
                onValueChange={(value) => this.changeDropdown(value, "categories")}
                style={pickerSelectStyles}
                value={this.state.categorySelected.value}
              />
            </View>
            <View style={this.state.type === "funds" ? {marginBottom: 10} : {display: "none"}}>
              <Text style={style.smallText}>
                Source*
              </Text>
              <RNPickerSelect
                placeholder="Select a source"
                items={this.state.sources}
                onValueChange={(value) => this.changeDropdown(value, "sources")}
                style={pickerSelectStyles}
                value={this.state.sourceSelected.value}
              />
            </View>
            <View style={{marginBottom: 10}}>
              <Text style={style.smallText}>
                Account*
              </Text>
              <RNPickerSelect
                placeholder="Select an account"
                items={this.state.accounts}
                onValueChange={(value) => this.changeDropdown(value, "accounts")}
                style={pickerSelectStyles}
                value={this.state.accountSelected.value}
              />
            </View>
          </ScrollView>
        </View>
        
        {/*Footer Buttoms */}
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={[style.buttonContainer, style.cancelButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[style.buttonText, style.centerText]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[style.buttonContainer, style.addButton, style.activeButton]}
            onPress={() => this.submit()}
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#313131',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});