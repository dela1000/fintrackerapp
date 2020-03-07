import React from 'react';
import _ from 'lodash'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SidePanelItem from './SidePanelItem.js';
import AddTypeModal from './AddTypeModal.js';
import AddModal from './AddModal.js';
import SidePanelExpenses from './SidePanelExpenses.js';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';

import { get_all_totals, get_expenses, get_funds } from "../../Services/WebServices";


class SidePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTotals: {
        currentAvailable: "",
        availableByAccount: {
          checking: [],
          savings: [],
          investments: [],
        },
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

  getAllTotals (){
    get_all_totals()
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({ allTotals: data.data })
        }
      })
  }

  render () {
    let noExpensesCategories = _.isEmpty(this.state.allTotals.expensesCategories);
    return (
      <React.Fragment>
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}}>
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <ReceiptIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={this.props.open ? { display: 'block' } : { display: 'none' }}>
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                EXPENSES
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <Box style={ noExpensesCategories ? { display: 'none' } : { display: 'block' }}>
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
          <Grid item xs={8} style={this.props.open ? { display: 'block' } : { display: 'none' }} >
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                FUNDS
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
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
          <SidePanelItem
            data={this.state.allTotals.availableByAccount.checking}
            open={this.props.open}
            type={'checking'}
            currentAvailable={this.state.allTotals.currentAvailable}
          />
        </Box>
        <Box style={ this.state.allTotals.availableByAccount.savings.length > 0 ? {'display': 'block'} : {'display': 'none'} }>
          <SidePanelItem
            style={ this.state.allTotals.availableByAccount.savings.length > 0 ? {'display': 'block'} : {'display': 'none'} }
            data={this.state.allTotals.availableByAccount.savings}
            open={this.props.open}
            type={'savings'}
            currentAvailable={this.state.allTotals.currentAvailable}
          />
        </Box>
        <Box style={ this.state.allTotals.availableByAccount.investments.length > 0 ? {'display': 'block'} : {'display': 'none'} }>
          <SidePanelItem
            style={ this.state.allTotals.availableByAccount.investments.length > 0 ? {'display': 'block'} : {'display': 'none'} }
            data={this.state.allTotals.availableByAccount.investments}
            open={this.props.open}
            type={'investments'}
            currentAvailable={this.state.allTotals.currentAvailable}
          />
        </Box>
      </React.Fragment>
    )
  }
}

export default SidePanel;