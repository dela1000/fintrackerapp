import React from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import { capitalize, decimals } from "../../Services/helpers";


const styles = theme => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 160,
  },
  depositContext: {
    flex: 1,
  },
})

class CenterHeader extends React.Component {
  
  render () {
    const { classes, listingDataSelected, timeframe, totalExpenses, currentAvailable, availableByAccount, customOption } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let backgroundColor = "";

    let totalSavings = 0;
    let savedThisYear = 0
    let totalInvestments = 0;
    if(availableByAccount.savings){
      _.forEach(availableByAccount.savings, (saving) => {
        totalSavings = totalSavings + saving.amount;
      })
    }

    if(availableByAccount.investments){
      _.forEach(availableByAccount.investments, (investment) => {
        totalInvestments = totalInvestments + investment.amount;
      })
    }

    let today = 0;
    let average = 0;
    let averageExpensesEstimate = 0;
    let mainHeader = capitalize(listingDataSelected.type) + " - " + timeframe;
    let averageHeader = "Average Daily " + capitalize(listingDataSelected.type);
    let monthEstimate = "Month Estimate";
    
    
    console.log("+++ 41 CenterHeader.js timeframe: ", timeframe)
    console.log("+++ 42 CenterHeader.js listingDataSelected: ", JSON.stringify(listingDataSelected, null, "\t"));
    if(listingDataSelected.type === "expenses"){
      backgroundColor = "#FF504C";
      if(listingDataSelected.categoryId){
        averageHeader = "Average Daily - " + capitalize(listingDataSelected.name);
        monthEstimate = "Month Estimate - " + capitalize(listingDataSelected.name);
      }

      if(timeframe === 'custom'){
        mainHeader = capitalize(listingDataSelected.type) + " - " + customOption;
        monthEstimate = "Total Estimate - " + capitalize(listingDataSelected.name);
      } else {
        mainHeader = capitalize(listingDataSelected.type) + " - " + timeframe;
      }

      if(timeframe === 'month'){
        today = moment();
        average = totalExpenses/today.format('D');
        averageExpensesEstimate = average*moment().daysInMonth();
      }

      if(timeframe === 'year'){
        let totalDays = moment().dayOfYear();
        average = totalExpenses/totalDays;
        let numOfDaysInYear = 365;
        if(moment().isLeapYear()){
          numOfDaysInYear = 366;
        }
        averageExpensesEstimate = average*numOfDaysInYear;
      }
      if(timeframe === "custom"){
        let totalDays = moment.duration(moment(listingDataSelected.endDate).diff(moment(listingDataSelected.startDate))).asDays() + 1;
        average = totalExpenses/totalDays;
        averageExpensesEstimate = average*totalDays;
      }
    }
    if (listingDataSelected.type === "funds") {
      backgroundColor = "#C6E0B4";
    }

    return (
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: backgroundColor}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    {mainHeader}
                  </Typography>
                  <Typography component="p" variant="h4">
                    {decimals(totalExpenses)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="subtitle1">
                    {averageHeader}
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(average)}
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle1">
                    {monthEstimate}
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(averageExpensesEstimate)}
                  </Typography>
                  
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: "#33C7FF"}}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography color="textSecondary">
                    Current Available
                  </Typography>
                  <Typography component="p" variant="h4" style={ currentAvailable > 0 ? {} : {color: "red"} }>
                    {decimals(currentAvailable)}
                  </Typography>
                </Grid>
                <Grid item xs={4} style={totalSavings > 0 ? {} : {display: 'none'}}>
                  <Typography color="textSecondary" variant="subtitle1">
                    Total Savings
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(totalSavings)}
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle1">
                    Total Investments
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(totalInvestments)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="textSecondary" variant="subtitle1">
                    Saved this year
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(savedThisYear)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(CenterHeader);