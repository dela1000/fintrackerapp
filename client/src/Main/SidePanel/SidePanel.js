import React from 'react';
import _ from 'lodash'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SidePanelAccount from './SidePanelAccount.js';
import AddTypeModal from './AddTypeModal.js';
import AddModal from './AddModal.js';
import SidePanelExpenses from './SidePanelExpenses.js';
import Button from '@material-ui/core/Button';

import { get_all_totals, expenses_totals } from "../../Services/WebServices";


class SidePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTotals: {
        currentAvailable: 0,
        availableByAccount: {
          checking: [],
          savings: [],
          investments: [],
        },
        totalExpenses: 0,
        expensesByCategory: [],
        fundsByTypes: [],
        userAccounts: [],
        expensesCategories: [],
        fundSources: [],
      },
    };
    this.getAllTotals = this.getAllTotals.bind(this);
  }

  componentDidMount() {
    this.getAllTotals();
  };

  getAllTotals (timeframe){
    var params = {
      timeframe: timeframe,
      page: this.state.page
    }
    get_all_totals(params)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ allTotals: data.data })
          this.props.updateTotalExpenses(data.data.totalExpenses);
          this.props.updateCurrentAvailable(data.data.currentAvailable);
        }
      })
  }

  getExpensesTotals (timeframe){
    var params = { timeframe: timeframe, }
    expenses_totals(params)
      .then((res) => {
        var data = res.data;
        if(data.success){
          var allTotals = {...this.state.allTotals}
          allTotals.totalExpenses = Number(data.data.totalExpenses);
          allTotals.expensesByCategory = data.data.expensesByCategory;
          this.setState({allTotals})
          this.props.updateTotalExpenses(data.data.totalExpenses);
        }
      })
  }

  updateTimeframe (timeframe) {
    if(timeframe === 'month'){
      this.getExpensesTotals('month');
      this.props.updateTimeframe('month');
    }
    if(timeframe === 'year'){
      this.getExpensesTotals('year');
      this.props.updateTimeframe('year');
    }
  }

  render () {
    let noExpensesCategories = _.isEmpty(this.state.allTotals.expensesCategories);
    return (
      <React.Fragment>
        <Grid container spacing={1} style={this.props.open ? {cursor: 'pointer', "marginTop": "5px"} : { display: 'none' }}>
          <Grid item xs>
            <Box pl={3} pt={0.5}>
              <Button
                color="primary"
                onClick={() => this.updateTimeframe(this.props.timeframe)}
              >
                View: {this.props.timeframe}
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}}>
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <ReceiptIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={this.props.open ? {} : { display: 'none' }}>
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                {this.props.currentTimeframe.toUpperCase()} EXPENSES
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <Box style={ noExpensesCategories ? { display: 'none' } : {}}>
              <AddModal 
              type={'expenses'}
              expensesCategories={this.state.allTotals.expensesCategories}
              fundSources={this.state.allTotals.fundSources}
              userAccounts={this.state.allTotals.userAccounts}
              getAllTotals={this.getAllTotals}
              />
            </Box>
          </Grid>
        </Grid>
        <SidePanelExpenses 
          expensesByCategory={this.state.allTotals.expensesByCategory} 
          expensesCategories={this.state.allTotals.expensesCategories}
          open={this.props.open}
          getAllTotals={this.getAllTotals}
        />
        <Divider />
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}}>
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <AccountBalanceWalletIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={this.props.open ? {} : { display: 'none' }} >
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                CURRENT FUNDS
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <AddModal 
            type={'funds'}
            expensesCategories={this.state.allTotals.expensesCategories}
            fundSources={this.state.allTotals.fundSources}
            userAccounts={this.state.allTotals.userAccounts}
            getAllTotals={this.state.allTotals.getAllTotals}
            />
          </Grid>
        </Grid>
        <AddTypeModal 
          open={this.props.open}
          type={'account'}
          itemName={'account'}
          currentItems={this.state.allTotals.userAccounts}
          getAllTotals={this.getAllTotals}
        />
        <AddTypeModal 
          open={this.props.open}
          type={'source'}
          itemName={'source'}
          currentItems={this.state.allTotals.fundSources}
          getAllTotals={this.getAllTotals}
        />
        <Box style={ this.state.allTotals.availableByAccount.checking.length > 0 ? {'display': 'block'} : {'display': 'none'} }>
          <SidePanelAccount
            data={this.state.allTotals.availableByAccount.checking}
            open={this.props.open}
            type={'checking'}
            currentAvailable={this.state.allTotals.currentAvailable}
            userAccounts={this.state.allTotals.userAccounts}
            getAllTotals={this.getAllTotals}
          />
        </Box>
        <Box style={ this.state.allTotals.availableByAccount.savings.length > 0 ? {'display': 'block'} : {'display': 'none'} }>
          <SidePanelAccount
            style={ this.state.allTotals.availableByAccount.savings.length > 0 ? {'display': 'block'} : {'display': 'none'} }
            data={this.state.allTotals.availableByAccount.savings}
            open={this.props.open}
            type={'savings'}
            currentAvailable={this.state.allTotals.currentAvailable}
            userAccounts={this.state.allTotals.userAccounts}
            getAllTotals={this.getAllTotals}
          />
        </Box>
        <Box style={ this.state.allTotals.availableByAccount.investments.length > 0 ? {'display': 'block'} : {'display': 'none'} }>
          <SidePanelAccount
            style={ this.state.allTotals.availableByAccount.investments.length > 0 ? {'display': 'block'} : {'display': 'none'} }
            data={this.state.allTotals.availableByAccount.investments}
            open={this.props.open}
            type={'investments'}
            currentAvailable={this.state.allTotals.currentAvailable}
            userAccounts={this.state.allTotals.userAccounts}
            getAllTotals={this.getAllTotals}
          />
        </Box>
      </React.Fragment>
    )
  }
}

export default SidePanel;