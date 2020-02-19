import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import MainPanel from './MainPanel.js';
import { get_all_totals, all_user_data_types, get_expenses, get_funds } from "../Services/WebServices";


class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTotals: {
        availableByAccount: {
          checking: [],
          savings: [],
          investments: [],
        },
        expensesByCategory: [],
        fundsByTypes: [],
      },
      expensesData: [],
      expensesCategories: [],
      fundSources: [],
      userAccounts: [],
      viewSelected: "expenses"
    };
    this.getExpenses = this.getExpenses.bind(this);
    this.getFunds = this.getFunds.bind(this);
    this.selectAccount = this.selectAccount.bind(this);
    this.selectCategory = this.selectCategory.bind(this);
    this.selectType = this.selectType.bind(this);
  }

  static propTypes = {
    allTotals: PropTypes.object,
    expensesData: PropTypes.array,
  };

  componentDidMount() {
    this.getAllTotals();
    this.getUserDataTypes();
    this.getExpenses();
  };

 getAllTotals (){
  get_all_totals()
    .then((res) => {
      var data = res.data;
      if(data.success){
        this.setState({ allTotals: data.data })
      }
    })
 }

 getUserDataTypes(){
  all_user_data_types()
    .then((res) => {
      var data = res.data;
      if(data.success){
        this.setState({ 
          userAccounts: data.data.accounts,
          fundSources: data.data.fundSources,
          expensesCategories: data.data.expensesCategories,
        })
      }
    })
 }

 getExpenses(){
   get_expenses()
     .then((res) => {
      
       var data = res.data;
       if(data.success){ this.setState({ expensesData: data.data, viewSelected: "expenses"}) }
     })
     .catch((err) => {
      console.log("+++ 50 Main.js err: ", err)
     })
 }

 getFunds(){
   get_funds()
     .then((res) => {
       var data = res.data;
       if(data.success){ this.setState({ expensesData: data.data, viewSelected: "funds"}) }
     })
     .catch((err) => {
      console.log("+++ 61 Main.js err: ", err)
     })
 }

  selectAccount(item){
    console.log("+++ 53 Main.js item: ", item)
  }

  selectCategory(item){
    console.log("+++ 57 Main.js item: ", item)
  }

  selectType(item){
    console.log("+++ 61 Main.js item: ", item)
  }

  render () {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          <MainPanel
            logout={this.props.logout}
            viewSelected={this.viewSelected}
            availableByAccount={this.state.allTotals.availableByAccount}
            expensesByCategory={this.state.allTotals.expensesByCategory}
            userAccounts={this.state.userAccounts}
            fundSources={this.state.fundSources}
            expensesCategories={this.state.expensesCategories}
            expensesData={this.state.expensesData}
            totalExpenses={this.state.allTotals.totalExpenses}
            currentAvailable={this.state.allTotals.currentAvailable}
            timeframe={this.state.allTotals.timeframe}
            selectAccount={this.selectAccount}
            selectCategory={this.selectCategory}
            selectType={this.selectType}
            getExpenses={this.getExpenses}
            getFunds={this.getFunds}
          />
        </Grid>
       </Grid>
    )
  }
}

export default Main;