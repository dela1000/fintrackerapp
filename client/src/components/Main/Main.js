import React from 'react';
import PropTypes from "prop-types";
import _ from "lodash";
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

class Main extends React.Component {

  static propTypes = {
    availableByAccount: PropTypes.object,
    expensesByCategory: PropTypes.array,
    fundsByTypes: PropTypes.array,
    availableByAccount: PropTypes.array,
  };

  constructor(props) {
    super(props);

    this.state = {
      availableByAccount: {
        checking: [],
        savings: [],
        investments: [],
      },
      expensesByCategory: [],
      fundsByTypes: [],
    };
  };

  componentWillMount() {
    axios.get('/all_totals')
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({
            availableByAccount: data.data.availableByAccount,
            expensesByCategory: data.data.expensesByCategory,
            fundsByTypes: data.data.fundsByTypes,
          }, () => {
            console.log("+++ 44 Main.js this.state.availableByAccount: ", this.state.availableByAccount)
          })
        }
      })
  }
  capitalize(str){
    return str.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  };

  decimals(num){
    return num.toFixed(2)
  }

  render () {
    return (
      <Grid container spacing={1}>
      <Grid item xs={2}>
        <Paper>
          <Typography variant="h6" noWrap>
            Checking
          </Typography>
          <List>
            {this.state.availableByAccount.checking.map((item, index) => (
              <ListItem button key={index}>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6" noWrap>
            Savings
          </Typography>
          <List>
            {this.state.availableByAccount.savings.map((item, index) => (
              <ListItem button key={index}>
                <ListItemIcon>
                  <AccountBalanceIcon />
                </ListItemIcon>
                <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6" noWrap>
            Investments
          </Typography>
          <List>
            {this.state.availableByAccount.investments.map((item, index) => (
              <ListItem button key={index}>
                <ListItemIcon>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText primary={this.capitalize(item.account)} secondary={this.decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={7}>
        <Paper>xs</Paper>
      </Grid>
      <Grid item xs={3}>
        <Paper>xs</Paper>
      </Grid>
    </Grid>
    )
  }
}


export default Main;