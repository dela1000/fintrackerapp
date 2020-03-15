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
    const { classes, listingDataSelected, timeframe, totalAmountFound, totalExpenses, currentAvailable, availableByAccount, customOption } = this.props;
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
    let topSublineAmount = 0;
    let bottomSublineAmount = 0;
    let mainHeader = capitalize(listingDataSelected.type) + " - " + capitalize(timeframe);
    let topSubline = ""
    let bottomSubline = "";
    
    if(listingDataSelected.type === "expenses"){
      topSubline = "Average Daily " + capitalize(listingDataSelected.type);
      bottomSubline = capitalize(timeframe) + " Estimate";
      backgroundColor = "#FF504C";
      if(listingDataSelected.categoryId){
        topSubline = "Average Daily - " + capitalize(listingDataSelected.name);
        bottomSubline = "Month Estimate - " + capitalize(listingDataSelected.name);
      }
      if(timeframe === 'month'){
        today = moment();
        topSublineAmount = totalExpenses / today.format('D');
        let averageTotal = topSublineAmount * moment().daysInMonth();
        bottomSublineAmount = decimals(averageTotal);
      }

      if(timeframe === 'year'){
        let totalDays = moment().dayOfYear();
        topSublineAmount = totalExpenses / totalDays;
        let numOfDaysInYear = 365;
        if(moment().isLeapYear()){
          numOfDaysInYear = 366;
        }
        let avgYear = topSublineAmount * numOfDaysInYear
        bottomSublineAmount = decimals(avgYear);
      }
      if(timeframe === "custom"){
        topSubline = "Average Daily " + capitalize(listingDataSelected.type);
        bottomSubline = "";
        let totalDays = moment.duration(moment(listingDataSelected.endDate).diff(moment(listingDataSelected.startDate))).asDays() + 1;
        topSublineAmount = totalExpenses / totalDays;
        bottomSublineAmount = "";
      } else {
        mainHeader = capitalize(listingDataSelected.type) + " - " + timeframe;
      }
    }


    if (listingDataSelected.type === "funds") {
      backgroundColor = "#C6E0B4";
      if(timeframe === 'month'){
        topSubline = capitalize(timeframe) + " - Net Gain"
        topSublineAmount = totalAmountFound - totalExpenses;
        bottomSubline = "Net Gain %"
        let netGainPercentage = (-((totalExpenses / totalAmountFound) - 1)) * 100;
        netGainPercentage = decimals(netGainPercentage);
        netGainPercentage = netGainPercentage.toString();
        bottomSublineAmount = netGainPercentage + "%";
      }

        console.log("+++ 97 CenterHeader.js timeframe: ", timeframe)
        console.log("+++ 98 CenterHeader.js totalExpenses: ", totalExpenses)
        console.log("+++ 99 CenterHeader.js totalAmountFound: ", totalAmountFound)

      if(timeframe === 'year'){
        topSubline = "";
        topSublineAmount = "";
        bottomSubline = "";
        bottomSublineAmount = "";
      }

      if(timeframe === 'custom'){
        topSubline = "";
        topSublineAmount = "";
        bottomSubline = "";
        bottomSublineAmount = "";
      }
    }

    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: backgroundColor}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    {mainHeader}
                  </Typography>
                  <Typography component="p" variant="h4">
                    {decimals(totalAmountFound)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="subtitle1">
                    {topSubline}
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {decimals(topSublineAmount)}
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle1" style={ bottomSubline < 0 ? {color: 'red'} : {}}>
                    {bottomSubline}
                  </Typography>
                  <Typography component="p" variant="subtitle2">
                    {bottomSublineAmount}
                  </Typography>
                  
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: "#33C7FF"}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    Current Available
                  </Typography>
                  <Typography component="p" variant="h4" style={ currentAvailable > 0 ? {} : {color: "red"} }>
                    {decimals(currentAvailable)}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={totalSavings > 0 ? {} : {display: 'none'}}>
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
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(CenterHeader);