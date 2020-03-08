import React from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { decimals } from "../../Services/helpers";

import CenterHeader from './CenterHeader.js';
import ListingData from './ListingData.js';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
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
}));

export default function CenterPanel(props) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  let today = moment();
  let avgThisMonth = props.currentAvailable/today.format('D');
  let averageExpensesEstimate = avgThisMonth*moment().daysInMonth();
  return (
    <React.Fragment>
      <CenterHeader 
        currentTimeframe={props.currentTimeframe}
        totalExpenses={props.totalExpenses}
        currentAvailable={props.currentAvailable}
      />
    </React.Fragment>
  )
}


      // <Grid container spacing={3}>
      //   <Grid item xs={12}>
      //     <Paper className={classes.paper}>
      //       <ListingData 
      //         viewSelected={props.viewSelected}
      //         listingData={props.tableData}
      //         timeframe={props.timeframe}
      //         selectCategory={props.selectCategory}
      //         selectAccount={props.selectAccount}
      //       />
      //     </Paper>
      //   </Grid>
      // </Grid>