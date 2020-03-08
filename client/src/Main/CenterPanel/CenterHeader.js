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
  
  render () {
    const { classes, currentTimeframe, totalExpenses, currentAvailable } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let today = 0;
    let average = 0;
    let averageExpensesEstimate = 0;
  
    if(currentTimeframe === 'month'){
      today = moment();
      average = totalExpenses/today.format('D');
      averageExpensesEstimate = average*moment().daysInMonth();
    }

    if(currentTimeframe === 'year'){
      today = moment().dayOfYear();
      console.log("+++ 48 CenterHeader.js today: ", today)
      average = totalExpenses/today;
      averageExpensesEstimate = average*moment().daysInMonth();
    }

    return (
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={fixedHeightPaper} style={{backgroundColor: "#FF504C"}}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">
                    Expenses this {currentTimeframe}
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
                  <Typography component="p" variant="h4">
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