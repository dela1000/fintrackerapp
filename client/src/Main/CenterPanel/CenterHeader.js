import React from 'react';
import clsx from 'clsx';
import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import { decimals } from "../../Services/helpers";


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
  constructor(props) {
    super(props);
    
    this.state = {
      header: ""
    }
  }
  componentDidUpdate(){
    if(this.props.customOption.length > 0){
      this.state.header = "Expenses - " + this.props.customOption;
    } else {
      this.state.header = "Expenses - " + this.props.timeframe;
    }
  }
  
  render () {
    const { classes, listingDataSelected, timeframe, totalExpenses, currentAvailable } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let today = 0;
    let average = 0;
    let averageExpensesEstimate = 0;
  
    if(timeframe === 'month'){
      today = moment();
      average = totalExpenses/today.format('D');
    }

    if(timeframe === 'year'){
      let totalDays = moment().dayOfYear();
      average = totalExpenses/totalDays;
    }
    if(timeframe === "custom"){
      let totalDays = moment.duration(moment(listingDataSelected.endDate).diff(moment(listingDataSelected.startDate))).asDays() + 1;
      average = totalExpenses/totalDays;
    }
    averageExpensesEstimate = average*moment().daysInMonth();

    return (
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: "#FF504C"}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    {this.state.header}
                  </Typography>
                  <Typography component="p" variant="h4">
                    {decimals(totalExpenses)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    Average Daily Expenses
                  </Typography>
                  <Typography component="p" variant="h6">
                    {decimals(average)}
                  </Typography>
                  <Typography color="textSecondary">
                    Monthly Expenses Estimate
                  </Typography>
                  <Typography component="p" variant="h6">
                    {decimals(averageExpensesEstimate)}
                  </Typography>
                  
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: "#C6E0B4"}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    Current Available
                  </Typography>
                  <Typography component="p" variant="h4" style={ currentAvailable > 0 ? {} : {color: "red"} }>
                    {decimals(currentAvailable)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  more stuff
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