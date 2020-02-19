import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import MainPanel from './MainPanel.js';
import { get_expenses, get_all_totals } from "../Services/WebServices";


class Main extends React.Component {
  state = {
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
  };

  static propTypes = {
    allTotals: PropTypes.object,
    expensesData: PropTypes.array,
  };

  componentDidMount() {
    this.expenses();
    this.all_totals();
  };

 all_totals (){
  get_all_totals()
    .then((res) => {
      var data = res.data;
      if(data.success){
        this.setState({ allTotals: data.data })
      }
    })
 }

 expenses(){
   get_expenses()
     .then((res) => {
       var data = res.data;
       if(data.success){
         this.setState({ expensesData: data.data })
       }
     })
 }

  selectAccount(item){
    console.log("+++ 67 Main.js item: ", item)
  }

  render () {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          <MainPanel
            logout={this.props.logout}
            availableByAccount={this.state.allTotals.availableByAccount}
            expensesByCategory={this.state.allTotals.expensesByCategory}
            expensesData={this.state.expensesData}
            totalExpenses={this.state.allTotals.totalExpenses}
            timeframe={this.state.allTotals.timeframe}
            selectAccount={this.selectAccount}
          />
        </Grid>
       </Grid>
    )
  }
}

export default Main;